"use client"

import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone"

interface PdfUploaderProps {
    isDragActive: boolean
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T
}

export function PdfUploader({ isDragActive, getRootProps, getInputProps }: PdfUploaderProps) {
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
                        <Upload className={cn(
                            "w-10 h-10 transition-colors",
                            isDragActive ? "text-primary-600" : "text-gray-400"
                        )} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {isDragActive ? "Drop your PDF here" : "Select PDF file to convert"}
                        </h3>
                        <p className="text-gray-500">
                            or drag and drop your PDF document here
                        </p>
                    </div>
                    <Button size="lg" className="mt-4">
                        <FileText className="w-4 h-4 mr-2" />
                        Choose PDF File
                    </Button>
                </div>
            </div>
        </div>
    )
}
