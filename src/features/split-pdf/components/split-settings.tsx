"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { PdfFile, SplitMode, SplitOptions } from "../types"
import { PdfPageGrid } from "./pdf-page-grid"
import { Download, Files, Scissors, Trash2, Settings2, Loader2, FileText } from "lucide-react"

interface SplitSettingsProps {
    pdf: PdfFile;
    onReset: () => void;
    onSplit: (mode: SplitMode, options: SplitOptions) => void;
    isProcessing: boolean;
}

export function SplitSettings({ pdf, onReset, onSplit, isProcessing }: SplitSettingsProps) {
    const [mode, setMode] = useState<SplitMode>('custom');
    const [ranges, setRanges] = useState("");
    const [mergeOutput, setMergeOutput] = useState(false);
    const [splitEachPage, setSplitEachPage] = useState(false);
    const [limitSize, setLimitSize] = useState<string>("");
    const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB' | 'GB'>('MB');
    const [pageOrder, setPageOrder] = useState<number[]>(() =>
        Array.from({ length: pdf.pageCount }, (_, i) => i + 1)
    );

    const isValidRange = useCallback((input: string): boolean => {
        if (!input) return false;
        const regex = /^(\s*\d+(\s*-\s*\d+)?\s*)(,\s*\d+(\s*-\s*\d+)?\s*)*$/;
        if (!regex.test(input)) return false;

        const parts = input.split(',');
        for (const part of parts) {
            const [start, end] = part.split('-').map(p => parseInt(p.trim()));
            if (isNaN(start) || start < 1 || start > pdf.pageCount) return false;
            if (end !== undefined && (isNaN(end) || end < 1 || end > pdf.pageCount || start > end)) return false;
        }
        return true;
    }, [pdf.pageCount]);

    const pagesFromRange = useMemo(() => {
        if (!ranges) return [];
        const pages = new Set<number>();
        const parts = ranges.split(',');
        try {
            parts.forEach(part => {
                const [start, end] = part.split('-').map(p => parseInt(p.trim()));
                if (!isNaN(start)) {
                    const finalEnd = isNaN(end) ? start : end;
                    for (let i = start; i <= finalEnd; i++) {
                        if (i <= pdf.pageCount) pages.add(i);
                    }
                }
            });
        } catch {
            return [];
        }
        return Array.from(pages);
    }, [ranges, pdf.pageCount]);

    const pagesToRanges = (pages: number[]): string => {
        if (pages.length === 0) return "";
        const sorted = [...pages].sort((a, b) => a - b);
        const rangesList: string[] = [];
        let start = sorted[0];
        let prev = start;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] !== prev + 1) {
                rangesList.push(start === prev ? `${start}` : `${start}-${prev}`);
                start = sorted[i];
            }
            prev = sorted[i];
        }
        rangesList.push(start === prev ? `${start}` : `${start}-${prev}`);
        return rangesList.join(", ");
    };

    const handleTogglePage = (pageNum: number) => {
        if (mode !== 'custom') return;
        const currentPages = new Set(pagesFromRange);
        if (currentPages.has(pageNum)) currentPages.delete(pageNum);
        else currentPages.add(pageNum);
        setRanges(pagesToRanges(Array.from(currentPages)));
    };

    const handleSelectAll = () => {
        setRanges(`1-${pdf.pageCount}`);
    };

    const handleDeselectAll = () => {
        setRanges("");
    };

    const getOddPages = () => Array.from({ length: Math.ceil(pdf.pageCount / 2) }, (_, i) => i * 2 + 1);
    const getEvenPages = () => Array.from({ length: Math.floor(pdf.pageCount / 2) }, (_, i) => (i + 1) * 2);

    const handleSubmit = () => {
        if (mode === 'custom') {
            if (!ranges || !isValidRange(ranges)) return;
            onSplit('custom', { ranges, mergeOutput, splitEachPage, pageOrder });
        } else if (mode === 'fixed_size') {
            const size = parseFloat(limitSize);
            if (isNaN(size) || size <= 0) return;

            // Convert to MB for the existing hook logic
            let sizeInMb = size;
            if (sizeUnit === 'KB') sizeInMb = size / 1024;
            else if (sizeUnit === 'GB') sizeInMb = size * 1024;

            onSplit('fixed_size', { limitSize: sizeInMb, pageOrder });
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Preview Grid */}
            <div className="space-y-4 lg:col-span-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === 'custom' ? "Select Pages or Enter Range" : "PDF Preview"}
                    </h2>
                    {mode === 'custom' && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSelectAll} className="cursor-pointer">Select All</Button>
                            <Button variant="ghost" size="sm" onClick={handleDeselectAll} className="cursor-pointer">Clear</Button>
                        </div>
                    )}
                </div>

                <PdfPageGrid
                    pdf={pdf}
                    selectedPages={mode === 'custom' ? pagesFromRange : []}
                    onTogglePage={mode === 'custom' ? handleTogglePage : () => { }}
                    pageOrder={pageOrder}
                    onReorder={setPageOrder}
                />
            </div>

            {/* Right: Settings Panel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 sticky top-6 h-fit lg:col-span-1">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Settings2 className="w-5 h-5 text-primary-600" />
                    <h2 className="font-semibold">Settings</h2>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-gray-900">
                        <FileText className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium truncate" title={pdf.name}>{pdf.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                        <span>{pdf.pageCount} Pages</span>
                        <span>{(pdf.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Split Mode</Label>
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

                    <div className="space-y-2">
                        {/* Custom Mode */}
                        <label className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-gray-300",
                            mode === "custom"
                                ? "border-primary-200 bg-primary-50/50"
                                : "border-gray-200"
                        )}>
                            <input
                                type="radio"
                                name="splitMode"
                                value="custom"
                                checked={mode === "custom"}
                                onChange={() => setMode("custom")}
                                className="w-4 h-4 mt-0.5 text-primary-600 accent-primary-600 cursor-pointer"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <Scissors className="w-4 h-4 text-gray-700" />
                                    <p className="font-medium text-sm text-gray-900">Custom Ranges</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">Select pages or define ranges</p>
                            </div>
                        </label>

                        {/* Fixed Size Mode (New) */}
                        <label className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-gray-300",
                            mode === "fixed_size"
                                ? "border-primary-200 bg-primary-50/50"
                                : "border-gray-200"
                        )}>
                            <input
                                type="radio"
                                name="splitMode"
                                value="fixed_size"
                                checked={mode === "fixed_size"}
                                onChange={() => setMode("fixed_size")}
                                className="w-4 h-4 mt-0.5 text-primary-600 accent-primary-600 cursor-pointer"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <Files className="w-4 h-4 text-gray-700" />
                                    <p className="font-medium text-sm text-gray-900">Split by File Size</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">Split into chunk size limit</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Custom Mode Controls */}
                {mode === "custom" && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Ranges</Label>
                            <Input
                                placeholder="e.g. 1-5, 8, 11-13"
                                value={ranges}
                                onChange={(e) => setRanges(e.target.value)}
                                className={cn("bg-white focus:ring-primary-500", !isValidRange(ranges) && ranges ? "border-red-300 focus:ring-red-200" : "")}
                            />
                            {!isValidRange(ranges) && ranges && (
                                <p className="text-xs text-red-500">Invalid range format</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Select</Label>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setRanges(getOddPages().join(","))} className="text-xs h-8 cursor-pointer">Odd</Button>
                                <Button variant="outline" size="sm" onClick={() => setRanges(getEvenPages().join(","))} className="text-xs h-8 cursor-pointer">Even</Button>
                                <Button variant="outline" size="sm" onClick={() => setRanges(`1-${pdf.pageCount}`)} className="text-xs h-8 cursor-pointer">All</Button>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={mergeOutput}
                                    onChange={(e) => {
                                        setMergeOutput(e.target.checked);
                                        if (e.target.checked) setSplitEachPage(false);
                                    }}
                                    className="w-4 h-4 text-primary-600 accent-primary-600 rounded cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">Merge all ranges into one PDF file</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={splitEachPage}
                                    onChange={(e) => {
                                        setSplitEachPage(e.target.checked);
                                        if (e.target.checked) setMergeOutput(false);
                                    }}
                                    className="w-4 h-4 text-primary-600 accent-primary-600 rounded cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">Each page into a separate PDF file</span>
                            </label>

                            <p className="text-xs text-gray-500 pl-8 pt-1 border-t border-gray-50">
                                {splitEachPage
                                    ? "Every selected page will be saved as an individual PDF document."
                                    : mergeOutput
                                        ? "Selected ranges will be combined into a single downloadable PDF."
                                        : "Each defined range will be saved as a separate PDF file."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Fixed Size Controls */}
                {mode === "fixed_size" && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Size per File</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="e.g. 5"
                                    value={limitSize}
                                    onChange={(e) => setLimitSize(e.target.value)}
                                    className="bg-white focus:ring-primary-500 flex-1"
                                />
                                <select
                                    value={sizeUnit}
                                    onChange={(e) => setSizeUnit(e.target.value as 'KB' | 'MB' | 'GB')}
                                    className="h-10 px-2 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="KB">KB</option>
                                    <option value="MB">MB</option>
                                    <option value="GB">GB</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-500">
                                The file will be split into multiple parts, each estimating under {limitSize || "X"} {sizeUnit}.
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100 space-y-3">
                    <Button
                        size="lg"
                        className="w-full h-12 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 cursor-pointer"
                        onClick={handleSubmit}
                        disabled={
                            isProcessing ||
                            (mode === 'custom' && (!ranges || !isValidRange(ranges))) ||
                            (mode === 'fixed_size' && (!limitSize || parseFloat(limitSize) <= 0))
                        }
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                Split PDF
                            </>
                        )}
                    </Button>
                </div>

                {/* <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        <span className="font-semibold text-gray-600">Tips:</span>
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                        <li>Click pages to toggle selection</li>
                        <li>Use ranges for bulk selection like &quot;1-5, 8&quot;</li>
                        <li>Merge option allows combining selections</li>
                    </ul>
                </div> */}
            </div>
        </div>
    )
}
