"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, RefreshCw, AlertCircle, Loader2, Copy } from "lucide-react"
import { ConversionStatus, DocFile } from "../types"
import { toast } from "sonner"
import { MarkdownEditorClient } from "@/app/tools/markdown-editor/client"

interface ConversionPanelProps {
    file: DocFile
    status: ConversionStatus
    error: string | null
    markdown: string | null
    onReset: () => void
    onConvert: (file: File) => void
}

export function ConversionPanel({ file, status, error, markdown, onReset, onConvert }: ConversionPanelProps) {
    // const isReady = status === 'ready' || status === 'error' || status === 'success';
    const isConverting = status === 'converting' || status === 'loading_pyodide' || status === 'installing_deps';

    const handleDownload = () => {
        if (!markdown) return;
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace(/\.[^/.]+$/, "")}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (!markdown) return;
        navigator.clipboard.writeText(markdown);
        toast.success("Copied to clipboard");
    };

    let statusText = "Ready to convert";
    if (status === 'loading_pyodide') statusText = "Loading Python Environment...";
    if (status === 'installing_deps') statusText = "Installing Document Parsers...";
    if (status === 'converting') statusText = "Extracting text and converting to Markdown...";

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col space-y-4">
            {/* Top Bar / Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20 z-30 transition-all duration-300">
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: File Info */}
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-gray-900 truncate" title={file.name}>{file.name}</h3>
                            <p className="text-xs text-gray-500 truncate">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {statusText}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        {status === 'success' ? (
                            <>
                                <Button variant="outline" size="sm" onClick={onReset} className="text-gray-600 border-gray-200">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Convert another
                                </Button>
                                <Button variant="secondary" size="sm" onClick={handleCopy} className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-0">
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                                <Button size="sm" onClick={handleDownload} className="shadow-xs">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download MD
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500 mr-2" disabled={isConverting}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => onConvert(file.file)}
                                    disabled={isConverting || status === 'idle'}
                                    className="w-full sm:w-auto"
                                >
                                    {isConverting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Convert File"
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-t border-red-100">
                        <div className="flex items-start text-red-800">
                            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Conversion failed</h4>
                                <p className="text-sm mt-1 opacity-90">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Area */}
            {status === 'success' && markdown && (
                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <MarkdownEditorClient initialValue={markdown} hideSampleButton={true} heightClass="h-[calc(100vh-200px)] min-h-[400px]" />
                </div>
            )}
        </div>
    )
}
