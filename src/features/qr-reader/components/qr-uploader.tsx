
"use client"

import { QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"

interface QrUploaderProps {
    onUpload: (file: File) => void;
    isScanning: boolean;
}

export function QrUploader({ onUpload, isScanning }: QrUploaderProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                onUpload(acceptedFiles[0]);
            }
        },
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: false,
        disabled: isScanning
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer group",
                isDragActive
                    ? "border-primary-500 bg-primary-50/50"
                    : "border-gray-200 hover:border-primary-400 hover:bg-gray-50 bg-white shadow-soft"
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all bg-white shadow-medium",
                    isDragActive ? "scale-110 shadow-primary" : "group-hover:scale-105"
                )}>
                    <QrCode className={cn(
                        "w-8 h-8 transition-colors",
                        isDragActive ? "text-primary-600" : "text-primary-500"
                    )} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">
                        {isDragActive ? "Drop image here" : "Upload QR Image"}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Drag and drop a QR code image here, or click to select a file
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">PNG</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded">JPG</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded">WEBP</span>
                </div>
            </div>
        </div>
    )
}
