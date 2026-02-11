import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareSliderProps {
    original: string;
    modified: string;
    className?: string;
}

export function CompareSlider({ original, modified, className }: CompareSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    }, []);

    const onMouseDown = useCallback(() => setIsDragging(true), []);
    const onTouchStart = useCallback(() => setIsDragging(true), []);

    useEffect(() => {
        const onMouseUp = () => setIsDragging(false);
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX);
        };
        const onTouchMove = (e: TouchEvent) => {
            if (isDragging) handleMove(e.touches[0].clientX);
        };

        if (isDragging) {
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('touchend', onMouseUp);
            window.addEventListener('touchmove', onTouchMove);
        }

        return () => {
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [isDragging, handleMove]);

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-full overflow-hidden select-none cursor-ew-resize group touch-none", className)}
            onClick={(e) => handleMove(e.clientX)}
        >
            {/* Modified Image (Background) */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={modified}
                    alt="Modified"
                    fill
                    className="object-contain pointer-events-none bg-[url('/transparent-bg.png')] bg-repeat"
                    unoptimized
                    style={{
                        backgroundColor: '#e5e7eb', // Fallback gray
                        backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                />
            </div>

            {/* Original Image (Clipped) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <Image
                    src={original}
                    alt="Original"
                    fill
                    className="object-contain"
                    unoptimized
                />
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                    <MoveHorizontal size={16} />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-20">
                Original
            </div>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-20">
                Removed Info
            </div>
        </div>
    );
}
