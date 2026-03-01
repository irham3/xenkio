import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
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
            const pdfjsLib = await import("pdfjs-dist");
            const version = pdfjsLib.version || '5.4.624';
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
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

                // Phase 1 (0–40%): Pre-compute estimated size for each individual page.
                // We save a single-page doc per page — O(N) small saves instead of
                // the old O(N²) approach of re-serializing a growing document every iteration.
                const pageSizes: number[] = [];
                for (let i = 0; i < order.length; i++) {
                    const actualIdx = order[i] - 1;
                    const singlePageDoc = await PDFDocument.create();
                    const [p] = await singlePageDoc.copyPages(srcDoc, [actualIdx]);
                    singlePageDoc.addPage(p);
                    const singleBytes = await singlePageDoc.save();
                    pageSizes.push(singleBytes.byteLength);
                    setProgress(Math.round(((i + 1) / order.length) * 40));
                }

                // Phase 2 (40–100%): Build chunks by accumulating estimated sizes.
                // Only call .save() once per finalized chunk, not on every page.
                let chunkIndices: number[] = [];
                let chunkEstimatedSize = 0;

                const finalizeChunk = async (indices: number[]) => {
                    const chunkDoc = await PDFDocument.create();
                    const pages = await chunkDoc.copyPages(srcDoc, indices);
                    pages.forEach(page => chunkDoc.addPage(page));
                    const pdfBytes = await chunkDoc.save();
                    blobs.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
                };

                for (let i = 0; i < order.length; i++) {
                    const actualIdx = order[i] - 1;
                    const pageEstimate = pageSizes[i];

                    // If adding this page would exceed the limit, flush current chunk first.
                    // A single oversized page is kept as its own chunk.
                    if (chunkIndices.length > 0 && chunkEstimatedSize + pageEstimate > limitBytes) {
                        await finalizeChunk(chunkIndices);
                        chunkIndices = [];
                        chunkEstimatedSize = 0;
                    }

                    chunkIndices.push(actualIdx);
                    chunkEstimatedSize += pageEstimate;
                    setProgress(40 + Math.round(((i + 1) / order.length) * 60));
                }

                // Flush the last remaining chunk
                if (chunkIndices.length > 0) {
                    await finalizeChunk(chunkIndices);
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
