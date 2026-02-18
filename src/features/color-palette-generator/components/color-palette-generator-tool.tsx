'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PaletteStrip } from './palette-strip';
import { generatePalette } from '../lib/utils';
import { Color } from '../types';
import { RefreshCw, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function ColorPaletteGeneratorTool() {
    const [colors, setColors] = useState<Color[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            setColors(generatePalette(5));
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleGenerate = useCallback(() => {
        setColors(prev => generatePalette(5, prev));
    }, []);

    const toggleLock = useCallback((id: string) => {
        setColors(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
    }, []);

    const handleCopyCSS = () => {
        const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
        navigator.clipboard.writeText(css);
        toast.success("CSS variables copied to clipboard");
    };

    const handleDownloadJson = () => {
        const data = JSON.stringify(colors, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'palette.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("JSON palette downloaded");
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === 'Space') {
                e.preventDefault();
                handleGenerate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleGenerate]);

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] gap-4">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 shrink-0 transition-all hover:shadow-md z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <Button
                        size="default"
                        onClick={handleGenerate}
                        className="font-semibold px-6 shadow-sm bg-primary-600 hover:bg-primary-700 text-white transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate Palette
                    </Button>
                    <span className="hidden md:inline-flex text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 items-center">
                        Press <kbd className="font-bold mx-1">Space</kbd>
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" onClick={handleCopyCSS} title="Copy CSS Variables">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy CSS
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadJson} title="Download JSON">
                        <Download className="w-4 h-4 mr-2" />
                        JSON
                    </Button>
                </div>
            </div>

            {/* Palette Strips Area */}
            <div className="flex-1 w-full relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                {colors.map((color) => (
                    <PaletteStrip
                        key={color.id}
                        color={color}
                        onToggleLock={toggleLock}
                    />
                ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-2">
                Click lock icon <LockIcon className="w-3 h-3 inline align-text-top" /> to keep a color while regenerating others.
            </p>
        </div>
    );
}

// Simple internal icon for helper text
function LockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
