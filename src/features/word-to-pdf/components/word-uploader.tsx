"use client"

import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone"

interface WordUploaderProps {
    isDragActive: boolean
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T
}

export function WordUploader({ isDragActive, getRootProps, getInputProps }: WordUploaderProps) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer group",
                    isDragActive
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-primary-400 hover:bg-gray-50 bg-white"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                        isDragActive ? "bg-primary-100" : "bg-primary-50 group-hover:bg-primary-100"
                    )}>
                        <FileText className={cn(
                            "w-10 h-10 transition-colors",
                            isDragActive ? "text-primary-600" : "text-primary-500"
                        )} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xl font-semibold text-gray-900">
                            {isDragActive ? "Drop your Word file here" : "Select Word file"}
                        </p>
                        <p className="text-gray-500">
                            or drag and drop Word file here to convert
                        </p>
                        <p className="text-xs text-gray-400 pt-2">
                            Supports .docx, .doc
                        </p>
                    </div>
                    <Button size="lg" className="mt-4 rounded-xl shadow-primary hover:shadow-primary-lg transition-all" type="button">
                        <Plus className="w-4 h-4 mr-2" />
                        Select Word file
                    </Button>
                </div>
            </div>
        </div>
    )
}
