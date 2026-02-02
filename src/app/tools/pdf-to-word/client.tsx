"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { PdfUploader } from "@/features/pdf-to-word/components/pdf-uploader"
import { ConversionPanel } from "@/features/pdf-to-word/components/conversion-panel"
import { usePdfToWord } from "@/features/pdf-to-word/hooks/use-pdf-to-word"
import { PdfFile } from "@/features/pdf-to-word/types"

export function PdfToWordClient() {
    const [pdfFile, setPdfFile] = useState<PdfFile | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)

    const {
        convertToWord,
        downloadResult,
        status,
        progress,
        error,
        result,
        reset
    } = usePdfToWord()

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setLoadError(null)

        if (file.type !== 'application/pdf') {
            setLoadError('Please upload a valid PDF file')
            return
        }

        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)

            setPdfFile({
                file,
                name: file.name,
                size: file.size,
                pageCount: pdfDoc.getPageCount(),
                arrayBuffer
            })
            reset()
        } catch (err) {
            console.error('Error loading PDF:', err)
            setLoadError('Failed to load PDF. The file may be corrupted or password-protected.')
        }
    }, [reset])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    })

    const handleReset = () => {
        setPdfFile(null)
        setLoadError(null)
        reset()
    }

    const handleConvert = () => {
        if (pdfFile) {
            convertToWord(pdfFile)
        }
    }

    if (!pdfFile) {
        return (
            <div className="py-12">
                <PdfUploader
                    isDragActive={isDragActive}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                />

                {loadError && (
                    <div className="mt-6 max-w-4xl mx-auto">
                        <div className="p-4 bg-error-50 border border-error-500/20 rounded-xl text-center">
                            <p className="text-sm text-error-600">{loadError}</p>
                        </div>
                    </div>
                )}

                {/* Features Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Style Preservation</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            PDF text with <strong>bold</strong>, <em>italic</em>, colors and fonts are accurately converted to Word format.
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5" fill="#ef4444" /><circle cx="17.5" cy="10.5" r="2.5" fill="#22c55e" /><circle cx="8.5" cy="7.5" r="2.5" fill="#3b82f6" /><circle cx="6.5" cy="12.5" r="2.5" fill="#f59e0b" /><path d="M12 22c-4.97 0-9-2.69-9-6v-2c0-3.31 4.03-6 9-6s9 2.69 9 6v2c0 3.31-4.03 6-9 6Z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Color & Style Extraction</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            All text colors (RGB/CMYK/Gray), alignment, headings, and font sizes are accurately extracted.
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">100% Private</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Everything runs in your browser. No uploads, no servers - your files stay on your device.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="py-12">
            <ConversionPanel
                file={pdfFile}
                status={status}
                progress={progress}
                error={error}
                result={result}
                onConvert={handleConvert}
                onDownload={downloadResult}
                onReset={handleReset}
            />
        </div>
    )
}
