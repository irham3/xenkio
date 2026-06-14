"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { DocumentUploader } from "@/features/doc-to-md/components/document-uploader"
import { ConversionPanel } from "@/features/doc-to-md/components/conversion-panel"
import { useDocToMd } from "@/features/doc-to-md/hooks/use-doc-to-md"
import { DocFile, LoadingStrategy } from "@/features/doc-to-md/types"
import { toast } from "sonner"

export function DocToMdClient() {
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
