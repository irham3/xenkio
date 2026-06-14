"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { DocumentUploader } from "@/features/doc-to-md/components/document-uploader"
import { ConversionPanel } from "@/features/doc-to-md/components/conversion-panel"
import { useDocToMd } from "@/features/doc-to-md/hooks/use-doc-to-md"
import { DocFile, LoadingStrategy } from "@/features/doc-to-md/types"
import { toast } from "sonner"

export function DocToMdClient({ title, description }: { title?: string, description?: string }) {
    const [file, setFile] = useState<DocFile | null>(null)
    const [strategy, setStrategy] = useState<LoadingStrategy>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('docToMdStrategy')
            if (saved === 'preload' || saved === 'lazy') {
                return saved
            }
        }
        return 'preload'
    })

    const handleStrategyChange = (newStrategy: LoadingStrategy) => {
        setStrategy(newStrategy)
        localStorage.setItem('docToMdStrategy', newStrategy)
    }

    const { status, error, markdown, convert, reset } = useDocToMd(strategy)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const uploadedFile = acceptedFiles[0]

            // Check file size (e.g. 50MB limit)
            if (uploadedFile.size > 50 * 1024 * 1024) {
                toast.error("File is too large. Please upload a file smaller than 50MB.")
                return
            }

            setFile({
                file: uploadedFile,
                name: uploadedFile.name,
                size: uploadedFile.size
            })
            reset()
        }
    }, [reset])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            // PDF
            'application/pdf': ['.pdf'],
            // Microsoft Office (modern)
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            // Microsoft Office (legacy)
            'application/msword': ['.doc'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            // Web / text formats
            'text/html': ['.html', '.htm'],
            'text/csv': ['.csv'],
            'text/plain': ['.txt', '.rst', '.log', '.md'],
            'text/markdown': ['.md'],
            'application/json': ['.json'],
            'application/xml': ['.xml'],
            'text/xml': ['.xml'],
            // Rich text
            'application/rtf': ['.rtf'],
            // E-book
            'application/epub+zip': ['.epub'],
            // Archive
            'application/zip': ['.zip'],
            // Outlook
            'application/vnd.ms-outlook': ['.msg'],
        },
        maxFiles: 1
    })

    const handleReset = useCallback(() => {
        setFile(null)
        reset()
    }, [reset])

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            {status !== 'success' && title && description && (
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{title}</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-snug">{description}</p>
                    <div className="mt-3 flex items-center justify-center">
                        <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            Powered by <a href="https://github.com/microsoft/markitdown" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">Microsoft MarkItDown</a>
                        </span>
                    </div>
                </div>
            )}
            {!file ? (
                <DocumentUploader
                    isDragActive={isDragActive}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    strategy={strategy}
                    onStrategyChange={handleStrategyChange}
                />
            ) : (
                <ConversionPanel
                    file={file}
                    status={status}
                    error={error}
                    markdown={markdown}
                    onReset={handleReset}
                    onConvert={convert}
                />
            )}
        </div>
    )
}
