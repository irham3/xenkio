
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PDFStamp } from '../types';
import { cn } from '@/lib/utils';
import { X, Maximize2, Pencil } from 'lucide-react';

interface DraggableStampProps {
    stamp: PDFStamp;
    containerRef: React.RefObject<HTMLDivElement | null>;
    displayScale: number;
    onUpdate: (id: string, updates: Partial<PDFStamp>) => void;
    onRemove: (id: string) => void;
    onSelect: (id: string) => void;
    onEdit: (id: string) => void;
    isSelected: boolean;
    isEditing: boolean;
}

export function DraggableStamp({
    stamp,
    containerRef,
    displayScale,
    onUpdate,
    onRemove,
    onSelect,
    onEdit,
    isSelected,
    isEditing,
}: DraggableStampProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    const getClientCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if ('touches' in e) {
            const touch = (e as TouchEvent).touches?.[0] || (e as React.TouchEvent).touches?.[0];
            return { x: touch.clientX, y: touch.clientY };
        }
        return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        onSelect(stamp.id);
        if (!containerRef.current || !elementRef.current) return;

        const elementRect = elementRef.current.getBoundingClientRect();
        const { x, y } = getClientCoords(e);

        setDragOffset({ x: x - elementRect.left, y: y - elementRect.top });
        setIsDragging(true);
    };

    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const { x, y } = getClientCoords(e);
        setResizeStart({ x, y, width: stamp.width * displayScale, height: stamp.height * displayScale });
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!containerRef.current) return;
            const { x: clientX, y: clientY } = getClientCoords(e);

            if (isDragging) {
                const containerRect = containerRef.current.getBoundingClientRect();
                let newX = clientX - containerRect.left - dragOffset.x;
                let newY = clientY - containerRect.top - dragOffset.y;

                const maxX = containerRect.width - (stamp.width * displayScale);
                const maxY = containerRect.height - (stamp.height * displayScale);
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                // Convert screen pixels back to natural pixels
                onUpdate(stamp.id, {
                    x: newX / displayScale,
                    y: newY / displayScale
                });
            } else if (isResizing) {
                const deltaX = clientX - resizeStart.x;
                const deltaY = clientY - resizeStart.y;
                const newWidthScreen = Math.max(80 * displayScale, resizeStart.width + deltaX);
                const newHeightScreen = Math.max(40 * displayScale, resizeStart.height + deltaY);

                onUpdate(stamp.id, {
                    width: newWidthScreen / displayScale,
                    height: newHeightScreen / displayScale
                });
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
    }, [isDragging, isResizing, dragOffset, resizeStart, onUpdate, stamp, containerRef, displayScale]);

    return (
        <div
            ref={elementRef}
            className={cn(
                'absolute select-none group touch-none',
                isSelected || isDragging ? 'z-50' : 'z-10',
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
            )}
            style={{
                left: stamp.x * displayScale,
                top: stamp.y * displayScale,
                width: stamp.width * displayScale,
                height: stamp.height * displayScale,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <div
                className={cn(
                    'w-full h-full relative transition-all overflow-hidden',
                    isSelected || isDragging || isResizing
                        ? 'ring-2 ring-primary-500 shadow-lg'
                        : 'hover:ring-1 hover:ring-gray-400'
                )}
                style={{
                    backgroundColor: stamp.backgroundColor,
                    borderWidth: Math.max(1, 2 * displayScale),
                    borderStyle: 'solid',
                    borderColor: stamp.borderColor,
                    opacity: stamp.opacity,
                }}
            >
                {/* Inner accent border */}
                <div
                    className="absolute inset-1 pointer-events-none"
                    style={{
                        borderWidth: Math.max(0.5, 1.5 * displayScale),
                        borderStyle: 'solid',
                        borderColor: stamp.color,
                    }}
                />

                {/* Stamp content */}
                <div
                    className="relative w-full h-full p-2 flex flex-col pointer-events-none origin-top-left"
                    style={{ transform: `scale(${displayScale})`, width: `${100 / displayScale}%`, height: `${100 / displayScale}%` }}
                >
                    <StampDisplay stamp={stamp} />
                </div>

                {/* Controls */}
                {(isSelected || isDragging || isResizing) && (
                    <>
                        {/* Remove button */}
                        <div
                            className="absolute -top-3 -right-3 bg-white rounded-full shadow-md border border-gray-200 p-1 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors z-20 pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(stamp.id);
                            }}
                            title="Remove"
                        >
                            <X className="w-3.5 h-3.5" />
                        </div>

                        {/* Edit button */}
                        <div
                            className={cn(
                                'absolute -top-3 -left-3 rounded-full shadow-md border p-1 cursor-pointer transition-colors z-20 pointer-events-auto',
                                isEditing
                                    ? 'bg-primary-500 text-white border-primary-500'
                                    : 'bg-white border-gray-200 hover:bg-blue-50 hover:text-blue-500'
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(stamp.id);
                            }}
                            title="Edit content"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </div>

                        {/* Resize handle */}
                        <div
                            className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-primary-500 rounded-full cursor-se-resize flex items-center justify-center z-20 shadow-sm hover:scale-110 transition-transform pointer-events-auto"
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


function StampDisplay({ stamp }: { stamp: PDFStamp }) {
    const textColor = stamp.color;
    const fs = stamp.fontSize;

    switch (stamp.type) {
        case 'approval':
            return (
                <div className="flex flex-col items-center justify-center h-full gap-0.5">
                    <span
                        className="font-bold tracking-wider leading-tight"
                        style={{ color: textColor, fontSize: fs * 1.4 }}
                    >
                        {stamp.label || stamp.status?.toUpperCase() || 'APPROVED'}
                    </span>
                    {stamp.signerName && (
                        <span style={{ color: textColor, fontSize: fs * 0.75, opacity: 0.8 }}>
                            {stamp.signerName}
                        </span>
                    )}
                    <span style={{ color: textColor, fontSize: fs * 0.75, opacity: 0.8 }}>
                        {stamp.date || new Date().toLocaleDateString()}
                    </span>
                </div>
            );
        case 'date':
            return (
                <div className="flex flex-col items-center justify-center h-full gap-0.5">
                    <span className="font-bold" style={{ color: textColor, fontSize: fs }}>
                        {stamp.dateLabel || 'Date'}
                    </span>
                    <span style={{ color: textColor, fontSize: fs * 1.2 }}>
                        {stamp.date || new Date().toLocaleDateString()}
                    </span>
                </div>
            );
        case 'checklist':
            return (
                <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="font-bold" style={{ color: textColor, fontSize: fs }}>
                        {stamp.checklistTitle || 'Checklist'}
                    </span>
                    {stamp.checklist?.map((item) => (
                        <div key={item.id} className="flex items-center gap-1.5" style={{ fontSize: fs * 0.85 }}>
                            <span style={{ color: textColor }}>{item.checked ? '☑' : '☐'}</span>
                            <span
                                style={{
                                    color: textColor,
                                    textDecoration: item.checked ? 'line-through' : 'none',
                                    opacity: item.checked ? 0.6 : 1,
                                }}
                            >
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            );
        case 'notes':
            return (
                <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="font-bold" style={{ color: textColor, fontSize: fs }}>
                        Notes
                    </span>
                    <span
                        className="whitespace-pre-wrap break-words leading-tight"
                        style={{ color: textColor, fontSize: fs * 0.85, opacity: 0.85 }}
                    >
                        {stamp.notes || '(click edit to add notes)'}
                    </span>
                </div>
            );
        case 'cost':
            return (
                <div className="flex flex-col items-center justify-center h-full gap-0.5">
                    <span className="font-bold" style={{ color: textColor, fontSize: fs }}>
                        {stamp.costLabel || 'Total'}
                    </span>
                    <span className="font-bold" style={{ color: textColor, fontSize: fs * 1.3 }}>
                        {stamp.costCurrency || 'IDR'}{' '}
                        {Number(stamp.costAmount || '0').toLocaleString()}
                    </span>
                </div>
            );
        default:
            return null;
    }
}
