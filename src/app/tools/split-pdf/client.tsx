"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { PdfUploader } from "@/features/split-pdf/components/pdf-uploader"
import { SplitSettings } from "@/features/split-pdf/components/split-settings"
import { useSplitPdf } from "@/features/split-pdf/hooks/use-split-pdf"
import { PdfFile, SplitMode, SplitOptions } from "@/features/split-pdf/types"
import JSZip from "jszip"

export function SplitPdfClient() {
    const [pdfFile, setPdfFile] = useState<PdfFile | null>(null)
    const { loadPdf, splitPdf, isProcessing } = useSplitPdf()

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file')
            return
        }

        try {
            const loadedPdf = await loadPdf(file);
            setPdfFile(loadedPdf);
        } catch (err) {
            console.error(err);
            alert('Failed to load PDF');
        }
    }, [loadPdf]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleReset = () => {
        setPdfFile(null);
    }

    const handleSplit = async (mode: SplitMode, options: SplitOptions) => {
        if (!pdfFile) return;

        try {
            const blobs = await splitPdf(pdfFile, mode, options);

            if (blobs.length === 0) {
                alert("No pages selected or invalid range.");
                return;
            }

            if (blobs.length === 1) {
                // Download single file
                const url = URL.createObjectURL(blobs[0]);
                const a = document.createElement('a');
                a.href = url;
                a.download = mode === 'custom'
                    ? `${pdfFile.name.replace('.pdf', '')}-extracted.pdf`
                    : `${pdfFile.name.replace('.pdf', '')}-split.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                // Zip multiple files
                const zip = new JSZip();
                blobs.forEach((blob: Blob, index: number) => {
                    zip.file(`${pdfFile.name.replace('.pdf', '')}-part-${index + 1}.pdf`, blob);
                });

                const content = await zip.generateAsync({ type: "blob" });
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${pdfFile.name.replace('.pdf', '')}-split.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Split failed:", error);
            alert("Failed to split PDF. Please check the console for details.");
        }
    };

    if (!pdfFile) {
        return (
            <div className="py-12">
                <PdfUploader
                    isDragActive={isDragActive}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                />

                {/* Features Section - Standard layout for SEO content */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Select & Extract</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Visually select specific pages from your PDF and extract them into a new document instantly.
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Split by Ranges</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Split your PDF into multiple files based on page ranges (e.g. 1-5, 6-10).
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">100% Private</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Your files are processed locally in your browser and never uploaded to any server.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <SplitSettings
            key={pdfFile.name + pdfFile.size}
            pdf={pdfFile}
            onReset={handleReset}
            onSplit={handleSplit}
            isProcessing={isProcessing}
        />
    )
}
