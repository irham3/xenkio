
"use client"

import { useState } from "react"
import { ImageToBase64Result } from "../types"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, ImageIcon, Code2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatBytes } from "../lib/base64-utils"
import Image from "next/image"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Base64ResultProps {
    result: ImageToBase64Result;
    onClear: () => void;
}

export function Base64Result({ result, onClear }: Base64ResultProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const snippets = {
        raw: result.base64,
        dataUrl: result.dataUrl,
        html: `<img src="${result.dataUrl}" alt="${result.fileName}" />`,
        css: `background-image: url("${result.dataUrl}");`
    };

    return (
        <TooltipProvider>
            <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Preview and Info */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-medium p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-primary-500" />
                                    Preview
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClear}
                                    className="h-8 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                    Clear
                                </Button>
                            </div>

                            <div className="aspect-square relative rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden group">
                                <Image
                                    src={result.dataUrl}
                                    alt="Preview"
                                    fill
                                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">File Name</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="font-semibold text-gray-900 truncate max-w-[150px] cursor-help">
                                                {result.fileName}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="max-w-xs break-all">{result.fileName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">Format</span>
                                    <span className="font-semibold text-gray-900 uppercase">{result.mimeType.split('/')[1]}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">Size</span>
                                    <span className="font-semibold text-gray-900 tabular-nums">{formatBytes(result.fileSize)}</span>
                                </div>
                                {result.dimensions && (
                                    <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-3">
                                        <span className="text-gray-500">Dimensions</span>
                                        <span className="font-semibold text-gray-900 tabular-nums">{result.dimensions.width} × {result.dimensions.height} px</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Base64 Outputs */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-medium flex flex-col h-full">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-primary-500" />
                                        Encoded Output
                                    </h3>
                                    <span className="text-[10px] sm:text-xs font-medium text-primary-600 bg-primary-100/50 px-2.5 py-1 rounded-full w-fit">
                                        {result.base64.length.toLocaleString()} characters
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-6">
                                <Tabs defaultValue="data-url" className="w-full h-full flex flex-col">
                                    <TabsList className="grid grid-cols-4 gap-1 p-1 bg-gray-100/80 rounded-xl mb-6">
                                        <TabsTrigger value="data-url" className="text-[10px] sm:text-xs rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer transition-all hover:bg-white/50 hover:text-gray-900">Data URL</TabsTrigger>
                                        <TabsTrigger value="raw" className="text-[10px] sm:text-xs rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer transition-all hover:bg-white/50 hover:text-gray-900">Raw String</TabsTrigger>
                                        <TabsTrigger value="html" className="text-[10px] sm:text-xs rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer transition-all hover:bg-white/50 hover:text-gray-900">HTML img</TabsTrigger>
                                        <TabsTrigger value="css" className="text-[10px] sm:text-xs rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer transition-all hover:bg-white/50 hover:text-gray-900">CSS bg</TabsTrigger>
                                    </TabsList>

                                    {(['data-url', 'raw', 'html', 'css'] as const).map((type) => (
                                        <TabsContent key={type} value={type} className="flex-1 mt-0">
                                            <div className="relative group h-full min-h-[300px]">
                                                <div className="absolute top-3 right-3 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleCopy(type === 'data-url' ? snippets.dataUrl : type === 'raw' ? snippets.raw : type === 'html' ? snippets.html : snippets.css, type)}
                                                        className={cn(
                                                            "h-9 px-4 rounded-xl shadow-sm border border-gray-200 backdrop-blur-sm transition-all cursor-pointer",
                                                            copied === type ? "bg-success-600 text-white border-success-600 hover:bg-success-700 hover:text-white" : "bg-white/80 hover:bg-white text-gray-700"
                                                        )}
                                                    >
                                                        {copied === type ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                                        {copied === type ? 'Copied!' : 'Copy Snippet'}
                                                    </Button>
                                                </div>

                                                <div className="w-full h-full min-h-[300px] p-5 rounded-2xl bg-gray-50 border border-gray-100 font-mono text-xs leading-relaxed text-gray-600 overflow-auto scrollbar-themed break-all">
                                                    {type === 'data-url' ? snippets.dataUrl : type === 'raw' ? snippets.raw : type === 'html' ? snippets.html : snippets.css}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
