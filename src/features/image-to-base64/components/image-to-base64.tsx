
"use client"

import { useImageToBase64 } from "../hooks/use-image-to-base64"
import { ImageUploader } from "./image-uploader"
import { Base64Result } from "./base64-result"
import { AlertCircle } from "lucide-react"

export function ImageToBase64() {
    const { result, isProcessing, error, convertImage, clear } = useImageToBase64();

    return (
        <div className="w-full space-y-8">
            {error && (
                <div className="max-w-4xl mx-auto p-4 bg-error-50 border border-error-100 rounded-2xl flex items-center gap-3 text-error-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {!result ? (
                <ImageUploader onUpload={convertImage} isProcessing={isProcessing} />
            ) : (
                <Base64Result result={result} onClear={clear} />
            )}
        </div>
    );
}
