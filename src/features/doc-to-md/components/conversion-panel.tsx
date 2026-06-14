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
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{file.name}</h3>
                            <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {statusText}
                            </p>
                        </div>
                    </div>
                    {status === 'success' ? (
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={handleCopy}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                            <Button onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download MD
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => onConvert(file.file)}
                            disabled={isConverting || status === 'idle'}
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
                    )}
                </div>

                {error && (
                    <div className="p-6 bg-red-50 border-b border-red-100">
                        <div className="flex items-start text-red-800">
                            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold">Conversion failed</h4>
                                <p className="text-sm mt-1 opacity-90">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {status === 'success' && markdown && (
                <div className="mt-8">
                    <MarkdownEditorClient initialValue={markdown} hideSampleButton={true} />
                </div>
            )}

            <div className="flex justify-center pt-4">
                <Button variant="ghost" onClick={onReset} className="text-gray-500">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Convert another file
                </Button>
            </div>
        </div>
    )
}
