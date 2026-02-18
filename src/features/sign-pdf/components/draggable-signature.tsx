import React, { useRef, useState, useEffect } from 'react';
import { PDFSignature } from '../types';
import { cn } from '@/lib/utils';
import { X, Maximize2 } from 'lucide-react';

interface DraggableSignatureProps {
    signature: PDFSignature;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onUpdate: (id: string, updates: Partial<PDFSignature>) => void;
    onRemove: (id: string) => void;
    isSelected?: boolean;
    onSelect?: () => void;
}

export function DraggableSignature({
    signature,
    containerRef,
    onUpdate,
    onRemove,
    isSelected,
    onSelect,
}: DraggableSignatureProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        onSelect?.();
        if (!containerRef.current || !elementRef.current) return;

        const elementRect = elementRef.current.getBoundingClientRect();

        // Calculate client coordinates
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        setDragOffset({
            x: clientX - elementRect.left,
            y: clientY - elementRect.top
        });

        setIsDragging(true);
    };

    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        setResizeStart({
            x: clientX,
            y: clientY,
            width: signature.width,
            height: signature.height
        });
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!containerRef.current) return;

            let clientX, clientY;
            if ('touches' in e) {
                clientX = (e as TouchEvent).touches[0].clientX;
                clientY = (e as TouchEvent).touches[0].clientY;
            } else {
                clientX = (e as MouseEvent).clientX;
                clientY = (e as MouseEvent).clientY;
            }

            if (isDragging) {
                const containerRect = containerRef.current.getBoundingClientRect();

                let newX = clientX - containerRect.left - dragOffset.x;
                let newY = clientY - containerRect.top - dragOffset.y;

                // Constrain to container
                const maxX = containerRect.width - signature.width;
                const maxY = containerRect.height - signature.height;

                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                onUpdate(signature.id, { x: newX, y: newY });
            } else if (isResizing) {
                const deltaX = clientX - resizeStart.x;
                const deltaY = clientY - resizeStart.y;

                // Aspect ratio logic could go here if needed. For now, free resize.
                // Or maintain aspect ratio if Shift key is pressed? Simple free resize is standard.

                const newWidth = Math.max(20, resizeStart.width + deltaX);
                const newHeight = Math.max(20, resizeStart.height + deltaY);

                onUpdate(signature.id, { width: newWidth, height: newHeight });
            }
        };

        const handleUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isDragging, isResizing, dragOffset, resizeStart, onUpdate, signature, containerRef]);

    return (
        <div
            ref={elementRef}
            className={cn(
                "absolute select-none group touch-none",
                isSelected || isDragging ? "z-50" : "z-10",
                isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            style={{
                left: signature.x,
                top: signature.y,
                width: signature.width,
                height: signature.height,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <div className={cn(
                "w-full h-full relative border-2 transition-all",
                isSelected || isDragging || isResizing
                    ? "border-primary-500 bg-primary-50/10 shadow-sm"
                    : "border-transparent hover:border-dashed hover:border-gray-400"
            )}>
                {/* Signature Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={signature.dataUrl}
                    alt="Signature"
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                />

                {/* Controls (visible when selected) */}
                {(isSelected || isDragging || isResizing) && (
                    <>
                        <div className="absolute -top-3 -right-3 bg-white rounded-full shadow-md border border-gray-200 p-1 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors z-20"
                            onClick={(e) => { e.stopPropagation(); onRemove(signature.id); }}
                            title="Remove">
                            <X className="w-3.5 h-3.5" />
                        </div>

                        {/* Resize Handle (Bottom Right) */}
                        <div
                            className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-primary-500 rounded-full cursor-se-resize flex items-center justify-center z-20 shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={handleResizeStart}
                            onTouchStart={handleResizeStart}
                        >
                            <Maximize2 className="w-3 h-3 text-primary-500 rotate-90" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
