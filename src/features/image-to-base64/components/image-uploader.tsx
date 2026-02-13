
"use client"

import { FileImage, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
import { SUPPORTED_IMAGE_TYPES } from "../constants"

interface ImageUploaderProps {
    onUpload: (file: File) => void;
    isProcessing: boolean;
}

export function ImageUploader({ onUpload, isProcessing }: ImageUploaderProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                onUpload(acceptedFiles[0]);
            }
        },
        accept: SUPPORTED_IMAGE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
        multiple: false,
        disabled: isProcessing
    });

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-12 lg:p-16 transition-all duration-300 cursor-pointer group",
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
                        <FileImage className={cn(
                            "w-10 h-10 transition-colors",
                            isDragActive ? "text-primary-600" : "text-primary-500"
                        )} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">
                            {isDragActive ? "Drop your image here" : "Select Image"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Drag and drop your image here to convert it to Base64 instantly
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                            <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">PNG</span>
                            <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">JPG</span>
                            <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">WEBP</span>
                            <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">SVG</span>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="mt-4 rounded-xl px-8 bg-primary-600 hover:bg-primary-700 shadow-primary hover:shadow-primary-lg transition-all cursor-pointer"
                        type="button"
                        disabled={isProcessing}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {isProcessing ? "Processing..." : "Choose Image"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
