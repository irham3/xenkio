'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText, Maximize } from 'lucide-react';
import { usePdfReader } from '../hooks/use-pdf-reader';
import { useGestureControl } from '../hooks/use-gesture-control';
import { PdfViewer } from './pdf-viewer';
import { PdfControls } from './pdf-controls';
import { GestureOverlay } from './gesture-overlay';
import { AnimatePresence, motion } from 'framer-motion';

export function PdfReader() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        file,
        pdfDoc,
        currentPage,
        totalPages,
        zoom,
        isLoading,
        error,
        handleFileUpload,
        nextPage,
        prevPage,
        goToPage,
        setZoom,
        resetReader,
    } = usePdfReader();

    const gesture = useGestureControl(nextPage, prevPage);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Also handle ESC key for fullscreen state
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        if (typeof document !== 'undefined') {
            document.addEventListener('fullscreenchange', handler);
            return () => document.removeEventListener('fullscreenchange', handler);
        }
    }, []);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles[0]) {
                handleFileUpload(acceptedFiles[0]);
            }
        },
        [handleFileUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        multiple: false,
    });

    // Upload state
    if (!pdfDoc && !isLoading) {
        return (
            <div className="space-y-6">
                <div
                    {...getRootProps()}
                    className={`
                        relative flex flex-col items-center justify-center
                        border-2 border-dashed rounded-xl py-20 px-8
                        cursor-pointer transition-all duration-200
                        ${isDragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <div
                        className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center mb-5
                            ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}
                            transition-colors
                        `}
                    >
                        <FileUp
                            className={`w-7 h-7 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`}
                        />
                    </div>
                    <p className="text-base font-medium text-gray-900 mb-1">
                        {isDragActive ? 'Drop your PDF here' : 'Drop a PDF file or click to browse'}
                    </p>
                    <p className="text-sm text-gray-400">Supports PDF files of any size</p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                )}

                {/* Feature highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FeatureCard
                        icon="📖"
                        title="Read PDF"
                        description="Render crystal-clear PDF pages right in your browser"
                    />
                    <FeatureCard
                        icon="🖐️"
                        title="Gesture Navigation"
                        description="Swipe in the air to flip pages. Hands-free reading."
                    />
                    <FeatureCard
                        icon="🤖"
                        title="Private AI"
                        description="Edge-based hand detection — camera stays in your browser"
                    />
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 animate-pulse">
                    <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Loading PDF...</p>
                {file && (
                    <p className="text-xs text-gray-400 mt-1">{file.name}</p>
                )}
            </div>
        );
    }

    // Reader view
    return (
        <div ref={containerRef} className={`space-y-4 ${isFullscreen ? 'bg-gray-50 p-6 h-full flex flex-col' : ''}`}>
            {/* Header info - Hide in fullscreen to maximize space */}
            {!isFullscreen && (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl">
                    <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                        {file?.name}
                    </span>
                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 ml-auto transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* PDF Viewer with Page Turn Effect */}
            <div className={`relative flex-1 min-h-0 bg-gray-200 rounded-xl border border-gray-200 overflow-hidden shadow-inner`} style={{ perspective: '1200px' }}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentPage}
                        initial={{ x: '100%', rotateY: 30, opacity: 0 }}
                        animate={{ x: 0, rotateY: 0, opacity: 1 }}
                        exit={{ x: '-100%', rotateY: -30, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 25,
                            mass: 0.8
                        }}
                        style={{ transformOrigin: 'left center' }}
                        className="h-full shadow-2xl"
                    >
                        {pdfDoc && (
                            <PdfViewer
                                pdfDoc={pdfDoc}
                                currentPage={currentPage}
                                zoom={zoom}
                                isFullscreen={isFullscreen}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Gesture Indicator in corner */}
                {gesture.isActive && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-primary-100">
                            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                            <span className="text-[10px] font-bold text-primary-900 uppercase tracking-wider">Gesture Mode</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className={isFullscreen ? 'mt-auto' : ''}>
                <PdfControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    zoom={zoom}
                    isGestureActive={gesture.isActive}
                    isGestureLoading={gesture.isModelLoading}
                    isFullscreen={isFullscreen}
                    onPrevPage={prevPage}
                    onNextPage={nextPage}
                    onGoToPage={goToPage}
                    onZoomChange={setZoom}
                    onToggleGesture={gesture.toggleGesture}
                    onToggleFullscreen={toggleFullscreen}
                    onReset={resetReader}
                />
            </div>

            {/* Gesture error */}
            {gesture.error && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                    <span className="text-sm text-red-700">{gesture.error}</span>
                </div>
            )}

            {/* Gesture Overlay (Webcam is now hidden in this component) */}
            <GestureOverlay
                videoRef={gesture.videoRef}
                isActive={gesture.isActive}
                isModelLoading={gesture.isModelLoading}
                gestureDirection={gesture.gestureDirection}
                error={gesture.error}
            />
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100">
            <span className="text-2xl leading-none mt-0.5">{icon}</span>
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
