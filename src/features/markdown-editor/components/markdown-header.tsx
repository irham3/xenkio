'use client';

import { Code, Eye, Columns2, Sparkles, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ViewMode } from '../types';

interface MarkdownHeaderProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    formattedWords: string;
    formattedChars: string;
    formattedLines: string;
    onLoadSample: () => void;
    isFullscreen: boolean;
    setIsFullscreen: (val: boolean) => void;
}

export function MarkdownHeader({
    viewMode,
    setViewMode,
    formattedWords,
    formattedChars,
    formattedLines,
    onLoadSample,
    isFullscreen,
    setIsFullscreen
}: MarkdownHeaderProps) {
    const VIEW_MODES: { id: ViewMode; name: string; icon: React.ElementType }[] = [
        { id: 'editor', name: 'Editor', icon: Code },
        { id: 'split', name: 'Split', icon: Columns2 },
        { id: 'preview', name: 'Preview', icon: Eye },
    ];

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-gray-200">
                    {VIEW_MODES.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                                viewMode === mode.id
                                    ? "bg-primary-100 text-primary-700"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <mode.icon className="w-3.5 h-3.5" />
                            {mode.name}
                        </button>
                    ))}
                </div>

                <div className="hidden sm:flex items-center gap-3 px-3 text-xs text-gray-500 font-medium tabular-nums">
                    <span>{formattedWords} words</span>
                    <span className="text-gray-300">•</span>
                    <span>{formattedChars} chars</span>
                    <span className="text-gray-300">•</span>
                    <span>{formattedLines} lines</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onLoadSample}
                    className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-all flex items-center gap-1 cursor-pointer"
                >
                    <Sparkles className="w-3 h-3" />
                    Load Sample
                </button>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                    title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
                >
                    {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
