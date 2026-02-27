import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { getPdfjs } from '@/lib/pdf-worker';
import { PdfFile, CropRect, PageDimensions } from '../types';

export function useCropPdf() {
    const [isProcessing, setIsProcessing] = useState(false);

    const loadPdf = useCallback(async (file: File): Promise<PdfFile> => {
        const arrayBuffer = await file.arrayBuffer();

        // Load with pdf-lib for manipulation
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Load with pdf.js for rendering
        let pdfjsDoc;
        try {
            const pdfjsLib = await getPdfjs();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
            pdfjsDoc = await loadingTask.promise;
        } catch (error) {
            console.warn('Failed to load PDF preview:', error);
        }

        return {
            file,
            name: file.name,
            size: file.size,
            pageCount: pdfDoc.getPageCount(),
            arrayBuffer,
            pdfDocument: pdfjsDoc,
        };
    }, []);

    const getPageDimensions = useCallback(async (pdfFile: PdfFile): Promise<PageDimensions[]> => {
        const pdfDoc = await PDFDocument.load(pdfFile.arrayBuffer);
        const pages = pdfDoc.getPages();

        return pages.map((page) => {
            const { width, height } = page.getSize();
            return { width, height };
        });
    }, []);

    const cropPdf = useCallback(async (
        pdfFile: PdfFile,
        cropRects: Map<number, CropRect>,
        pageDimensions: PageDimensions[]
    ): Promise<Blob> => {
        setIsProcessing(true);

        try {
            const pdfDoc = await PDFDocument.load(pdfFile.arrayBuffer);
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const crop = cropRects.get(i);
                const dims = pageDimensions[i];

                if (crop && dims) {
                    // PDF coordinate system: origin at bottom-left
                    // Our crop rect: origin at top-left
                    const pdfX = crop.x;
                    const pdfY = dims.height - crop.y - crop.height;

                    page.setCropBox(pdfX, pdfY, crop.width, crop.height);
                    page.setMediaBox(pdfX, pdfY, crop.width, crop.height);
                }
            }

            const pdfBytes = await pdfDoc.save();
            return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return {
        loadPdf,
        getPageDimensions,
        cropPdf,
        isProcessing,
    };
}
