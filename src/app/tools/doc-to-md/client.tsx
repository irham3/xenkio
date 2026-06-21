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
        noClick: true,
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
        <div 
            {...getRootProps()}
            className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full relative outline-none"
        >
            <input {...getInputProps()} />
            
            {isDragActive && files.length > 0 && (
                <div className="absolute inset-0 z-50 bg-primary-500/10 backdrop-blur-sm border-2 border-primary-500 border-dashed rounded-xl flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3">
                        <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-gray-800">Drop files to add them</span>
                    </div>
                </div>
            )}

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
                    openDialog={open}
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
