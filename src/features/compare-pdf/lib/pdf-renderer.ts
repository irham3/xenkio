import { getPdfjs } from '@/lib/pdf-worker';
import { PdfInfo, RenderedPage } from '../types';

export async function loadPdfInfo(file: File): Promise<PdfInfo> {
    const pdfjsLib = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    return {
        file,
        numPages: pdf.numPages,
        name: file.name,
        size: file.size,
    };
}

export async function renderPdfPage(
    file: File,
    pageNumber: number,
    scale: number
): Promise<RenderedPage> {
    const pdfjsLib = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    // Keep page rendering opaque so overlay opacity behaves predictably at 0-100%.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport } as any).promise;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    return {
        pageNumber,
        imageData,
        width: canvas.width,
        height: canvas.height,
        dataUrl,
    };
}
