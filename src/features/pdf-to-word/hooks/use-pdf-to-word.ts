"use client"

import { useState, useCallback } from 'react'
import {
    PdfFile,
    ConversionResult,
    ConversionStatus
} from '../types'


export function usePdfToWord() {
    const [status, setStatus] = useState<ConversionStatus>('idle')
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<ConversionResult | null>(null)

    const convertWithClient = async (pdfFile: PdfFile): Promise<Blob> => {
        // Dynamic imports for client-side conversion
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } = await import('docx');
        const pdfjsLib = await import('pdfjs-dist');
        const version = pdfjsLib.version || '5.4.624';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ data: pdfFile.arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const allParagraphs: InstanceType<typeof Paragraph>[] = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1 });
            const pageHeight = viewport.height;

            // Group text items by line (Y position)
            const lines = new Map<number, Array<{ text: string; fontName: string; fontSize: number }>>();
            const LINE_TOLERANCE = 5;

            for (const item of textContent.items) {
                if (!('str' in item) || !item.str.trim()) continue;

                // Type assertion after narrowing
                const textItem = item as { str: string; fontName: string; transform: number[] };

                const t = textItem.transform;
                const fontSize = Math.sqrt(t[0] ** 2 + t[1] ** 2);
                const y = Math.round((pageHeight - t[5]) / LINE_TOLERANCE) * LINE_TOLERANCE;

                if (!lines.has(y)) lines.set(y, []);
                lines.get(y)!.push({
                    text: textItem.str,
                    fontName: textItem.fontName,
                    fontSize
                });
            }

            // Sort lines by Y position and create paragraphs
            const sortedLines = Array.from(lines.entries()).sort(([a], [b]) => a - b);

            for (const [, lineItems] of sortedLines) {
                const textRuns = lineItems.map(item => {
                    const isBold = /bold|black|heavy/i.test(item.fontName);
                    const isItalic = /italic|oblique/i.test(item.fontName);

                    return new TextRun({
                        text: item.text + ' ',
                        bold: isBold,
                        italics: isItalic,
                        size: Math.round(item.fontSize * 2)
                    });
                });

                // Detect heading
                const avgFontSize = lineItems.reduce((s, i) => s + i.fontSize, 0) / lineItems.length;
                const isAllBold = lineItems.every(i => /bold|black|heavy/i.test(i.fontName));

                let heading: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2 | typeof HeadingLevel.HEADING_3 | undefined;
                if (avgFontSize >= 18) heading = HeadingLevel.HEADING_1;
                else if (avgFontSize >= 14 && isAllBold) heading = HeadingLevel.HEADING_2;
                else if (avgFontSize >= 12 && isAllBold) heading = HeadingLevel.HEADING_3;

                allParagraphs.push(new Paragraph({
                    children: textRuns,
                    heading,
                    spacing: { after: 100 }
                }));
            }

            // Page break between pages
            if (pageNum < numPages) {
                allParagraphs.push(new Paragraph({ children: [], pageBreakBefore: true }));
            }

            setProgress(Math.round((pageNum / numPages) * 80));
        }

        // Create document
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(1),
                            right: convertInchesToTwip(1),
                            bottom: convertInchesToTwip(1),
                            left: convertInchesToTwip(1),
                        }
                    }
                },
                children: allParagraphs
            }]
        });

        return await Packer.toBlob(doc);
    };

    // Main conversion function
    const convertToWord = useCallback(async (pdfFile: PdfFile): Promise<void> => {
        setStatus('processing');
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            // Use client-side conversion
            const blob = await convertWithClient(pdfFile);

            const fileName = pdfFile.name.replace(/\.pdf$/i, '') + '.docx';

            // Count words (approximate)
            let wordCount = 0;
            try {
                const pdfjsLib = await import('pdfjs-dist');
                const version = pdfjsLib.version || '5.4.624';
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
                const loadingTask = pdfjsLib.getDocument({ data: pdfFile.arrayBuffer });
                const pdf = await loadingTask.promise;

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const text = textContent.items
                        .filter(item => 'str' in item && typeof (item as { str: unknown }).str === 'string')
                        .map(item => (item as { str: string }).str)
                        .join(' ');
                    wordCount += text.split(/\s+/).filter(w => w.length > 0).length;
                }
            } catch {
                wordCount = 0;
            }

            setResult({
                blob,
                fileName,
                pageCount: pdfFile.pageCount,
                wordCount
            });

            setProgress(100);
            setStatus('completed');

            console.log('Conversion completed using client method');
        } catch (err: unknown) {
            console.error('Conversion error:', err);
            setError(err instanceof Error ? err.message : 'Conversion failed');
            setStatus('error');
        }
    }, []);

    const downloadResult = useCallback(async () => {
        if (!result) return;
        try {
            const fs = await import('file-saver');
            fs.saveAs(result.blob, result.fileName);
        } catch {
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [result]);

    const reset = useCallback(() => {
        setStatus('idle');
        setProgress(0);
        setError(null);
        setResult(null);
    }, []);

    return {
        convertToWord,
        downloadResult,
        status,
        progress,
        error,
        result,
        reset
    };
}
