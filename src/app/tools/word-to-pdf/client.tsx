"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { WordUploader } from "@/features/word-to-pdf/components/word-uploader"
import { WordProcess } from "@/features/word-to-pdf/components/word-process"
import { useWordToPdf } from "@/features/word-to-pdf/hooks/use-word-to-pdf"
import { WordFile } from "@/features/word-to-pdf/types"
import { FileText, Shield, Zap } from "lucide-react"

export function WordToPdfClient() {
    const [wordFile, setWordFile] = useState<WordFile | null>(null)
    const { convertToPdf, reset, status, progress, error, pdfBlob } = useWordToPdf()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        if (!file.name.match(/\.(docx|doc)$/i)) {
            alert('Please upload a valid Word document (.docx or .doc)')
            return
        }

        setWordFile({
            file,
            name: file.name,
            size: file.size
        })
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc']
        },
        maxFiles: 1
    })

    const handleReset = useCallback(() => {
        setWordFile(null)
        reset()
    }, [reset])

    const handleConvert = useCallback(() => {
        if (wordFile) {
            convertToPdf(wordFile)
        }
    }, [wordFile, convertToPdf])

    const handleDownload = useCallback(() => {
        if (pdfBlob && wordFile) {
            const url = URL.createObjectURL(pdfBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = wordFile.name.replace(/\.(docx|doc)$/i, '') + '.pdf'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }, [pdfBlob, wordFile])

    if (wordFile) {
        return (
            <div className="py-12">
                <WordProcess
                    file={wordFile}
                    status={status}
                    progress={progress}
                    error={error}
                    onConvert={handleConvert}
                    onReset={handleReset}
                    onDownload={handleDownload}
                />
            </div>
        )
    }

    return (
        <div className="py-12 space-y-20">
            <WordUploader
                isDragActive={isDragActive}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
            />

            {/* Features Section - Standard layout for SEO content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
                <div className="space-y-4 p-8 bg-white rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-shadow">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Instant Conversion</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Convert Word documents to PDF in seconds directly in your browser. No queue, no waiting.
                    </p>
                </div>
                <div className="space-y-4 p-8 bg-white rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-shadow">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Preserves Layout</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Maintains your original formatting, fonts, images, and layout structure during conversion.
                    </p>
                </div>
                <div className="space-y-4 p-8 bg-white rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-shadow">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">100% Private</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Your files are processed locally on your device. We never upload or store your documents.
                    </p>
                </div>
            </div>

            {/* How to Section */}
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">How to Convert Word to PDF</h2>
                    <p className="text-lg text-gray-600">Follow these simple steps to turn your DOCX files into professional PDFs</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        { step: "1", title: "Upload Word File", desc: "Drag and drop your DOCX or DOC file into the box above." },
                        { step: "2", title: "Convert to PDF", desc: "Click 'Convert to PDF' and wait for the conversion to finish." },
                        { step: "3", title: "Download", desc: "Save your new PDF document instantly to your device." }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-4 relative">
                            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                                {item.step}
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
