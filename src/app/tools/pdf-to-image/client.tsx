'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, RefreshCw, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { saveAs } from 'file-saver';
import { PdfDropper } from '@/features/pdf-to-image/components/pdf-dropper';
import { ConversionControls } from '@/features/pdf-to-image/components/conversion-controls';
import { ImagePreviewGrid } from '@/features/pdf-to-image/components/image-preview-grid';
import { usePdfToImage } from '@/features/pdf-to-image/hooks/use-pdf-to-image';
import { ConversionOptions } from '@/features/pdf-to-image/types';

export default function PdfToImageClient() {
    const [file, setFile] = useState<File | null>(null);
    const [options, setOptions] = useState<ConversionOptions>({
        scale: 1.5, // High quality default
        format: 'jpg',
        quality: 1
    });

    const { convert, result, status, progress, reset, error } = usePdfToImage();

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        reset();
    };

    const handleRemoveFile = () => {
        setFile(null);
        reset();
    };

    const handleConvert = () => {
        if (file) {
            convert(file, options);
        }
    };

    const handleDownloadZip = () => {
        if (result?.zipBlob) {
            saveAs(result.zipBlob, result.zipFileName);
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="uploader"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-3xl mx-auto py-8"
                    >
                        <PdfDropper onFileSelect={handleFileSelect} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="workspace"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-8 items-start"
                    >
                        {/* LEFT COLUMN: Main Content */}
                        <div className="flex-1 w-full min-w-0 space-y-6">
                            {/* File Info Card */}
                            <Card className="p-4 sm:p-5 border-none shadow-sm bg-white rounded-2xl ring-1 ring-gray-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 ring-1 ring-primary-100">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate pr-2" title={file.name}>
                                            {file.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span>PDF Document</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    className="text-gray-400 text-error-600 hover:bg-error-50 shrink-0"
                                    disabled={status === 'processing'}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </Card>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 bg-error-50 text-error-600 rounded-xl border border-error-100 text-sm font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-error-500" />
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* PREVIEW AREA */}
                            <div className="bg-white rounded-2xl ring-1 ring-gray-100 min-h-[400px] p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-900">Preview</h3>
                                </div>

                                <AnimatePresence mode="wait">
                                    {status === 'processing' ? (
                                        <motion.div
                                            key="processing"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-xl bg-gray-50/50"
                                        >
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm ring-1 ring-gray-100 mb-6">
                                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                            </div>
                                            <h4 className="text-gray-900 text-lg font-semibold mb-2">Converting PDF...</h4>
                                        </motion.div>
                                    ) : status === 'completed' && result ? (
                                        <motion.div
                                            key="results"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-success-50 p-4 rounded-xl border border-success-100">
                                                <div className="flex items-center gap-3 text-success-800">
                                                    <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center shrink-0">
                                                        <RefreshCw className="w-4 h-4 text-success-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">Conversion Complete</h4>
                                                        <p className="text-xs opacity-80">{result.images.length} images ready</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleDownloadZip}
                                                    className="w-full sm:w-auto bg-success-600 hover:bg-success-700 text-white shadow-sm h-9 px-4 text-sm"
                                                >
                                                    <Download className="w-3.5 h-3.5 mr-2" />
                                                    Download ZIP
                                                </Button>
                                            </div>
                                            <ImagePreviewGrid images={result.images} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="placeholder"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="h-[300px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50"
                                        >
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm ring-1 ring-gray-100 mb-4">
                                                <ImageIcon className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h4 className="text-gray-900 font-medium mb-1">Ready to Convert</h4>
                                            <p className="text-sm text-gray-500 max-w-xs">
                                                Adjust your settings in the sidebar and click Convert to see image previews here.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar Settings */}
                        <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-6">
                            <ConversionControls
                                options={options}
                                onChange={setOptions}
                                disabled={status === 'processing'}
                                onConvert={handleConvert}
                                isProcessing={status === 'processing'}
                                progress={progress}
                                converted={status === 'completed'}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
