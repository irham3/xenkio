'use client';

import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPage } from '../lib/pdf-renderer';

interface PdfViewerProps {
    pdfDoc: PDFDocumentProxy;
    currentPage: number;
    zoom: number;
    isFullscreen?: boolean;
}

export function PdfViewer({ pdfDoc, currentPage, zoom, isFullscreen }: PdfViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !pdfDoc) return;

        let cancelled = false;

        async function render(): Promise<void> {
            if (cancelled || !canvas) return;
            try {
                await renderPage(pdfDoc, currentPage, canvas, zoom);
            } catch {
                // Page rendering cancelled or failed — ignore
            }
        }

        void render();

        return () => {
            cancelled = true;
        };
    }, [pdfDoc, currentPage, zoom]);

    return (
        <div
            ref={containerRef}
            className="flex items-start justify-center overflow-auto bg-gray-100 h-full"
            style={{
                height: isFullscreen ? '100%' : 'calc(100vh - 280px)',
                minHeight: isFullscreen ? 'auto' : '500px'
            }}
        >
            <div className="p-6">
                <canvas
                    ref={canvasRef}
                    className="shadow-2xl rounded-sm bg-white max-w-full h-auto"
                    style={{ display: 'block' }}
                />
            </div>
        </div>
    );
}
