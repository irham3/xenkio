"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
// import { Settings2, FileText, Download, Archive, Loader2 } from "lucide-react" 
import { Settings2, FileImage, Download, Archive, Loader2, Trash2 } from "lucide-react"
import { ConversionOptions, StandardPageSize, ImageFile } from "../types"

const PAGE_SIZE_OPTIONS: { value: StandardPageSize; label: string }[] = [
    { value: "A4", label: "A4 (210 × 297 mm)" },
    { value: "LETTER", label: "Letter (8.5 × 11 in)" },
    { value: "LEGAL", label: "Legal (8.5 × 14 in)" },
]

interface ImageSettingsProps {
    images: ImageFile[];
    options: ConversionOptions;
    onOptionsChange: (options: ConversionOptions) => void;
    onReset: () => void;
    onConvert: () => void;
    isProcessing: boolean;
}

export function ImageSettings({
    images,
    options,
    onOptionsChange,
    onReset,
    onConvert,
    isProcessing
}: ImageSettingsProps) {

    const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
        onOptionsChange({ ...options, [key]: value });
    };

    const totalSize = images.reduce((acc, img) => acc + img.size, 0);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 sticky top-6 h-fit lg:col-span-1">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Settings2 className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold text-gray-900">Settings</h2>
            </div>

            {/* File Info */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-gray-900">
                    <FileImage className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium truncate">
                        {images.length === 1 ? images[0].name : "Multiple Images"}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    <span>{images.length} Image{images.length !== 1 && 's'}</span>
                    <span>{(totalSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Options</Label>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onReset}
                        className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                        title="Reset all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {/* Page Size Mode */}
                <div className="space-y-2">
                    <label className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-gray-300",
                        options.pageMode === "original"
                            ? "border-primary-200 bg-primary-50/50"
                            : "border-gray-200"
                    )}>
                        <input
                            type="radio"
                            name="pageMode"
                            value="original"
                            checked={options.pageMode === "original"}
                            onChange={() => updateOption('pageMode', 'original')}
                            className="w-4 h-4 mt-0.5 text-primary-600 accent-primary-600 cursor-pointer"
                        />
                        <div>
                            <p className="font-medium text-sm text-gray-900">Match Image Size</p>
                            <p className="text-xs text-gray-500 mt-0.5">PDF page matches image size</p>
                        </div>
                    </label>

                    <label className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-gray-300",
                        options.pageMode === "standard"
                            ? "border-primary-200 bg-primary-50/50"
                            : "border-gray-200"
                    )}>
                        <input
                            type="radio"
                            name="pageMode"
                            value="standard"
                            checked={options.pageMode === "standard"}
                            onChange={() => updateOption('pageMode', 'standard')}
                            className="w-4 h-4 mt-0.5 text-primary-600 accent-primary-600 cursor-pointer"
                        />
                        <div>
                            <p className="font-medium text-sm text-gray-900">Standard Paper Size</p>
                            <p className="text-xs text-gray-500 mt-0.5">Fit to A4, Letter, etc.</p>
                        </div>
                    </label>
                </div>

                {/* Standard Size & Orientation */}
                {options.pageMode === "standard" && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200 pt-2 pl-2 border-l-2 border-primary-100 ml-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-gray-500">Paper Size</Label>
                            <select
                                value={options.standardSize}
                                onChange={(e) => updateOption('standardSize', e.target.value as StandardPageSize)}
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow cursor-pointer"
                            >
                                {PAGE_SIZE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-gray-500">Orientation</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateOption('orientation', 'portrait')}
                                    className={cn(
                                        "flex items-center justify-center gap-2 p-2 rounded-lg border text-sm font-medium transition-all",
                                        options.orientation === "portrait"
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="w-3 h-4 border-2 border-current rounded-[1px]" />
                                    Portrait
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateOption('orientation', 'landscape')}
                                    className={cn(
                                        "flex items-center justify-center gap-2 p-2 rounded-lg border text-sm font-medium transition-all",
                                        options.orientation === "landscape"
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="w-4 h-3 border-2 border-current rounded-[1px]" />
                                    Landscape
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100 space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output</Label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                            <input
                                type="radio"
                                name="outputMode"
                                value="single"
                                checked={options.outputMode === "single"}
                                onChange={() => updateOption('outputMode', 'single')}
                                className="w-4 h-4 text-primary-600 accent-primary-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700">Merge all into one PDF</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                            <input
                                type="radio"
                                name="outputMode"
                                value="multiple"
                                checked={options.outputMode === "multiple"}
                                onChange={() => updateOption('outputMode', 'multiple')}
                                className="w-4 h-4 text-primary-600 accent-primary-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700">Separate PDF for each image</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <Button
                    className="w-full h-12 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 cursor-pointer"
                    size="lg"
                    onClick={onConvert}
                    disabled={isProcessing || images.length === 0}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Converting...
                        </>
                    ) : (
                        <>
                            {options.outputMode === "single" ? (
                                <Download className="mr-2 h-5 w-5" />
                            ) : (
                                <Archive className="mr-2 h-5 w-5" />
                            )}
                            Convert & Download
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
