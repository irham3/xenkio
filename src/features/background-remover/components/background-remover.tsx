'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, X, Download, ImageIcon, Wand2, Layers, Image as LucideImage, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useBackgroundRemover } from '../hooks/use-background-remover';
import { CompareSlider } from './compare-slider';

export function BackgroundRemover() {
    const {
        images,
        modelStatus,
        initModel,
        addImages,
        processImage,
        removeImage,
        downloadResult
    } = useBackgroundRemover();

    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const pendingIdRef = useRef<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            addImages(acceptedFiles);
        }
    }, [addImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxSize: 10 * 1024 * 1024, // 10MB limit
    });

    const handleProcess = (id: string) => {
        if (modelStatus.isReady) {
            processImage(id);
        } else {
            pendingIdRef.current = id;
            if (!modelStatus.isLoading) initModel();
        }
    };

    useEffect(() => {
        if (modelStatus.isReady && pendingIdRef.current) {
            processImage(pendingIdRef.current);
            pendingIdRef.current = null;
        }
    }, [modelStatus.isReady, processImage]);

    const activeImage = images.find(img => img.id === activeImageId) || images[0];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    AI Background Remover
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Remove image backgrounds instantly with high precision AI.
                    100% free, private, and runs entirely in your browser.
                </p>
            </div>

            {/* Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: List & Upload */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Upload Box */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer hover:bg-gray-50",
                            isDragActive ? "border-primary-500 bg-primary-50" : "border-gray-200"
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center space-y-3">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                isDragActive ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"
                            )}>
                                <Upload className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Click to upload</p>
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Image List */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        <AnimatePresence>
                            {images.map((img) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setActiveImageId(img.id)}
                                    className={cn(
                                        "group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                        activeImage?.id === img.id
                                            ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                                            : "border-gray-200 bg-white hover:border-primary-200"
                                    )}
                                >
                                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 relative">
                                        <Image
                                            src={img.status === 'done' && img.resultUrl ? img.resultUrl : img.originalUrl}
                                            alt="Thumbnail"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {img.status === 'done' && (
                                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">
                                            {img.originalFile.name}
                                        </p>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            {img.status === 'idle' && <span>Ready</span>}
                                            {img.status === 'processing' && <span className="text-primary-600 animate-pulse">Processing...</span>}
                                            {img.status === 'done' && <span className="text-green-600 font-medium">Complete</span>}
                                            {img.status === 'error' && <span className="text-red-500">Error</span>}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {images.length === 0 && (
                            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No images selected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Editor / Preview */}
                <div className="lg:col-span-2">
                    {activeImage ? (
                        <Card className="overflow-hidden border-gray-200 shadow-sm bg-white h-full flex flex-col">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary-600" />
                                    <span className="font-medium text-gray-900 text-sm">Preview Result</span>
                                </div>
                                <div className="flex gap-2">
                                    {activeImage.status === 'done' && (
                                        <Button
                                            size="sm"
                                            onClick={() => downloadResult(activeImage)}
                                            className="bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download HD
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div className="flex-1 min-h-[400px] bg-gray-50 relative flex items-center justify-center p-4">
                                {activeImage.status === 'done' && activeImage.resultUrl ? (
                                    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
                                        <CompareSlider
                                            original={activeImage.originalUrl}
                                            modified={activeImage.resultUrl}
                                        />
                                    </div>
                                ) : (
                                    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-md">
                                        <Image
                                            src={activeImage.originalUrl}
                                            alt="Preview"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                        {activeImage.status === 'processing' && (
                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Wand2 className="w-6 h-6 text-primary-600 animate-pulse" />
                                                    </div>
                                                </div>
                                                <p className="mt-4 font-medium text-gray-900 animate-pulse">Removing background...</p>
                                            </div>
                                        )}
                                        {activeImage.status === 'idle' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors group">
                                                <Button
                                                    size="lg"
                                                    onClick={() => handleProcess(activeImage.id)}
                                                    className="shadow-xl scale-100 group-hover:scale-105 transition-transform"
                                                >
                                                    <Wand2 className="w-5 h-5 mr-2" />
                                                    Remove Background
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <LucideImage className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900">Select an image to edit</h3>
                            <p className="text-gray-500 max-w-md mt-2">
                                Upload an image from the left panel to start removing backgrounds automatically.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Progress / Model Status */}
            <AnimatePresence>
                {(modelStatus.isLoading || modelStatus.progress > 0) && !modelStatus.isReady && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-medium mb-2">
                                <span>Loading AI Model</span>
                                <span>{modelStatus.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${modelStatus.progress}%` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
