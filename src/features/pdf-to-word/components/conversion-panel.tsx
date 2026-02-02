"use client"

import { FileText, Download, Loader2, CheckCircle2, AlertCircle, RefreshCw, FileDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PdfFile, ConversionResult, ConversionStatus } from "../types"

interface ConversionPanelProps {
    file: PdfFile
    status: ConversionStatus
    progress: number
    error: string | null
    result: ConversionResult | null
    onConvert: () => void
    onDownload: () => void
    onReset: () => void
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function ConversionPanel({
    file,
    status,
    progress,
    error,
    result,
    onConvert,
    onDownload,
    onReset
}: ConversionPanelProps) {
    const isIdle = status === 'idle';
    const isProcessing = status === 'processing';
    const isCompleted = status === 'completed';
    const isError = status === 'error';

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* File Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-error-50 rounded-xl flex items-center justify-center shrink-0">
                            <FileText className="w-7 h-7 text-error-500" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate max-w-xs">
                                {file.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)} • {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}
                            </p>
                        </div>
                    </div>

                    {!isProcessing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Change file
                        </Button>
                    )}
                </div>
            </div>

            {/* Conversion Arrow */}
            {isIdle && (
                <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-error-50 rounded-lg">
                        <FileText className="w-5 h-5 text-error-500" />
                        <span className="font-medium text-gray-700">PDF</span>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    <div className="flex items-center gap-3 px-4 py-2 bg-primary-50 rounded-lg">
                        <FileDown className="w-5 h-5 text-primary-600" />
                        <span className="font-medium text-gray-700">DOCX</span>
                    </div>
                </div>
            )}

            {/* Main Action Area */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
                {isIdle && (
                    <div className="text-center">
                        <div className="max-w-md mx-auto mb-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Ready to Convert
                            </h4>
                            <p className="text-gray-500 text-sm">
                                Your PDF styling (<strong>bold</strong>, <em>italic</em>, colors, fonts) will be preserved in Word.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="px-12 py-6 text-base h-auto"
                            onClick={onConvert}
                        >
                            <FileDown className="w-5 h-5 mr-3" />
                            Convert to Word
                        </Button>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-primary-600 mb-1">100%</div>
                                    <div className="text-xs text-gray-500">Private Processing</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary-600 mb-1">Free</div>
                                    <div className="text-xs text-gray-500">No Limits</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary-600 mb-1">Fast</div>
                                    <div className="text-xs text-gray-500">Instant Results</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isProcessing && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-primary-500"
                                    strokeDasharray={175.93}
                                    strokeDashoffset={175.93 * (1 - progress / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                            </div>
                        </div>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Converting your PDF...
                        </h4>
                        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Extracting text, colors, and styles
                        </p>
                    </div>
                )}

                {isCompleted && result && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-6 bg-success-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-success-500" />
                        </div>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Conversion Complete!
                        </h4>
                        <p className="text-gray-500 text-sm mb-6">
                            Successfully converted {result.pageCount} {result.pageCount === 1 ? 'page' : 'pages'} with approximately {result.wordCount.toLocaleString()} words
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={onDownload}
                                className="px-8"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Word File
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={onReset}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Convert Another
                            </Button>
                        </div>
                    </div>
                )}

                {isError && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-6 bg-error-50 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-error-500" />
                        </div>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Conversion Failed
                        </h4>
                        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                            {error || "An unexpected error occurred. Please try again or use a different PDF file."}
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={onConvert}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={onReset}
                            >
                                Choose Different File
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Note */}
            {isIdle && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        <span className="font-semibold text-gray-600">What gets preserved:</span> Bold, italic, text colors (RGB/CMYK), fonts, font sizes, headings, and paragraph alignment.
                        <span className="font-semibold text-gray-600">Note:</span> Images and complex vector graphics are not extracted.
                    </p>
                </div>
            )}
        </div>
    );
}
