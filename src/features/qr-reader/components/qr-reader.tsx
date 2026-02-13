'use client';

import { useCallback, useRef, useState, DragEvent } from 'react';
import { Upload, Clipboard, Copy, Check, ExternalLink, X, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQrReader } from '../hooks/use-qr-reader';
import { URL_REGEX, ACCEPTED_IMAGE_TYPES } from '../constants';

export function QrReader() {
    const { state, decodeImage, decodeFromDataUrl, reset } = useQrReader();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                decodeImage(file);
            }
        },
        [decodeImage],
    );

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                decodeImage(file);
            } else {
                toast.error('Please drop an image file');
            }
        },
        [decodeImage],
    );

    const handlePaste = useCallback(async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const file = new File([blob], 'clipboard-image.png', { type: imageType });
                    decodeImage(file);
                    return;
                }
            }

            const text = await navigator.clipboard.readText();
            if (text && (text.startsWith('data:image/') || text.startsWith('http'))) {
                decodeFromDataUrl(text);
                return;
            }

            toast.error('No image found in clipboard');
        } catch {
            toast.error('Could not access clipboard. Try using Ctrl+V or upload an image.');
        }
    }, [decodeImage, decodeFromDataUrl]);

    const handleCopy = useCallback(async () => {
        if (!state.result) return;
        try {
            await navigator.clipboard.writeText(state.result);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    }, [state.result]);

    const isUrl = state.result ? URL_REGEX.test(state.result) : false;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Upload Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-primary-600" />
                    Upload QR Code Image
                </h2>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                        isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
                    )}
                >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, WebP, or any image format
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handlePaste}>
                        <Clipboard className="w-4 h-4 mr-2" />
                        Paste from Clipboard
                    </Button>
                </div>
            </div>

            {/* Processing Indicator */}
            {state.isProcessing && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Decoding QR code...</span>
                    </div>
                </div>
            )}

            {/* Image Preview */}
            {state.imagePreview && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="text-sm font-medium text-gray-700">Image Preview</Label>
                        <Button variant="ghost" size="sm" onClick={reset}>
                            <X className="w-4 h-4 mr-1" />
                            Clear
                        </Button>
                    </div>
                    <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={state.imagePreview}
                            alt="Uploaded QR code"
                            className="max-h-64 rounded-lg border border-gray-200 object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {state.error && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                    <p className="text-sm text-red-600">{state.error}</p>
                </div>
            )}

            {/* Result Section */}
            {state.result && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Decoded Result
                    </Label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 break-all">
                        <p className="text-sm text-gray-900">{state.result}</p>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={handleCopy}>
                            {copied ? (
                                <Check className="w-4 h-4 mr-2 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4 mr-2" />
                            )}
                            {copied ? 'Copied!' : 'Copy Result'}
                        </Button>
                        {isUrl && (
                            <Button variant="outline" className="flex-1" asChild>
                                <a href={state.result} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Link
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
