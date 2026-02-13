
"use client"

import { useState } from "react"
import { QrReaderResult } from "../types"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, RefreshCw, Trash2, Globe, FileText, Calendar, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { isValidUrl } from "../lib/qr-utils"
import Image from "next/image"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface QrResultProps {
    result: QrReaderResult;
    onClear: () => void;
    onRescan: () => void;
}

export function QrResult({ result, onClear, onRescan }: QrResultProps) {
    const [copied, setCopied] = useState(false);
    const isUrl = isValidUrl(result.data);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result.data);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(timestamp));
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "Unknown size";
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-medium p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            isUrl ? "bg-primary-50 text-primary-600" : "bg-gray-50 text-gray-600"
                        )}>
                            {isUrl ? <Globe className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">Scanned Result</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formatDate(result.timestamp)}</span>
                                </div>
                                <span className="hidden sm:inline opacity-50">•</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-[10px] font-bold uppercase tracking-wider">{result.type}</span>
                                </div>
                                {result.fileName && (
                                    <>
                                        <span className="opacity-50">•</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1.5 cursor-help group transition-colors hover:text-gray-600">
                                                        <Info className="w-3.5 h-3.5" />
                                                        <span className="max-w-[120px] truncate underline decoration-dotted underline-offset-2">
                                                            {result.fileName}
                                                        </span>
                                                        <span className="opacity-70">
                                                            ({formatFileSize(result.fileSize)})
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-900 border-gray-800 text-white p-3 rounded-xl shadow-xl">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-xs text-gray-400 uppercase tracking-widest">File Metadata</p>
                                                        <p className="text-sm font-medium">{result.fileName}</p>
                                                        <p className="text-xs text-gray-500">{formatFileSize(result.fileSize)}</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRescan}
                            className="h-10 rounded-xl px-4 border-gray-200 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Scan Another
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-10 rounded-xl px-4 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                    {result.imageUrl && (
                        <div className="md:col-span-4 space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Source Image</p>
                            <div className="aspect-square relative rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm group/img">
                                <Image
                                    src={result.imageUrl}
                                    alt="Uploaded QR Code"
                                    fill
                                    className="object-contain p-4 transition-transform duration-500 group-hover/img:scale-110"
                                />
                            </div>
                        </div>
                    )}

                    <div className={cn(
                        "space-y-3",
                        result.imageUrl ? "md:col-span-8" : "md:col-span-12"
                    )}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Decoded Data</p>
                        <div className="relative group/text h-full">
                            <div className="absolute top-3 right-3 z-10 opacity-100 sm:opacity-0 sm:group-hover/text:opacity-100 transition-opacity duration-200">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleCopy}
                                    className={cn(
                                        "h-8 px-3 text-xs rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm transition-all cursor-pointer",
                                        copied ? "bg-success-600 text-white border-success-600 hover:bg-success-700 hover:text-white" : "bg-white/80 hover:bg-white text-gray-700"
                                    )}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                                    {copied ? 'Copied!' : 'Copy Result'}
                                </Button>
                            </div>

                            <div className="w-full h-full min-h-[200px] p-6 rounded-2xl bg-gray-50 border border-gray-100 font-mono text-sm leading-relaxed text-gray-900 break-all overflow-auto scrollbar-themed">
                                {result.data}
                            </div>
                        </div>
                    </div>
                </div>

                {isUrl && (
                    <div className="flex justify-end pt-2">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto rounded-xl px-8 bg-primary-600 hover:bg-primary-700 shadow-primary hover:shadow-primary-lg transition-all cursor-pointer"
                            onClick={() => window.open(result.data, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Link
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
