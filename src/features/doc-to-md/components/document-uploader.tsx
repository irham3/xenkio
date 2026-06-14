"use client"

import { UploadSimple, FileText, Gear } from '@phosphor-icons/react/dist/ssr';
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropzoneOptions } from "react-dropzone"
import { LoadingStrategy } from "../types"

interface DocumentUploaderProps {
    isDragActive: boolean
    openDialog: () => void
    strategy: LoadingStrategy
    onStrategyChange: (strategy: LoadingStrategy) => void
}

export function DocumentUploader({ isDragActive, openDialog, strategy, onStrategyChange }: DocumentUploaderProps) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div
                onClick={openDialog}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer",
                    isDragActive
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
                )}
            >
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
                        isDragActive ? "bg-primary-100" : "bg-gray-100"
                    )}>
                        <UploadSimple className={cn(
                            "w-10 h-10 transition-colors",
                            isDragActive ? "text-primary-600" : "text-gray-400"
                        )}  weight="duotone"/>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {isDragActive ? "Drop your document here" : "Select document to convert"}
                        </h3>
                        <p className="text-gray-500">
                            or drag and drop your file here (PDF, Word, Excel, PPTX, etc.)
                        </p>
                    </div>
                    <Button size="lg" className="mt-4" onClick={openDialog} type="button">
                        <FileText className="w-4 h-4 mr-2"  weight="duotone"/>
                        Choose File
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <Gear className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Dependency Loading Strategy</h4>
                        <p className="text-xs text-gray-500">
                            {strategy === 'preload' 
                                ? "Preloads MarkItDown (~50MB) for instant conversions." 
                                : "Dynamically downloads tiny parsers per format. Saves bandwidth."}
                        </p>
                    </div>
                </div>
                <select 
                    value={strategy}
                    onChange={(e) => onStrategyChange(e.target.value as LoadingStrategy)}
                    className="text-sm border border-gray-200 bg-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                    <option value="preload">Preload All (Recommended)</option>
                    <option value="lazy">Lazy Load (Bandwidth Saver)</option>
                </select>
            </div>
        </div>
    )
}
