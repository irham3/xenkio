'use client';

import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselUploaderProps {
    onImagesSelected: (files: File[]) => void;
    className?: string;
}

export function CarouselUploader({ onImagesSelected, className }: CarouselUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );
        if (files.length > 0) {
            onImagesSelected(files);
        }
    }, [onImagesSelected]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(file =>
                file.type.startsWith('image/')
            );
            if (files.length > 0) {
                onImagesSelected(files);
            }
        }
        // Reset input
        e.target.value = '';
    }, [onImagesSelected]);

    return (
        <button
            type="button"
            className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out p-8 text-center w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('carousel-upload-input')?.click()}
        >
            <input
                id="carousel-upload-input"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
            />

            <div className="flex flex-col items-center gap-3">
                <div className={cn(
                    "p-3 rounded-full bg-background shadow-sm transition-transform duration-200",
                    isDragging ? "scale-110" : "group-hover:scale-110"
                )}>
                    <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Upload Images</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Drag & drop or click to select
                    </p>
                </div>
            </div>
        </button>

    );
}
