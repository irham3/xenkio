import JSZip from 'jszip';
import { ConversionOptions, ConversionResult, PagePreview } from '../types';

// Initialize worker
const initPdfWorker = async () => {
    const pdfjsLib = await import('pdfjs-dist');
    const version = pdfjsLib.version || '5.4.624';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    return pdfjsLib;
};

export async function convertPdfToImages(
    file: File,
    options: ConversionOptions,
    onProgress: (progress: number) => void
): Promise<ConversionResult> {
    const pdfjsLib = await initPdfWorker();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const images: PagePreview[] = [];
    const zip = new JSZip();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: options.scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create canvas context');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render(renderContext as any).promise;

        // Convert canvas to blob
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(
                (b) => resolve(b),
                options.format === 'png' ? 'image/png' : 'image/jpeg',
                options.quality
            );
        });

        if (!blob) throw new Error(`Failed to generate image for page ${pageNum}`);

        const imageUrl = URL.createObjectURL(blob);
        const fileName = `page-${pageNum}.${options.format}`;

        images.push({
            pageNumber: pageNum,
            width: viewport.width,
            height: viewport.height,
            imageUrl,
            blob,
        });

        zip.file(fileName, blob);

        // Update progress
        onProgress(Math.round((pageNum / numPages) * 100));
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const zipFileName = `${baseName}-images.zip`;

    return {
        images,
        zipBlob,
        zipFileName,
    };
}
