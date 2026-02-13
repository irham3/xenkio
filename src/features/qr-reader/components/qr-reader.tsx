
"use client"

import { useState } from "react"
import { useQrReader } from "../hooks/use-qr-reader"
import { QrUploader } from "./qr-uploader"
import { QrScanner } from "./qr-scanner"
import { QrResult } from "./qr-result"
import { Button } from "@/components/ui/button"
import { Camera, Upload, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function QrReader() {
    const { result, isScanning, error, scanImage, clearResult, setResult } = useQrReader();
    const [mode, setMode] = useState<'upload' | 'camera' | null>(null);

    const handleCameraScan = (data: string) => {
        setResult({
            data,
            type: 'camera',
            timestamp: Date.now()
        });
        setMode(null);
    };

    return (
        <div className="w-full space-y-8">
            {error && (mode === 'upload' || !mode) && (
                <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {!result ? (
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Mode Selector */}
                    {!mode && (
                        <div className="grid sm:grid-cols-2 gap-6">
                            <button
                                onClick={() => setMode('camera')}
                                className="group p-8 rounded-3xl border-2 border-dashed border-gray-200 bg-white hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 cursor-pointer text-center space-y-4"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:scale-110 flex items-center justify-center mx-auto transition-all shadow-medium group-hover:shadow-primary">
                                    <Camera className="w-8 h-8 text-primary-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary-700">Scan with Camera</h3>
                                    <p className="text-sm text-gray-500">Enable camera to scan codes in real-time</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('upload')}
                                className="group p-8 rounded-3xl border-2 border-dashed border-gray-200 bg-white hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 cursor-pointer text-center space-y-4"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:scale-110 flex items-center justify-center mx-auto transition-all shadow-medium group-hover:shadow-primary">
                                    <Upload className="w-8 h-8 text-primary-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary-700">Upload Image</h3>
                                    <p className="text-sm text-gray-500">Scan QR codes from saved images or screenshots</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {mode === 'camera' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <QrScanner onScan={handleCameraScan} onClose={() => setMode(null)} />
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setMode(null)}
                                    className="text-gray-500 hover:text-gray-900 cursor-pointer"
                                >
                                    Cancel and go back
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'upload' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <QrUploader onUpload={scanImage} isScanning={isScanning} />
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setMode(null)}
                                    className="text-gray-500 hover:text-gray-900 cursor-pointer"
                                >
                                    Cancel and go back
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <QrResult
                    result={result}
                    onClear={clearResult}
                    onRescan={() => {
                        clearResult();
                        setMode(null);
                    }}
                />
            )}
        </div>
    );
}
