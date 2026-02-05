"use client"

import { Plus, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone"

interface ImageUploaderProps {
    isDragActive: boolean
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T
}

export function ImageUploader({ isDragActive, getRootProps, getInputProps }: ImageUploaderProps) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div
                {...getRootProps()}
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
                        <ImageIcon className={cn(
                            "w-10 h-10 transition-colors",
                            isDragActive ? "text-primary-600" : "text-gray-400"
                        )} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xl font-semibold text-gray-900">
                            {isDragActive ? "Drop your images here" : "Select image files"}
                        </p>
                        <p className="text-gray-500">
                            or drag and drop images (JPG, PNG, GIF, BMP, WebP) here
                        </p>

                    </div>
                    <Button size="lg" className="mt-4 pointer-events-none" type="button">
                        <Plus className="w-4 h-4 mr-2" />
                        Select Images
                    </Button>
                </div>
            </div>
        </div>
    )
}
