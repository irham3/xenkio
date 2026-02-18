import { PDFDocument } from 'pdf-lib';
import { CompressionSettings } from '../types';

// Scale factor for rendering PDF pages (affects resolution)
const SCALE_MAP: Record<string, number> = {
    low: 2.0,    // High resolution, minimal compression
    medium: 1.5, // Balanced
    high: 1.0,   // Lower resolution, max compression
};

// JPEG quality for each level
const QUALITY_MAP: Record<string, number> = {
    low: 0.85,
    medium: 0.55,
    high: 0.30,
};

/**
 * Initialize the pdfjs-dist library with the worker
 */
async function initPdfWorker() {
    const pdfjsLib = await import('pdfjs-dist');
    const version = pdfjsLib.version || '5.4.624';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    return pdfjsLib;
}

/**
 * Render a single PDF page to a JPEG blob via canvas.
 */
async function renderPageToJpeg(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDoc: any,
    pageNum: number,
    scale: number,
    quality: number
): Promise<{ blob: Blob; width: number; height: number }> {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not create canvas context');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport } as any).promise;

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
    });

    if (!blob) throw new Error(`Failed to render page ${pageNum}`);

    // Clean up
    canvas.width = 0;
    canvas.height = 0;

    return { blob, width: viewport.width, height: viewport.height };
}

/**
 * Compress a PDF by rendering each page as JPEG and reassembling.
 * This produces significantly smaller files, especially for image-heavy PDFs.
 */
export async function compressPdf(
    file: File,
    settings: CompressionSettings,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    const quality = QUALITY_MAP[settings.level] ?? 0.55;
    const scale = SCALE_MAP[settings.level] ?? 1.5;

    // 1. Load the PDF using pdfjs-dist for rendering
    const pdfjsLib = await initPdfWorker();
    const arrayBuffer = await file.arrayBuffer();
    const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfJsDoc.numPages;

    // 2. Create a new PDF document
    const newPdfDoc = await PDFDocument.create();

    // 3. Render each page → JPEG → embed in new PDF
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const { blob, width, height } = await renderPageToJpeg(
            pdfJsDoc, pageNum, scale, quality
        );

        // Convert blob to Uint8Array
        const jpegBytes = new Uint8Array(await blob.arrayBuffer());

        // Embed in the new PDF
        const jpegImage = await newPdfDoc.embedJpg(jpegBytes);

        // Add a page with the same dimensions as the rendered page
        // Convert from px (at 72 DPI equivalent) to PDF points
        const page = newPdfDoc.addPage([width, height]);
        page.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });

        // Report progress
        onProgress?.(Math.round((pageNum / numPages) * 100));
    }

    // 4. Set minimal metadata if removing metadata
    if (settings.removeMetadata) {
        newPdfDoc.setTitle('');
        newPdfDoc.setAuthor('');
        newPdfDoc.setSubject('');
        newPdfDoc.setKeywords([]);
        newPdfDoc.setProducer('');
        newPdfDoc.setCreator('');
    }

    // 5. Save with object streams for additional structural compression
    const pdfBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
    });

    return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
