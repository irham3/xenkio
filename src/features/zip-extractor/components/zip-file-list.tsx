
"use client"

import { ZipFileEntry } from "../types"
import { File, Folder, Download, Search, HardDrive, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface ZipFileListProps {
    files: ZipFileEntry[];
    zipName: string;
    onDownload: (entry: ZipFileEntry) => void;
    onReset: () => void;
}

export function ZipFileList({ files, zipName, onDownload, onReset }: ZipFileListProps) {
    const [search, setSearch] = useState("")

    const filteredFiles = useMemo(() => {
        return files.filter(f => f.path.toLowerCase().includes(search.toLowerCase()))
    }, [files, search])

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const downloadAll = () => {
        files.forEach(f => {
            if (!f.isDirectory) onDownload(f);
        });
    }

    return (
        <div className="w-full space-y-标准 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-medium overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onReset}
                            className="p-2 hover:bg-white hover:shadow-soft rounded-xl transition-all cursor-pointer text-gray-400 hover:text-primary-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h3 className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-xs" title={zipName}>
                                {zipName}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">{files.length} items found</p>
                        </div>
                    </div>

                    <div className="flex flex-1 max-w-md relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search files inside zip..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={downloadAll}
                            className="h-10 rounded-xl px-4 bg-primary-600 hover:bg-primary-700 shadow-primary cursor-pointer text-sm font-bold"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download All
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onReset}
                            className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* File List */}
                <div className="max-h-[600px] overflow-auto scrollbar-themed">
                    <div className="divide-y divide-gray-50">
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group/file",
                                        file.isDirectory ? "bg-gray-50/20" : "bg-white"
                                    )}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            file.isDirectory ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                                        )}>
                                            {file.isDirectory ? <Folder className="w-5 h-5" /> : <File className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate" title={file.path}>
                                                {file.path}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {!file.isDirectory && (
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100/50 px-1.5 py-0.5 rounded">
                                                        {formatSize(file.size)}
                                                    </span>
                                                )}
                                                {file.isDirectory && (
                                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-50/50 px-1.5 py-0.5 rounded">
                                                        Directory
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!file.isDirectory && (
                                        <button
                                            onClick={() => onDownload(file)}
                                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all cursor-pointer opacity-0 group-hover/file:opacity-100"
                                            title="Download this file"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                    <HardDrive className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900">No files found</p>
                                    <p className="text-sm text-gray-400">Try searching for something else</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
