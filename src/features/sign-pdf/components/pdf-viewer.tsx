import React, { useRef, useState } from 'react';
import { PDFFile, PDFSignature } from '../types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { DraggableSignature } from './draggable-signature';

interface PdfViewerProps {
    file: PDFFile;
    signatures: PDFSignature[];
    activeSignature: PDFSignature | null;
    onUpdateSignature: (id: string, updates: Partial<PDFSignature>) => void;
    onRemoveSignature: (id: string) => void;
    onSelectSignature: (id: string | null) => void;
}

export function PdfViewer({
    file,
    signatures,
    activeSignature,
    onUpdateSignature,
    onRemoveSignature,
    onSelectSignature,
}: PdfViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [scale, setScale] = useState(1);

    const currentPageUrl = file.previewUrls[pageIndex];
    const pageSignatures = signatures.filter(s => s.pageIndex === pageIndex);

    const updatePage = (direction: 'next' | 'prev') => {
        if (direction === 'next' && pageIndex < file.totalPages - 1) {
            setPageIndex(prev => prev + 1);
        } else if (direction === 'prev' && pageIndex > 0) {
            setPageIndex(prev => prev - 1);
        }
    };


    // We need to map signature positions properly when scaling changes.
    // Actually, keeping signatures in absolute pixels relative to unscaled image (or base scale) is easier, 
    // and scaling the container via CSS transform.
    // But `DraggableSignature` uses `absolute` positioning. If we scale container, signatures scale with it? No, unless child of scaled div.

    // Strategy: 
    // 1. Image is responsive width: 100%.
    // 2. Container has `relative`.
    // 3. Signatures are positioned absolute %. (Wait, Draggable uses px. % is better for responsiveness).
    // If we stick to px, we must recalculate on resize. That's complex.
    // Let's stick to fixed width container or fit-content container?
    // Let's use a fixed max-width container and let image fit.

    // If image scales down, signature px coordinates drift.
    // We need resize observer on container to update signature positions?
    // OR we store signature positions as percentages (x%, y%) and render them as %.

    // Let's update `use-sign-pdf` to store as % if possible? No, px is easier for drag math.
    // Compromise: We lock the PDF viewer width to something standard (e.g. 800px) and scale content inside if needed?
    // Or just accept that signatures are absolute px relative to the *currently rendered image size*.
    // If window resizes, we might need a refresh or re-calc.

    // For MVP:
    // Render image at natural size or fitted size, and track that size.
    // The `DraggableSignature` uses `containerRef` bounding rect to constrain.

    return (
        <div className="flex flex-col h-full bg-gray-100/50 rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b bg-white">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => updatePage('prev')} disabled={pageIndex === 0}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-600">
                        Page {pageIndex + 1} of {file.totalPages}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => updatePage('next')} disabled={pageIndex >= file.totalPages - 1}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs w-12 text-center text-gray-500">{Math.round(scale * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Viewing Area */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center relative">
                <div
                    className="relative bg-white shadow-lg transition-transform origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        marginBottom: `${(scale - 1) * 100}px` // Add margin to allow scrolling if scaled up
                    }}
                >
                    {/* PDF Page Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={currentPageUrl}
                        alt={`Page ${pageIndex + 1}`}
                        className="max-w-none pointer-events-none select-none"
                        style={{ width: '100%', height: 'auto' }} // Ensure intrinsic size or fitted? 
                        // Better: use intrinsic size from generated canvas dataURL.
                        draggable={false}
                    />

                    {/* This overlay must match the image size exactly. */}
                    <div
                        ref={containerRef}
                        className="absolute inset-0 z-10"
                        onClick={() => onSelectSignature(null)}
                    >
                        {pageSignatures.map(sig => (
                            <DraggableSignature
                                key={sig.id}
                                signature={sig}
                                containerRef={containerRef}
                                onUpdate={onUpdateSignature}
                                onRemove={onRemoveSignature}
                                isSelected={activeSignature?.id === sig.id}
                                onSelect={() => onSelectSignature(sig.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
