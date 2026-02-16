'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, X, Download, ImageIcon, Wand2, Layers, CheckCircle, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBackgroundRemover } from '../hooks/use-background-remover';
import { CompareSlider } from './compare-slider';
import { BackgroundEditor } from './background-editor';

export function BackgroundRemover() {
    const {
        images,
        modelStatus,
        initModel,
        addImages,
        processImage,
        removeImage,
        downloadResult,
        updateImageResult,
        reset
    } = useBackgroundRemover();

    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const [editingImageId, setEditingImageId] = useState<string | null>(null);
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

    const handleSaveEdit = (blob: Blob) => {
        if (editingImageId) {
            updateImageResult(editingImageId, blob);
            setEditingImageId(null);
        }
    };

    // Auto-process newly added images
    useEffect(() => {
        const idleImage = images.find(img => img.status === 'idle');
        if (idleImage && !modelStatus.error) {
            if (modelStatus.isReady) {
                processImage(idleImage.id);
            } else if (!modelStatus.isLoading) {
                initModel();
            }
        }
    }, [images, modelStatus.isReady, modelStatus.isLoading, modelStatus.error, initModel, processImage]);


    useEffect(() => {
        if (modelStatus.isReady && pendingIdRef.current) {
            processImage(pendingIdRef.current);
            pendingIdRef.current = null;
        }
    }, [modelStatus.isReady, processImage]);

    const activeImage = images.find(img => img.id === activeImageId) || images[images.length - 1];

    // Initial Hero View
    if (images.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                        AI Background Remover
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Remove image backgrounds instantly with high precision AI. 100% free & private.
                    </p>
                </div>

                <div
                    {...getRootProps()}
                    className={cn(
                        "relative group border-2 border-dashed rounded-2xl p-16 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden bg-white shadow-sm hover:shadow-md",
                        isDragActive
                            ? "border-primary-500 bg-primary-50 scale-[1.01]"
                            : "border-gray-200 hover:border-primary-500/50 hover:bg-gray-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <div className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center bg-primary-50 transition-transform duration-300 group-hover:scale-110",
                            isDragActive && "bg-primary-100"
                        )}>
                            <Upload className="w-10 h-10 text-primary-600" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-gray-900">
                                {isDragActive ? "Drop image here" : "Select Image to Remove Background"}
                            </p>
                            <p className="text-gray-500">
                                Supports JPG, PNG, WebP up to 10MB
                            </p>
                        </div>
                        <Button size="lg" className="mt-4 pointer-events-none">
                            <Plus className="w-4 h-4 mr-2" />
                            Select Image
                        </Button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-3 gap-6 pt-8">
                    <div className="flex flex-col items-center text-center p-4">
                        <div className="p-3 bg-blue-50 rounded-xl mb-3">
                            <Wand2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">AI Powered</h3>
                        <p className="text-sm text-gray-500 mt-1">Precise foreground detection automatically.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                        <div className="p-3 bg-green-50 rounded-xl mb-3">
                            <Pencil className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Manual Edit</h3>
                        <p className="text-sm text-gray-500 mt-1">Fine-tune results with Erase & Restore tools.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                        <div className="p-3 bg-purple-50 rounded-xl mb-3">
                            <Download className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">HD Download</h3>
                        <p className="text-sm text-gray-500 mt-1">Save full resolution transparent PNGs.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Workspace View
    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">Background Remover</h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                        {images.length} Image{images.length > 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div {...getRootProps()} className="hidden">
                        <input {...getInputProps()} />
                    </div>
                    <Button variant="outline" onClick={getRootProps().onClick} className="flex-1 md:flex-none">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Image
                    </Button>
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={reset}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-200px)] min-h-[600px]">
                {/* Thumbnails Sidebar */}
                <div className="lg:col-span-3 h-full overflow-hidden flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-100 font-medium text-sm text-gray-500">
                        Images
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                        <AnimatePresence>
                            {images.map((img) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setActiveImageId(img.id)}
                                    className={cn(
                                        "group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border",
                                        activeImage?.id === img.id
                                            ? "bg-primary-50 border-primary-500 ring-1 ring-primary-500"
                                            : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                                    )}
                                >
                                    <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-gray-100 relative border border-gray-200">
                                        <Image
                                            src={img.resultUrl || img.originalUrl}
                                            alt="Thumbnail"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {img.status === 'done' && (
                                            <div className="absolute right-0 bottom-0 bg-green-500 text-white p-0.5 rounded-tl-md">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-medium truncate", activeImage?.id === img.id ? "text-primary-900" : "text-gray-700")}>
                                            {img.originalFile.name}
                                        </p>
                                        <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                            {img.status === 'processing' && <span className="text-primary-600 animate-pulse">Processing...</span>}
                                            {img.status === 'done' && <span className="text-green-600">Ready</span>}
                                            {img.status === 'error' && <span className="text-red-500">Failed</span>}
                                            {img.status === 'idle' && <span>Tap to process</span>}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                                        onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Main Preview */}
                <div className="lg:col-span-9 h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
                    {activeImage ? (
                        <>
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary-600" />
                                    <span className="font-medium text-gray-900 text-sm">Preview</span>
                                </div>
                                <div className="flex gap-2">
                                    {activeImage.status === 'done' && (
                                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingImageId(activeImage.id)}
                                                className="border-primary-200 hover:bg-primary-50 text-primary-700"
                                            >
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => downloadResult(activeImage)}
                                                className="bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    )}
                                    {activeImage.status === 'idle' && (
                                        <Button
                                            onClick={() => handleProcess(activeImage.id)}
                                            className="bg-primary-600 text-white"
                                        >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Remove Background
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Canvas Wrapper */}
                            <div className="flex-1 bg-gray-50/50 relative flex items-center justify-center p-6 overflow-hidden">
                                <div className="relative w-full h-full max-h-[calc(100vh-350px)] rounded-lg shadow-sm border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                                    {/* Transparency Grid Pattern */}
                                    <div
                                        className="absolute inset-0 opacity-40 pointer-events-none z-0"
                                        style={{
                                            backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                                            backgroundSize: '20px 20px',
                                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                        }}
                                    />

                                    {activeImage.status === 'done' && activeImage.resultUrl ? (
                                        <div className="relative w-full h-full z-10 flex items-center justify-center p-4">
                                            <CompareSlider
                                                original={activeImage.originalUrl}
                                                modified={activeImage.resultUrl}
                                                className="max-h-full object-contain shadow-2xl"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full z-10 p-4">
                                            <Image
                                                src={activeImage.originalUrl}
                                                alt="Preview"
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                            {activeImage.status === 'processing' && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                                    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                                                        <div className="relative mb-4">
                                                            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Wand2 className="w-6 h-6 text-primary-600" />
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold text-gray-900">Processing Image</p>
                                                        <p className="text-sm text-gray-500 mt-1">Removing background...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>No image selected</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Render Editor Modal if active */}
            {editingImageId && (() => {
                const img = images.find(i => i.id === editingImageId);
                if (img && img.resultUrl) {
                    return (
                        <BackgroundEditor
                            originalUrl={img.originalUrl}
                            resultUrl={img.resultUrl}
                            onSave={handleSaveEdit}
                            onCancel={() => setEditingImageId(null)}
                        />
                    );
                }
                return null;
            })()}

            {/* Global Loader Indicator */}
            <AnimatePresence>
                {(modelStatus.isLoading || modelStatus.progress > 0) && !modelStatus.isReady && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-8 right-8 bg-white border border-gray-200 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-4 max-w-sm"
                    >
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin" />
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-600">
                                {modelStatus.progress}%
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">Loading AI Model</p>
                            <p className="text-xs text-gray-500 mt-0.5">Downloading resources (once)...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
