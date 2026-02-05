"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { FileText, Download, RefreshCcw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { WordFile, ConversionStatus } from "../types"
import { motion } from "framer-motion"

interface WordProcessProps {
    file: WordFile
    status: ConversionStatus
    progress: number
    error: string | null
    onConvert: () => void
    onReset: () => void
    onDownload: () => void
}

export function WordProcess({
    file,
    status,
    progress,
    error,
    onConvert,
    onReset,
    onDownload
}: WordProcessProps) {
    return (
        <Card className="w-full max-w-2xl mx-auto p-8 shadow-large bg-white/80 backdrop-blur-sm border-gray-100">
            <div className="flex flex-col items-center text-center space-y-6">

                {/* File Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl w-full border border-gray-100">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {status === 'idle' && (
                        <Button variant="ghost" size="icon" onClick={onReset} className="text-gray-400 hover:text-red-500">
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Status: Idle */}
                {status === 'idle' && (
                    <div className="w-full space-y-4">
                        <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100/50 text-sm text-primary-700">
                            Ready to convert <strong>{file.name}</strong> to PDF.
                        </div>
                        <Button
                            onClick={onConvert}
                            size="lg"
                            className="w-full h-12 text-base shadow-primary hover:shadow-primary-lg transition-all"
                        >
                            Convert to PDF
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {/* Status: Processing */}
                {status === 'processing' && (
                    <div className="w-full space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-primary-600">Converting...</span>
                                <span className="text-gray-500">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                        <p className="text-sm text-gray-500 animate-pulse">
                            Parsing document and generating PDF...
                        </p>
                    </div>
                )}

                {/* Status: Completed */}
                {status === 'completed' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-6"
                    >
                        <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-2xl border border-green-100 space-y-3">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-green-700">Conversion Successful!</h3>
                            <p className="text-green-600/80 text-sm">Your PDF is ready for download</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={onReset} className="h-12 border-gray-200">
                                Convert Another
                            </Button>
                            <Button onClick={onDownload} className="h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Status: Error */}
                {status === 'error' && (
                    <div className="w-full space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100 text-left">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-red-700">Conversion Failed</h4>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                        <Button onClick={onReset} variant="outline" className="w-full">
                            Try Again
                        </Button>
                    </div>
                )}

            </div>
        </Card>
    )
}
