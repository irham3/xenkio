"use client"

import { useState, useCallback } from 'react'
import { WordFile, ConversionStatus } from '../types'

export function useWordToPdf() {
    const [status, setStatus] = useState<ConversionStatus>('idle')
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

    const convertToPdf = useCallback(async (wordFile: WordFile) => {
        setStatus('processing');
        setProgress(10);
        setError(null);
        setPdfBlob(null);

        let container: HTMLDivElement | null = null;

        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await wordFile.file.arrayBuffer();

            setProgress(30);

            // Import docx-preview for accurate DOCX rendering
            const docxPreview = await import('docx-preview');

            // Create a container to render the DOCX
            container = document.createElement('div');
            container.id = 'docx-preview-container';

            // Style container for A4-like rendering
            Object.assign(container.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '794px', // A4 width at 96dpi
                backgroundColor: 'white',
                zIndex: '9999',
                overflow: 'visible',
                // Hide during initial render
                visibility: 'hidden'
            });

            document.body.appendChild(container);

            setProgress(50);

            // Render DOCX to the container with docx-preview
            // This preserves much more of the original styling
            await docxPreview.renderAsync(arrayBuffer, container, undefined, {
                className: 'docx-preview-wrapper',
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
                ignoreFonts: false,
                breakPages: true,
                ignoreLastRenderedPageBreak: false,
                experimental: false,
                trimXmlDeclaration: true,
                useBase64URL: true,
                renderHeaders: true,
                renderFooters: true,
                renderFootnotes: true,
                renderEndnotes: true,
            });

            setProgress(70);

            // Wait for fonts and images to load
            await new Promise(resolve => setTimeout(resolve, 500));

            // Make container visible for html2canvas capture
            container.style.visibility = 'visible';

            // Wait a tick for repaint
            await new Promise(resolve => setTimeout(resolve, 100));

            // Import jspdf and html2canvas
            const { jsPDF } = await import('jspdf');
            const html2canvasModule = await import('html2canvas');
            const html2canvas = html2canvasModule.default;

            setProgress(80);

            // Find all page wrappers rendered by docx-preview
            const pages = container.querySelectorAll('.docx-wrapper > section.docx');

            if (pages.length === 0) {
                // Fallback: capture the entire container
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: 794,
                    windowWidth: 794
                });

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasHeight = canvas.height;
                const canvasWidth = canvas.width;

                const renderWidth = pdfWidth;
                const renderHeight = (canvasHeight * pdfWidth) / canvasWidth;

                const pageCount = Math.ceil(renderHeight / pdfHeight);

                const imgData = canvas.toDataURL('image/jpeg', 0.95);

                for (let i = 0; i < pageCount; i++) {
                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, -i * pdfHeight, renderWidth, renderHeight);
                }

                setPdfBlob(pdf.output('blob'));
            } else {
                // Capture each page separately for better quality
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i] as HTMLElement;

                    const canvas = await html2canvas(page, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);

                    // Calculate dimensions to fit A4
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;

                    let renderWidth = pdfWidth;
                    let renderHeight = (canvasHeight * pdfWidth) / canvasWidth;

                    // If content is taller than page, scale to fit
                    if (renderHeight > pdfHeight) {
                        renderHeight = pdfHeight;
                        renderWidth = (canvasWidth * pdfHeight) / canvasHeight;
                    }

                    if (i > 0) pdf.addPage();

                    // Center the content on the page
                    const xOffset = (pdfWidth - renderWidth) / 2;
                    const yOffset = 0;

                    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight);
                }

                setPdfBlob(pdf.output('blob'));
            }

            setProgress(100);
            setStatus('completed');

        } catch (err: unknown) {
            console.error('Conversion error:', err);
            setError(err instanceof Error ? err.message : 'Conversion failed. Please ensure the file is a valid Word document (.docx).');
            setStatus('error');
        } finally {
            if (container && document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setProgress(0);
        setError(null);
        setPdfBlob(null);
    }, []);

    return {
        convertToPdf,
        reset,
        status,
        progress,
        error,
        pdfBlob
    };
}
