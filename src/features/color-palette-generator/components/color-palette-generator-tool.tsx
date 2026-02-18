'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PaletteStrip } from './palette-strip';
import { generatePalette } from '../lib/utils';
import { Color } from '../types';
import { RefreshCw, Download, Copy, Sparkles, Info } from 'lucide-react';
import { toast } from 'sonner';
import { RECOMMENDED_PALETTES } from '../constants';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

export function ColorPaletteGeneratorTool() {
    const [colorCount, setColorCount] = useState(5);
    const [colors, setColors] = useState<Color[]>([]);
    const [mounted, setMounted] = useState(false);
    const [sidebarFilter, setSidebarFilter] = useState<string>("all");

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            setColors(generatePalette(5));
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    const handleColorCountChange = (newCount: number) => {
        setColorCount(newCount);
        setColors(prev => {
            if (prev.length === newCount) return prev;
            if (newCount > prev.length) {
                const diff = newCount - prev.length;
                const newColors = generatePalette(diff);
                return [...prev, ...newColors];
            }
            return prev.slice(0, newCount);
        });
    };

    const handleGenerate = useCallback(() => {
        setColors(prev => generatePalette(colorCount, prev));
    }, [colorCount]);

    const toggleLock = useCallback((id: string) => {
        setColors(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
    }, []);

    const handleColorUpdate = (id: string, newHex: string) => {
        setColors(prev => prev.map(c => c.id === id ? { ...c, hex: newHex } : c));
    };

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

    const applyRecommended = (paletteColors: string[]) => {
        handleColorCountChange(paletteColors.length);
        setColors(paletteColors.map(hex => ({
            id: crypto.randomUUID(),
            hex: hex,
            locked: false
        })));
        toast.success("Palette applied");
    };

    const filteredRecommended = useMemo(() => {
        if (sidebarFilter === "all") return RECOMMENDED_PALETTES;
        const count = parseInt(sidebarFilter);
        return RECOMMENDED_PALETTES.filter(p => p.count === count);
    }, [sidebarFilter]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto items-stretch lg:h-[700px]">
            {/* Main Editor Area */}
            <main className="flex-1 flex flex-col gap-4 min-w-0 h-full">
                {/* Header Controls */}
                <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-5 justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <Button
                                size="lg"
                                onClick={handleGenerate}
                                className="font-bold px-6 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all active:scale-95 group shadow-lg shadow-primary/20"
                            >
                                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Generate
                            </Button>
                        </div>

                        <div className="h-10 w-px bg-gray-100 hidden md:block" />

                        <div className="flex-1 md:w-48 space-y-1">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colors</span>
                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{colorCount}</span>
                            </div>
                            <Slider
                                value={[colorCount]}
                                onValueChange={(val) => handleColorCountChange(val[0])}
                                min={2}
                                max={10}
                                step={1}
                                className="py-2"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <div className="h-6 w-px bg-gray-100 mx-1 hidden md:block" />

                        <Button variant="ghost" size="sm" onClick={handleCopyCSS} className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3">
                            <Copy className="w-3.5 h-3.5 mr-2" />
                            CSS
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDownloadJson} className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3">
                            <Download className="w-3.5 h-3.5 mr-2" />
                            JSON
                        </Button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 w-full relative bg-white rounded-3xl shadow-xl border-8 border-white overflow-hidden flex flex-col md:flex-row transition-all duration-700 shrink-0">
                    {colors.map((color) => (
                        <PaletteStrip
                            key={color.id}
                            color={color}
                            onToggleLock={toggleLock}
                            onChange={handleColorUpdate}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 py-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        <Info className="w-3 h-3" />
                        Interactive Canvas: Click hex to copy, lock to freeze
                    </div>
                </div>
            </main>

            {/* Sidebar - Recommended Palettes (Moved to Right) */}
            <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-full">
                <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span>Curated Library</span>
                    </div>
                    <Select value={sidebarFilter} onValueChange={setSidebarFilter}>
                        <SelectTrigger className="w-24 h-7 text-[10px] bg-white border-gray-200">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sizes</SelectItem>
                            <SelectItem value="3">3 Colors</SelectItem>
                            <SelectItem value="4">4 Colors</SelectItem>
                            <SelectItem value="5">5 Colors</SelectItem>
                            <SelectItem value="6">6 Colors</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Scrollable container with default scrollbar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredRecommended.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => applyRecommended(p.colors)}
                            className="group w-full flex flex-col gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 text-left"
                        >
                            <div className="flex h-8 w-full rounded-md overflow-hidden shadow-sm">
                                {p.colors.map((c, i) => (
                                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-700 text-[11px] truncate">{p.name}</span>
                                <span className="text-[9px] text-gray-400 font-mono">{p.count}c</span>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>
        </div>
    );
}
