'use client';

import { useEffect, useRef, useState } from 'react';
import { CarouselConfig, INSTAGRAM_SIZES } from './types';
import { cn } from '@/lib/utils';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CarouselPreviewProps {
    config: CarouselConfig;
    onChange: (updates: Partial<CarouselConfig>) => void;
    selectedImageId: string | null;
    onSelectImage: (id: string | null) => void;
}

export function CarouselPreview({ config, onChange, selectedImageId, onSelectImage }: CarouselPreviewProps) {
    const { width, height } = INSTAGRAM_SIZES[config.size];
    const [zoom, setZoom] = useState(0.25);
    const containerRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);

    // Auto-fit zoom on initial load or slide count change
    useEffect(() => {
        if (areaRef.current) {
            const areaWidth = areaRef.current.clientWidth - 100; // padding
            const areaHeight = areaRef.current.clientHeight - 100;
            const totalWidth = width * config.slideCount;

            const zoomX = areaWidth / totalWidth;
            const zoomY = areaHeight / height;

            // Set zoom to slightly less than the minimum to ensure it fits comfortably
            const newZoom = Math.min(zoomX, zoomY, 0.8); // Cap at 80%
            setZoom(Math.max(0.1, Math.floor(newZoom * 100) / 100));
        }
    }, [config.slideCount, config.size]);

    // Drag Logic
    // ... (rest of drag logic)
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const imgStart = useRef({ x: 0, y: 0 });

    const handleStart = (clientX: number, clientY: number, id: string, startX: number, startY: number) => {
        onSelectImage(id);
        setIsDragging(true);
        dragStart.current = { x: clientX, y: clientY };
        imgStart.current = { x: startX, y: startY };
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging || !selectedImageId) return;

        const dx = (clientX - dragStart.current.x) / zoom;
        const dy = (clientY - dragStart.current.y) / zoom;

        const newImages = config.images.map(img => {
            if (img.id === selectedImageId) {
                return { ...img, x: imgStart.current.x + dx, y: imgStart.current.y + dy };
            }
            return img;
        });

        onChange({ images: newImages });
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    // Calculate total canvas/preview size
    const totalWidth = width * config.slideCount;

    const handleDelete = (id: string, e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        const newImages = config.images.filter(img => img.id !== id);
        onChange({ images: newImages });
        if (selectedImageId === id) onSelectImage(null);
    }

    // Sort images for display based on order
    const sortedImages = [...config.images].sort((a, b) => a.order - b.order);

    return (
        <div
            className="flex flex-col h-full bg-secondary/10 rounded-2xl overflow-hidden shadow-2xl border border-border"
            onMouseMove={(e) => isDragging && handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={(e) => {
                if (isDragging) {
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                }
            }}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
        >
            {/* Toolbar */}
            <div className="h-14 bg-background/80 backdrop-blur-md border-b flex items-center px-6 justify-between shrink-0 z-30">
                <div className="hidden sm:flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-bold tracking-tight">
                        Canvas: <span className="text-muted-foreground font-mono ml-1">{totalWidth}x{height}px</span>
                    </span>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
                        <button
                            className="p-1.5 hover:bg-background rounded-md transition-all active:scale-95"
                            onClick={() => setZoom(z => Math.max(0.05, z - 0.05))}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-xs font-bold w-12 text-center select-none font-mono">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            className="p-1.5 hover:bg-background rounded-md transition-all active:scale-95"
                            onClick={() => setZoom(z => Math.min(1.5, z + 0.05))}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                ref={areaRef}
                className="flex-1 overflow-auto p-8 sm:p-12 flex items-center justify-center relative touch-none bg-[#0a0a0a]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            >
                <div
                    ref={containerRef}
                    className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out shrink-0 ring-1 ring-white/10"
                    style={{
                        width: totalWidth * zoom,
                        height: height * zoom,
                        backgroundColor: config.backgroundColor
                    }}
                >
                    {/* Render Images */}
                    {sortedImages.map((img) => (
                        <div
                            key={img.id}
                            className={cn(
                                "absolute select-none group",
                                selectedImageId === img.id ? "z-20 ring-4 ring-primary ring-offset-2 ring-offset-transparent ring-opacity-100" : "z-10"
                            )}
                            style={{
                                transform: `translate(${img.x * zoom}px, ${img.y * zoom}px) rotate(${img.rotation}deg)`,
                                transformOrigin: '0 0',
                                cursor: isDragging && selectedImageId === img.id ? 'grabbing' : 'grab',
                                width: (img.width || 0) * (img.baseScale || 1) * img.scale * zoom,
                                height: (img.height || 0) * (img.baseScale || 1) * img.scale * zoom,
                                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStart(e.clientX, e.clientY, img.id, img.x, img.y);
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                const touch = e.touches[0];
                                handleStart(touch.clientX, touch.clientY, img.id, img.x, img.y);
                            }}
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="pointer-events-none select-none w-full h-full object-cover"
                            />

                            {/* Delete Button */}
                            {selectedImageId === img.id && (
                                <button
                                    className="absolute -top-4 -right-4 bg-destructive text-destructive-foreground w-8 h-8 flex items-center justify-center rounded-full shadow-xl opacity-100 ring-2 ring-white hover:scale-110 active:scale-95 transition-all pointer-events-auto z-50"
                                    onClick={(e) => handleDelete(img.id, e)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Grid Lines (Overlays) */}
                    {Array.from({ length: config.slideCount - 1 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 border-r-2 border-dashed border-red-500/60 pointer-events-none z-50"
                            style={{
                                left: (i + 1) * width * zoom,
                                width: 0
                            }}
                        >
                            <div className="absolute top-4 -right-3 w-6 h-6 flex items-center justify-center text-[11px] text-white font-black bg-red-500 shadow-lg rounded-full ring-2 ring-white">
                                {i + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
