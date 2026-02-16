
'use client';

import React, { useCallback } from 'react';
import { useSteganography } from '../hooks/use-steganography';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Upload, Lock, Unlock, Download, Image as ImageIcon, Copy, RefreshCcw, ShieldCheck, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

export function SteganographyTool() {
    const {
        mode,
        setMode,
        selectedFile,
        selectedImageUrl,
        message,
        setMessage,
        outputImageUrl,
        decodedMessage,
        isProcessing,
        handleFileSelect,
        handleProcess,
        reset
    } = useSteganography();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            handleFileSelect(acceptedFiles[0]);
        }
    }, [handleFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            // We recommend PNG for lossless, but jpg can be used as input source (though it will be converted to PNG)
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp']
        },
        maxFiles: 1
    });

    const handleDownload = () => {
        if (outputImageUrl) {
            const link = document.createElement('a');
            link.href = outputImageUrl;
            link.download = `secret-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleCopy = () => {
        if (decodedMessage) {
            navigator.clipboard.writeText(decodedMessage);
            toast.success('Message copied to clipboard');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[600px] flex flex-col">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-50/50 rounded-full blur-3xl -z-10 opacity-60 transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 opacity-60 transform translate-x-1/2 translate-y-1/2" />

                <div className="border-b border-gray-100 bg-white/50 backdrop-blur-sm p-4 sticky top-0 z-10">
                    <Tabs value={mode} onValueChange={(v) => { reset(); setMode(v as 'encode' | 'decode'); }} className="w-full max-w-md mx-auto">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100/80 p-1 rounded-xl">
                            <TabsTrigger value="encode" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
                                <Lock className="w-4 h-4 mr-2" /> Hide Message
                            </TabsTrigger>
                            <TabsTrigger value="decode" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
                                <Unlock className="w-4 h-4 mr-2" /> Reveal Message
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="p-8 flex-1 grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Input */}
                    <div className="space-y-6 flex flex-col">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">1. Upload Image</Label>
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "relative aspect-video rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden group hover:border-primary-400 hover:bg-primary-50/10",
                                    isDragActive ? "border-primary-500 bg-primary-50/20" : "border-gray-200 bg-gray-50/50",
                                    selectedImageUrl ? "border-solid border-gray-200 p-0 bg-transparent" : ""
                                )}
                            >
                                <input {...getInputProps()} />

                                {selectedImageUrl ? (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={selectedImageUrl}
                                            alt="Selected"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2"><Upload size={16} /> Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2">
                                        <div className="p-3 bg-white rounded-full shadow-sm inline-block mb-2 group-hover:scale-110 transition-transform duration-300">
                                            <ImageIcon className="w-6 h-6 text-primary-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Drag & drop or <span className="text-primary-600">click to upload</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG, WebP supported
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {mode === 'encode' && (
                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label className="text-sm font-semibold text-gray-700">2. Enter Secret Message</Label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type the secret message you want to hide inside the image..."
                                    className="flex-1 min-h-[150px] resize-none border-gray-200 bg-gray-50/50 focus:ring-primary-500 font-normal p-4 rounded-xl text-base"
                                />
                                <div className="text-right text-xs text-gray-400">
                                    {message.length} characters
                                </div>
                            </div>
                        )}
                        {mode === 'decode' && (
                            <div className="flex-1 flex items-center justify-center text-center p-8 border border-gray-100 rounded-xl bg-gray-50/30">
                                <div className="max-w-xs space-y-2 text-gray-500">
                                    <Eye className="w-8 h-8 mx-auto text-gray-300" />
                                    <p className="text-sm">Upload the image containing the secret message to reveal it.</p>
                                </div>
                            </div>
                        )}

                        <Button
                            size="lg"
                            onClick={() => handleProcess()}
                            disabled={!selectedFile || (mode === 'encode' && !message) || isProcessing}
                            className="w-full h-14 text-base font-bold shadow-primary rounded-xl bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.99]"
                        >
                            {isProcessing ? 'Processing...' : (mode === 'encode' ? 'Encrypt & Hide Message' : 'Decrypt & Reveal Message')}
                        </Button>
                    </div>

                    {/* Right Column: Output */}
                    <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-6 flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-sm font-semibold text-gray-700">Result</Label>
                            {(outputImageUrl || decodedMessage) && (
                                <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-red-500 h-8">
                                    <RefreshCcw size={14} className="mr-1.5" /> Start Over
                                </Button>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50 relative overflow-hidden">
                            {/* Placeholder State */}
                            {(!outputImageUrl && !decodedMessage) && (
                                <div className="text-center p-8 opacity-40">
                                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-500">Result will appear here</p>
                                </div>
                            )}

                            {/* Encode Result */}
                            {mode === 'encode' && outputImageUrl && (
                                <div className="relative w-full h-full p-4 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="relative w-full flex-1 min-h-[200px] rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                        <Image src={outputImageUrl} alt="Result" fill className="object-contain" unoptimized />
                                    </div>
                                    <div className="w-full space-y-2">
                                        <p className="text-xs text-center text-green-600 font-medium bg-green-50 py-1 rounded-full px-3 inline-block mx-auto w-full">
                                            Message Hidden Successfully!
                                        </p>
                                        <Button onClick={handleDownload} className="w-full" variant="outline">
                                            <Download className="mr-2 h-4 w-4" /> Download Image
                                        </Button>
                                        <p className="text-[10px] text-center text-gray-400">
                                            *Download this PNG to keep the message. Converting to JPG will destroy the data.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Decode Result */}
                            {mode === 'decode' && decodedMessage && (
                                <div className="w-full h-full p-6 flex flex-col animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-inner overflow-auto relative group">
                                        <p className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                            {decodedMessage}
                                        </p>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur"
                                            onClick={handleCopy}
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-green-600 font-medium bg-green-50 py-1.5 rounded-full px-4 inline-block">
                                            <Unlock className="w-3 h-3 inline mr-1" /> Secret Message Revealed
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
