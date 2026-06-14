"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, RefreshCw, AlertCircle, Loader2, Copy, FileText, File as FileIcon, Archive, Play, Clock, Plus, Trash2 } from "lucide-react"
import { DocFileState, ConversionStatus } from "../types"
import { toast } from "sonner"
import { MarkdownEditorClient } from "@/app/tools/markdown-editor/client"
import JSZip from "jszip"
import { cn } from "@/lib/utils"

interface ConversionPanelProps {
    files: DocFileState[]
    setFiles: React.Dispatch<React.SetStateAction<DocFileState[]>>
    pyodideStatus: ConversionStatus
    pyodideError: string | null
    convertFile: (file: File) => Promise<string>
    onReset: () => void
    onAddFiles: () => void
}

export function ConversionPanel({ files, setFiles, pyodideStatus, pyodideError, convertFile, onReset, onAddFiles }: ConversionPanelProps) {
    const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || "")
    const [isConvertingAll, setIsConvertingAll] = useState(false)
    const isReady = pyodideStatus === 'ready' || pyodideStatus === 'error'

    const activeFile = files.find(f => f.id === activeFileId)

    const handleDownloadSingle = () => {
        if (!activeFile || !activeFile.markdown) return;
        const blob = new Blob([activeFile.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeFile.name.replace(/\.[^/.]+$/, "")}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (!activeFile || !activeFile.markdown) return;
        navigator.clipboard.writeText(activeFile.markdown);
        toast.success("Copied to clipboard");
    };

    const handleDownloadZip = async () => {
        const successfulFiles = files.filter(f => f.status === 'success' && f.markdown);
        if (successfulFiles.length === 0) {
            toast.error("No converted files to download.");
            return;
        }

        try {
            const zip = new JSZip();
            successfulFiles.forEach(f => {
                const baseName = f.name.replace(/\.[^/.]+$/, "");
                zip.file(`${baseName}.md`, f.markdown!);
            });
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted-documents.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Downloaded ${successfulFiles.length} files as ZIP`);
        } catch (error) {
            console.error("ZIP creation failed", error);
            toast.error("Failed to create ZIP file");
        }
    };

    const runConversion = useCallback(async (fileToConvert: DocFileState) => {
        setFiles(prev => prev.map(f => f.id === fileToConvert.id ? { ...f, status: 'converting', error: undefined } : f));
        
        try {
            const result = await convertFile(fileToConvert.file);
            setFiles(prev => prev.map(f => f.id === fileToConvert.id ? { ...f, status: 'success', markdown: result } : f));
        } catch (err) {
            setFiles(prev => prev.map(f => f.id === fileToConvert.id ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' } : f));
        }
    }, [convertFile, setFiles]);

    const handleConvertAll = async () => {
        if (!isReady) return;
        setIsConvertingAll(true);
        
        const pendingFiles = files.filter(f => f.status === 'pending');
        for (const file of pendingFiles) {
            setActiveFileId(file.id);
            await runConversion(file);
        }
        
        setIsConvertingAll(false);
    };

    const handleConvertSingle = async () => {
        if (!activeFile || activeFile.status !== 'pending' || !isReady) return;
        setIsConvertingAll(true);
        await runConversion(activeFile);
        setIsConvertingAll(false);
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => {
            const next = prev.filter(f => f.id !== id);
            if (next.length === 0) {
                // Let the parent component handle empty state by calling onReset or automatically rendering DocumentUploader
            } else if (activeFileId === id) {
                setActiveFileId(next[0].id);
            }
            return next;
        });
    };

    const totalFiles = files.length;
    const completedFiles = files.filter(f => f.status === 'success').length;
    const pendingFiles = files.filter(f => f.status === 'pending').length;
    
    const globalError = pyodideError;

    return (
        <div className="w-full h-[calc(100vh-280px)] min-h-[400px] flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Global Header */}
            <div className="h-14 shrink-0 border-b border-gray-200 bg-gray-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-800 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-primary-600" />
                        {completedFiles} / {totalFiles} Converted
                    </span>
                    {!isReady && !globalError && (
                        <span className="text-xs text-gray-500 flex items-center">
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                            Loading Environment...
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {completedFiles > 1 && (
                        <Button variant="outline" size="sm" onClick={handleDownloadZip} className="bg-white shrink-0">
                            <Archive className="w-4 h-4 mr-2" />
                            Download ZIP
                        </Button>
                    )}
                    {pendingFiles > 0 && (
                        <Button size="sm" onClick={handleConvertAll} disabled={!isReady || isConvertingAll} className="shrink-0">
                            {isConvertingAll ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                <><Play className="w-4 h-4 mr-2" /> Convert All</>
                            )}
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500 hover:text-red-600 hover:bg-red-50 shrink-0" disabled={isConvertingAll}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Start Over
                    </Button>
                </div>
            </div>

            {globalError && (
                <div className="p-3 bg-red-50 border-b border-red-100 text-red-800 text-sm flex items-center shrink-0">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                    <span>System Error: {globalError}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Sidebar - File List */}
                <div className="w-48 sm:w-64 shrink-0 border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-y-auto relative">
                    <div className="p-3 border-b border-gray-100 sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
                        <Button variant="outline" size="sm" onClick={onAddFiles} className="w-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-gray-700 hover:text-primary-600 hover:border-primary-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Files
                        </Button>
                    </div>
                    {files.map(f => (
                        <div
                            key={f.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setActiveFileId(f.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setActiveFileId(f.id);
                                }
                            }}
                            className={cn(
                                "text-left px-3 sm:px-4 py-3 border-b border-gray-100 hover:bg-gray-100 transition-colors flex items-start gap-3 w-full group cursor-pointer",
                                activeFileId === f.id ? "bg-white border-l-2 border-l-primary-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]" : "border-l-2 border-l-transparent"
                            )}
                        >
                            <div className="mt-0.5 shrink-0">
                                {f.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                                {f.status === 'converting' && <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />}
                                {f.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                {f.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={cn(
                                    "text-sm font-medium truncate",
                                    activeFileId === f.id ? "text-gray-900" : "text-gray-600"
                                )}>
                                    {f.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {(f.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50" 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(f.id); }}
                                    title="Remove file"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Area - Active File Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    {activeFile ? (
                        <>
                            {/* Active File Header */}
                            <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
                                <h3 className="text-sm font-medium text-gray-700 truncate pr-4">{activeFile.name}</h3>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(activeFile.id)} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50" title="Remove file">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="w-px h-4 bg-gray-200 mx-1"></div>

                                    {activeFile.status === 'success' && (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 text-gray-600 hidden sm:flex">
                                                <Copy className="w-3.5 h-3.5 mr-1.5" />
                                                Copy
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={handleDownloadSingle} className="h-8">
                                                <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                                                <span className="hidden sm:inline">Download</span>
                                            </Button>
                                        </>
                                    )}
                                    {activeFile.status === 'pending' && (
                                        <Button size="sm" onClick={handleConvertSingle} disabled={!isReady || isConvertingAll} className="h-8">
                                            <Play className="w-3.5 h-3.5 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Convert</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Active File Body */}
                            <div className="flex-1 overflow-auto relative">
                                {activeFile.status === 'success' && activeFile.markdown && (
                                    <div className="absolute inset-0">
                                        <MarkdownEditorClient 
                                            key={activeFile.id}
                                            initialValue={activeFile.markdown} 
                                            hideSampleButton={true} 
                                            wrapperClass="w-full h-full"
                                            heightClass="h-full border-0 rounded-none shadow-none" 
                                        />
                                    </div>
                                )}
                                
                                {activeFile.status === 'converting' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
                                        <p>Converting document...</p>
                                    </div>
                                )}
                                
                                {activeFile.status === 'error' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                            <AlertCircle className="w-6 h-6 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Conversion Failed</h3>
                                        <p className="text-red-600 max-w-md">{activeFile.error}</p>
                                    </div>
                                )}

                                {activeFile.status === 'pending' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                        <FileIcon className="w-12 h-12 text-gray-300 mb-4" strokeWidth={1} />
                                        <p>Ready to convert. Click &apos;Convert&apos; to begin.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a file to view
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
