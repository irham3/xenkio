'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    X,
    Settings2,
    Download,
    FileIcon,
    AlertCircle,
    ArrowRight,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePDFCompressor } from '../hooks/use-pdf-compressor';
import { compressPdf } from '../lib/pdf-compressor-logic';
import { COMPRESSION_LEVELS } from '../constants';
import { CompressionLevel } from '../types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function PDFCompressor() {
    const {
        file,
        setFile,
        settings,
        updateSettings,
        isProcessing,
        setIsProcessing,
        result,
        setResult,
        reset
    } = usePDFCompressor();
    const [, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.type !== 'application/pdf') {
                toast.error('Please select a PDF file');
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    }, [setFile, setResult]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const handleCompress = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(0);
        try {
            const compressedBlob = await compressPdf(file, settings, (p) => setProgress(p));
            const compressedFile = new File([compressedBlob], file.name, { type: 'application/pdf' });

            setResult({
                originalSize: file.size,
                compressedSize: compressedFile.size,
                savings: Math.max(0, Math.round(((file.size - compressedFile.size) / file.size) * 100)),
                url: URL.createObjectURL(compressedBlob)
            });

            toast.success('PDF compressed successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to compress PDF. The file may be corrupted or password protected.');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Workspace */}
                <div className="lg:col-span-2 space-y-6">
                    {!file ? (
                        <div
                            {...getRootProps()}
                            onDragEnter={() => setIsDragging(true)}
                            onDragLeave={() => setIsDragging(false)}
                            className={cn(
                                "relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer",
                                isDragActive
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center text-center space-y-6">
                                <div className={cn(
                                    "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
                                    isDragActive ? "bg-primary-100" : "bg-gray-100"
                                )}>
                                    <Upload className={cn(
                                        "w-10 h-10 transition-colors",
                                        isDragActive ? "text-primary-600" : "text-gray-400"
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-semibold text-gray-900">
                                        {isDragActive ? "Drop your PDF here" : "Select PDF file"}
                                    </p>
                                    <p className="text-gray-500">
                                        or drag and drop PDF file here to compress
                                    </p>
                                </div>
                                <Button size="lg" type="button">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Select PDF file
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Card */}
                            <Card className="p-6 border border-gray-200 rounded-xl bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                            <FileIcon className="w-6 h-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                                                {file.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                PDF • {formatSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={reset}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-9 w-9"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </Card>

                            {/* Results */}
                            {result && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                                            <p className="text-emerald-700 text-xs font-medium uppercase tracking-wide mb-1">
                                                New Size
                                            </p>
                                            <p className="text-2xl font-semibold text-emerald-900">
                                                {formatSize(result.compressedSize)}
                                            </p>
                                        </div>
                                        <div className="bg-primary-50 border border-primary-100 rounded-xl p-5">
                                            <p className="text-primary-700 text-xs font-medium uppercase tracking-wide mb-1">
                                                Saved
                                            </p>
                                            <p className="text-2xl font-semibold text-primary-900">
                                                {result.savings}%
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full h-12 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25"
                                    >
                                        <a href={result.url} download={`compressed-${file.name}`}>
                                            <Download className="mr-2 h-5 w-5" />
                                            Download Compressed PDF
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {/* Compress Button */}
                            {!result && (
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleCompress}
                                        disabled={isProcessing}
                                        size="lg"
                                        className="w-full h-12 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 disabled:opacity-70"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="mr-2 h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Compressing... {progress}%
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="mr-2 h-5 w-5" />
                                                Compress PDF
                                            </>
                                        )}
                                    </Button>
                                    {isProcessing && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-1">
                    <Card className="p-6 border border-gray-200 rounded-xl bg-white space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <Settings2 className="w-4 h-4 text-primary-600" />
                            <h3 className="font-semibold text-gray-900">Settings</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Compression Level */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Compression Level
                                    </Label>
                                    <span className="text-xs font-medium text-primary-600 capitalize">
                                        {settings.level}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
                                    {(['low', 'medium', 'high'] as CompressionLevel[]).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => updateSettings({
                                                level,
                                                ...COMPRESSION_LEVELS[level]
                                            })}
                                            className={cn(
                                                "py-2 text-xs font-medium rounded-md transition-all capitalize",
                                                settings.level === level
                                                    ? "bg-white text-gray-900 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {settings.level === 'low' && 'Best quality, smaller file reduction'}
                                    {settings.level === 'medium' && 'Balanced for everyday use'}
                                    {settings.level === 'high' && 'Maximum compression, smaller file size'}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Remove metadata
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Strip author, creation date, etc.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.removeMetadata}
                                        onCheckedChange={(checked) => updateSettings({ removeMetadata: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                PDFs with many images benefit most from high compression.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
