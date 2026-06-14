"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { DocumentUploader } from "@/features/doc-to-md/components/document-uploader"
import { ConversionPanel } from "@/features/doc-to-md/components/conversion-panel"
import { useDocToMd } from "@/features/doc-to-md/hooks/use-doc-to-md"
import { DocFileState, LoadingStrategy } from "@/features/doc-to-md/types"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

export function DocToMdClient({ title, description }: { title?: string, description?: string }) {
    const [files, setFiles] = useState<DocFileState[]>([])
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

    const { pyodideStatus, pyodideError, convertFile } = useDocToMd(strategy)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const newFiles: DocFileState[] = [];
            for (const uploadedFile of acceptedFiles) {
                if (uploadedFile.size > 50 * 1024 * 1024) {
                    toast.error(`File ${uploadedFile.name} is too large. Max size is 50MB.`)
                    continue;
                }
                newFiles.push({
                    id: uuidv4(),
                    file: uploadedFile,
                    name: uploadedFile.name,
                    size: uploadedFile.size,
                    status: 'pending'
                });
            }
            if (newFiles.length > 0) {
                setFiles(prev => [...prev, ...newFiles])
            }
        }
    }, [])

    const handleReset = useCallback(() => {
        setFiles([])
    }, [])

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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
        maxFiles: 50
    })

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            {title && description && (
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
            {files.length === 0 ? (
                <DocumentUploader
                    isDragActive={isDragActive}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    strategy={strategy}
                    onStrategyChange={handleStrategyChange}
                />
            ) : (
                <ConversionPanel
                    files={files}
                    setFiles={setFiles}
                    pyodideStatus={pyodideStatus}
                    pyodideError={pyodideError}
                    convertFile={convertFile}
                    onReset={handleReset}
                    onAddFiles={open}
                />
            )}
        </div>
    )
}
