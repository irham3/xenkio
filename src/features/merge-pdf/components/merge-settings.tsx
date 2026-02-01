"use client"

import { Settings2, Download, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { PageSizeMode, StandardPageSize, PAGE_SIZE_OPTIONS } from "../types"

interface MergeSettingsProps {
    outputFilename: string
    setOutputFilename: (value: string) => void
    pageMode: PageSizeMode
    setPageMode: (value: PageSizeMode) => void
    standardSize: StandardPageSize
    setStandardSize: (value: StandardPageSize) => void
    error: string | null
    pdfFilesCount: number
    isProcessing: boolean
    onMerge: () => void
}

export function MergeSettings({
    outputFilename,
    setOutputFilename,
    pageMode,
    setPageMode,
    standardSize,
    setStandardSize,
    error,
    pdfFilesCount,
    isProcessing,
    onMerge
}: MergeSettingsProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 sticky top-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Settings2 className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold">Settings</h2>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output Filename</Label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={outputFilename}
                            onChange={(e) => setOutputFilename(e.target.value)}
                            placeholder="merged"
                            className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-400">.pdf</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Size</Label>
                    <div className="space-y-2">
                        <label className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                            pageMode === "default"
                                ? "border-primary-200 bg-primary-50/50"
                                : "border-gray-200 hover:border-gray-300"
                        )}>
                            <input
                                type="radio"
                                name="pageMode"
                                value="default"
                                checked={pageMode === "default"}
                                onChange={(e) => setPageMode(e.target.value as PageSizeMode)}
                                className="w-4 h-4 mt-0.5 text-primary-600 accent-primary-600"
                            />
                            <div>
                                <p className="font-medium text-sm text-gray-900">Keep Original</p>
                                <p className="text-xs text-gray-500">Preserve original dimensions</p>
                            </div>
                        </label>
                        <label className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                            pageMode === "standard"
                                ? "border-primary-200 bg-primary-50/50"
                                : "border-gray-200 hover:border-gray-300"
                        )}>
                            <input
                                type="radio"
                                name="pageMode"
                                value="standard"
                                checked={pageMode === "standard"}
                                onChange={(e) => setPageMode(e.target.value as PageSizeMode)}
                                className="w-4 h-4 mt-0.5 text-primary-600 accent-primary-600"
                            />
                            <div>
                                <p className="font-medium text-sm text-gray-900">Standardize</p>
                                <p className="text-xs text-gray-500">Resize to uniform size</p>
                            </div>
                        </label>
                    </div>
                </div>

                {pageMode === "standard" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Size</Label>
                        <select
                            value={standardSize}
                            onChange={(e) => setStandardSize(e.target.value as StandardPageSize)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {PAGE_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                )}
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="pt-4 border-t border-gray-100 space-y-3">
                <Button
                    className="w-full h-12 cursor-pointer"
                    size="lg"
                    onClick={onMerge}
                    disabled={pdfFilesCount < 2 || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Merging...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-5 w-5" />
                            Merge PDF
                        </>
                    )}
                </Button>
                {pdfFilesCount === 1 && (
                    <p className="text-xs text-gray-400 text-center">
                        Add at least 2 PDFs to merge
                    </p>
                )}
            </div>

            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-600">Tips:</span>
                </p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li>Drag cards to reorder</li>
                    <li>Click rotate button to rotate pages</li>
                    <li>Hover cards to see actions</li>
                </ul>
            </div>
        </div>
    )
}
