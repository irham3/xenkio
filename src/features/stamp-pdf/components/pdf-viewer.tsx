
'use client';

import React, { useRef, useCallback } from 'react';
import { PDFStamp, PDFFile } from '../types';
import { DraggableStamp } from './draggable-stamp';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfViewerProps {
    file: PDFFile;
    stamps: PDFStamp[];
    currentPageIndex: number;
    selectedStampId: string | null;
    editingStampId: string | null;
    onUpdateStamp: (id: string, updates: Partial<PDFStamp>) => void;
    onRemoveStamp: (id: string) => void;
    onSelectStamp: (id: string | null) => void;
    onEditStamp: (id: string) => void;
    onPageChange: (index: number) => void;
}

export function PdfViewer({
    file,
    stamps,
    currentPageIndex,
    selectedStampId,
    editingStampId,
    onUpdateStamp,
    onRemoveStamp,
    onSelectStamp,
    onEditStamp,
    onPageChange,
}: PdfViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayScale, setDisplayScale] = React.useState(1);

    React.useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const img = containerRef.current.querySelector('img');
                if (img && img.naturalWidth > 0) {
                    setDisplayScale(img.clientWidth / img.naturalWidth);
                }
            }
        };

        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        // Initial check and when image loads
        updateScale();
        const img = containerRef.current?.querySelector('img');
        if (img) img.addEventListener('load', updateScale);

        return () => {
            resizeObserver.disconnect();
            if (img) img.removeEventListener('load', updateScale);
        };
    }, [currentPageIndex]);

    const pageStamps = stamps.filter((s) => s.pageIndex === currentPageIndex);
    const currentPreview = file.previewUrls[currentPageIndex];

    const handleBackgroundClick = useCallback(() => {
        onSelectStamp(null);
    }, [onSelectStamp]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Page navigation */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
                    disabled={currentPageIndex === 0}
                    className={cn(
                        'p-1.5 rounded-md border transition-colors',
                        currentPageIndex === 0
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    )}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 font-medium min-w-[80px] text-center">
                    Page {currentPageIndex + 1} / {file.totalPages}
                </span>
                <button
                    onClick={() =>
                        onPageChange(Math.min(file.totalPages - 1, currentPageIndex + 1))
                    }
                    disabled={currentPageIndex === file.totalPages - 1}
                    className={cn(
                        'p-1.5 rounded-md border transition-colors',
                        currentPageIndex === file.totalPages - 1
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    )}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* PDF page with stamps */}
            <div
                ref={containerRef}
                className="relative border border-gray-200 shadow-sm bg-white cursor-crosshair mx-auto"
                onClick={handleBackgroundClick}
                style={{ maxWidth: '100%', width: 'fit-content' }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={currentPreview}
                    alt={`Page ${currentPageIndex + 1}`}
                    className="block max-w-full h-auto select-none pointer-events-none"
                    draggable={false}
                />

                {/* Stamps overlay */}
                {pageStamps.map((stamp) => (
                    <DraggableStamp
                        key={stamp.id}
                        stamp={stamp}
                        containerRef={containerRef}
                        displayScale={displayScale}
                        onUpdate={onUpdateStamp}
                        onRemove={onRemoveStamp}
                        onSelect={(id) => onSelectStamp(id)}
                        onEdit={onEditStamp}
                        isSelected={selectedStampId === stamp.id}
                        isEditing={editingStampId === stamp.id}
                    />
                ))}
            </div>


            {/* Page thumbnails */}
            {file.totalPages > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
                    {file.previewUrls.map((url, i) => {
                        const pageStampCount = stamps.filter((s) => s.pageIndex === i).length;
                        return (
                            <button
                                key={i}
                                onClick={() => onPageChange(i)}
                                className={cn(
                                    'relative flex-shrink-0 w-16 h-20 border-2 rounded overflow-hidden transition-all',
                                    i === currentPageIndex
                                        ? 'border-primary-500 shadow-md'
                                        : 'border-gray-200 hover:border-gray-400'
                                )}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={url}
                                    alt={`Page ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {pageStampCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 bg-primary-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {pageStampCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
