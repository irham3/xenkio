import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { getPdfjs } from '@/lib/pdf-worker';
import { PdfFile, SplitMode, SplitOptions } from '../types';

export function useSplitPdf() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const loadPdf = async (file: File): Promise<PdfFile> => {
        const arrayBuffer = await file.arrayBuffer();

        // Load with pdf-lib for splitting
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Load with pdf.js for rendering (Performance optimization)
        let pdfjsDoc;
        try {
            const pdfjsLib = await getPdfjs();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
            pdfjsDoc = await loadingTask.promise;
        } catch (error) {
            console.warn("Failed to load optimized PDF preview:", error);
        }

        return {
            file,
            name: file.name,
            size: file.size,
            pageCount: pdfDoc.getPageCount(),
            previewUrls: [],
            arrayBuffer,
            pdfDocument: pdfjsDoc
        };
    };

    const splitPdf = async (
        pdfFile: PdfFile,
        mode: SplitMode,
        options: SplitOptions
    ): Promise<Blob[]> => {
        setIsProcessing(true);
        setProgress(0);

        try {
            const blobs: Blob[] = [];
            const srcDoc = await PDFDocument.load(pdfFile.arrayBuffer);
            const totalPages = srcDoc.getPageCount();
            const order = options.pageOrder || Array.from({ length: totalPages }, (_, i) => i + 1);

            // Helper to parsing range string "1-3, 5" -> Indices of original pages
            const parseRanges = (rangesStr: string): number[][] => {
                const chunks: number[][] = [];
                const parts = rangesStr.split(',');

                parts.forEach(part => {
                    const indices: number[] = [];
                    const [start, end] = part.split('-').map(str => parseInt(str.trim()));

                    if (!isNaN(start)) {
                        const finalEnd = isNaN(end) ? start : end;
                        for (let i = start; i <= finalEnd; i++) {
                            if (i >= 1 && i <= order.length) {
                                const actualPageNum = order[i - 1]; // Visual 1-based to order array 0-based
                                indices.push(actualPageNum - 1); // 0-indexed for pdf-lib
                            }
                        }
                    }
                    if (indices.length > 0) chunks.push(indices);
                });
                return chunks;
            };

            if (mode === 'custom') {
                const rangeChunks = parseRanges(options.ranges || "");

                if (options.splitEachPage) {
                    // Extract every selected page as a separate PDF
                    const allIndices = rangeChunks.flat();
                    for (const idx of allIndices) {
                        const newDoc = await PDFDocument.create();
                        const [copiedPage] = await newDoc.copyPages(srcDoc, [idx]);
                        newDoc.addPage(copiedPage);
                        const pdfBytes = await newDoc.save();
                        blobs.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
                    }
                } else if (options.mergeOutput) {
                    const newDoc = await PDFDocument.create();
                    const allIndices = rangeChunks.flat();
                    if (allIndices.length > 0) {
                        const copiedPages = await newDoc.copyPages(srcDoc, allIndices);
                        copiedPages.forEach(page => newDoc.addPage(page));
                        const pdfBytes = await newDoc.save();
                        blobs.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
                    }
                } else {
                    for (const indices of rangeChunks) {
                        const newDoc = await PDFDocument.create();
                        const copiedPages = await newDoc.copyPages(srcDoc, indices);
                        copiedPages.forEach(page => newDoc.addPage(page));
                        const pdfBytes = await newDoc.save();
                        blobs.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
                    }
                }

            } else if (mode === 'fixed_size') {
                const limitBytes = (options.limitSize || 5) * 1024 * 1024;

                let currentDoc = await PDFDocument.create();
                let currentPagesCount = 0;

                for (let i = 0; i < order.length; i++) {
                    const actualIdx = order[i] - 1;
                    const [copiedPage] = await currentDoc.copyPages(srcDoc, [actualIdx]);
                    currentDoc.addPage(copiedPage);
                    currentPagesCount++;

                    const currentBytes = await currentDoc.save();

                    if (currentBytes.byteLength > limitBytes) {
                        if (currentPagesCount === 1) {
                            blobs.push(new Blob([currentBytes as unknown as BlobPart], { type: 'application/pdf' }));
                            currentDoc = await PDFDocument.create();
                            currentPagesCount = 0;
                        } else {
                            currentDoc.removePage(currentPagesCount - 1);
                            const safeBytes = await currentDoc.save();
                            blobs.push(new Blob([safeBytes as unknown as BlobPart], { type: 'application/pdf' }));

                            currentDoc = await PDFDocument.create();
                            const [retryPage] = await currentDoc.copyPages(srcDoc, [actualIdx]);
                            currentDoc.addPage(retryPage);
                            currentPagesCount = 1;
                        }
                    }

                    setProgress(Math.round(((i + 1) / order.length) * 100));
                }

                if (currentPagesCount > 0) {
                    const finalBytes = await currentDoc.save();
                    blobs.push(new Blob([finalBytes as unknown as BlobPart], { type: 'application/pdf' }));
                }
            }

            return blobs;
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    };

    return {
        loadPdf,
        splitPdf,
        isProcessing,
        progress
    };
}
