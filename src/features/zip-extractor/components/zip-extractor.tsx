
"use client"

import { useZipExtractor } from "../hooks/use-zip-extractor"
import { ZipUploader } from "./zip-uploader"
import { ZipFileList } from "./zip-file-list"
import { RefreshCw, AlertCircle } from "lucide-react"

export function ZipExtractor() {
    const {
        files,
        zipName,
        isExtracting,
        error,
        extractZip,
        reset,
        downloadFile
    } = useZipExtractor();

    return (
        <div className="w-full space-y-8 min-h-[400px]">
            {error && (
                <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {isExtracting ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                        <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-500" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Extracting Archive...</h3>
                        <p className="text-sm text-gray-500 font-medium animate-pulse uppercase tracking-widest">Reading {zipName}</p>
                    </div>
                </div>
            ) : files.length > 0 ? (
                <ZipFileList
                    files={files}
                    zipName={zipName}
                    onDownload={downloadFile}
                    onReset={reset}
                />
            ) : (
                <div className="max-w-4xl mx-auto">
                    <ZipUploader onUpload={extractZip} isExtracting={isExtracting} />
                </div>
            )}
        </div>
    );
}
