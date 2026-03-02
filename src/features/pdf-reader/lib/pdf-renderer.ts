import type { PDFDocumentProxy } from 'pdfjs-dist';

let pdfjsInitialized = false;

async function initPdfjs(): Promise<typeof import('pdfjs-dist')> {
    const pdfjsLib = await import('pdfjs-dist');
    if (!pdfjsInitialized) {
        const version = pdfjsLib.version;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
        pdfjsInitialized = true;
    }
    return pdfjsLib;
}

export async function loadPdf(file: File): Promise<PDFDocumentProxy> {
    const pdfjsLib = await initPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    return loadingTask.promise;
}

export async function renderPage(
    pdfDoc: PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number
): Promise<void> {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not get canvas 2d context');
    }

    const renderContext = {
        canvas,
        canvasContext: context,
        viewport,
    };

    await page.render(renderContext).promise;
}
