import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ImageViewerProps {
    src: string;
    alt: string;
    isOpen: boolean;
    onClose: () => void;
    onDownload?: () => void;
    title?: string;
}

export function ImageViewer({ src, alt, isOpen, onClose, onDownload, title }: ImageViewerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    if (!isOpen) return null;

    const content = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key="modal-overlay"
                    className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key="modal-content"
                        className="relative w-full max-w-5xl h-full max-h-screen flex flex-col pointer-events-none p-4 md:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Container - Center */}
                        <div className="relative flex w-full h-full items-center justify-center p-4">
                            <div className="relative group max-w-full max-h-full pointer-events-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={src}
                                    alt={alt}
                                    className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl rounded-lg"
                                />

                                {/* Overlay Controls - Top Right */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {onDownload && (
                                        <Button
                                            size="icon"
                                            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 rounded-full w-10 h-10 shadow-lg"
                                            onClick={onDownload}
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 rounded-full w-10 h-10 shadow-lg"
                                        onClick={onClose}
                                        title="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {title && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {title}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (!mounted) return null;

    return createPortal(content, document.body);
}
