
import { PDFDocument } from 'pdf-lib';
import { getPdfjs } from '@/lib/pdf-worker';
import { PDFSignature } from '../types';

export async function renderPdfPages(file: File): Promise<string[]> {
    const pdfjsLib = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageImages: string[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5; // Better quality for preview
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) continue;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render(renderContext as any).promise;
        pageImages.push(canvas.toDataURL('image/jpeg', 0.8));
    }

    return pageImages;
}

export async function embedSignature(file: File, signatures: PDFSignature[]): Promise<Uint8Array> {
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);

    // Group signatures by page
    const signaturesByPage: Record<number, PDFSignature[]> = {};
    signatures.forEach(sig => {
        if (!signaturesByPage[sig.pageIndex]) signaturesByPage[sig.pageIndex] = [];
        signaturesByPage[sig.pageIndex].push(sig);
    });

    const pages = pdfDoc.getPages();

    for (const pageIndexStr in signaturesByPage) {
        const pageIndex = parseInt(pageIndexStr, 10);
        if (pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { height } = page.getSize();

        // Signatures coordinates are likely from the Preview Image which might be scaled but we stored x/y relative to viewport
        // Wait, the client side logic must provide coordinates relative to the PDF Page Points, OR percentages.
        // Let's assume standard PDF points input. If preview is scaled, we must adjust.
        // I will assume the `signatures` array has x, y, width, height in PDF Points relative to the page size.
        // The client component is responsible for scaling factors.

        const pageSignatures = signaturesByPage[pageIndex];

        for (const sig of pageSignatures) {
            const pngImage = await pdfDoc.embedPng(sig.dataUrl);

            // PDF-Lib coordinates: (0,0) is bottom-left.
            // Browser DOM coordinates: (0,0) is top-left.
            // So y must be flipped: pdfY = pageHeight - domY - sigHeight

            // We assume `sig.y` passed here IS ALREADY corrected or is DOM Y.
            // It's safer if `sig.y` is DOM Y (top-left based), and we convert it here.

            const pdfY = height - sig.y - sig.height;

            page.drawImage(pngImage, {
                x: sig.x,
                y: pdfY,
                width: sig.width,
                height: sig.height,
            });
        }
    }

    return await pdfDoc.save();
}
