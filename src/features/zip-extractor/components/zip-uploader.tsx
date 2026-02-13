
"use client"

import { FileArchive } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"

interface ZipUploaderProps {
    onUpload: (file: File) => void;
    isExtracting: boolean;
}

export function ZipUploader({ onUpload, isExtracting }: ZipUploaderProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                onUpload(acceptedFiles[0]);
            }
        },
        accept: {
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip']
        },
        multiple: false,
        disabled: isExtracting
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative border-2 border-dashed rounded-3xl p-16 transition-all duration-300 cursor-pointer group",
                isDragActive
                    ? "border-primary-500 bg-primary-50/50"
                    : "border-gray-200 hover:border-primary-400 hover:bg-gray-50 bg-white shadow-soft"
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center transition-all bg-white shadow-medium",
                    isDragActive ? "scale-110 shadow-primary" : "group-hover:scale-105"
                )}>
                    <FileArchive className={cn(
                        "w-10 h-10 transition-colors",
                        isDragActive ? "text-primary-600" : "text-primary-500"
                    )} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {isDragActive ? "Drop Zip file here" : "Upload Zip File"}
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Drag and drop your .zip archive here, or click to select a file from your computer
                    </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">Fast Processing</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">Secure</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">Offline</span>
                </div>
            </div>
        </div>
    )
}
