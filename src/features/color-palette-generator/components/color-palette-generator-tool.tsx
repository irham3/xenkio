'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PaletteStrip } from './palette-strip';
import { generatePalette } from '../lib/utils';
import { Color } from '../types';
import { RefreshCw, Download, Copy, Sparkles, Info } from 'lucide-react';
import { toast } from 'sonner';
import { RECOMMENDED_PALETTES } from '../constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    const [harmony, setHarmony] = useState<string>("random");

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
                const newColors = generatePalette(diff, prev, harmony);
                return [...prev, ...newColors];
            }
            return prev.slice(0, newCount);
        });
    };

    const handleGenerate = useCallback(() => {
        setColors(prev => generatePalette(colorCount, prev, harmony));
    }, [colorCount, harmony]);

    const toggleLock = useCallback((id: string) => {
        setColors(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
    }, []);

    const handleColorUpdate = (id: string, newHex: string) => {
        setColors(prev => prev.map(c => c.id === id ? { ...c, hex: newHex, locked: true } : c));
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

                        <div className="h-10 w-px bg-gray-100 hidden md:block" />

                        <div className="flex-1 md:w-40 space-y-1">
                            <div className="flex items-center gap-1 px-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Harmony</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-3 h-3 text-gray-300 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs text-xs">
                                            <p className="font-bold mb-1 border-b border-white/20 pb-1">Generator Mode</p>
                                            <ul className="space-y-1 opacity-90">
                                                <li>• <b>Manual input</b> auto-locks the color.</li>
                                                <li>• Locked colors act as <b>anchors</b> for matching.</li>
                                                <li>• <b>Harmony</b> determines how other colors are chosen.</li>
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Select value={harmony} onValueChange={setHarmony}>
                                <SelectTrigger className="h-8 text-xs font-bold border-none shadow-none bg-gray-50 focus:ring-0 rounded-lg">
                                    <SelectValue placeholder="Harmony" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="random">Random</SelectItem>
                                    <SelectItem value="analogous">Analogous</SelectItem>
                                    <SelectItem value="monochromatic">Monochromatic</SelectItem>
                                    <SelectItem value="triadic">Triadic</SelectItem>
                                    <SelectItem value="complementary">Complementary</SelectItem>
                                    <SelectItem value="split-complementary">Split-Comp</SelectItem>
                                    <SelectItem value="shades">Shades</SelectItem>
                                </SelectContent>
                            </Select>
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

            {/* Sidebar - Library & Seed (Right Side) */}
            <aside className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-full">
                {/* Sidebar Tabs */}
                <div className="p-2 border-b border-gray-100 flex items-center gap-1 bg-gray-50/30">
                    <button
                        onClick={() => setSidebarFilter("all")}
                        className={cn(
                            "flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                            sidebarFilter !== "seed" ? "bg-white shadow-sm text-primary-600 border border-gray-100" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Library
                    </button>
                    <button
                        onClick={() => setSidebarFilter("seed")}
                        className={cn(
                            "flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                            sidebarFilter === "seed" ? "bg-white shadow-sm text-primary-600 border border-gray-100" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Seed Box
                    </button>
                </div>

                {/* Sidebar Content */}
                {sidebarFilter !== "seed" ? (
                    <>
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-gray-900 text-[10px] uppercase tracking-widest">
                                <Sparkles className="w-3 h-3 text-primary-500" />
                                <span>Curated</span>
                            </div>
                            <Select value={sidebarFilter === "seed" ? "all" : sidebarFilter} onValueChange={setSidebarFilter}>
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
                    </>
                ) : (
                    <div className="flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                                        <Info className="w-3.5 h-3.5 text-primary-600" />
                                    </div>
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Seed Colors</h3>
                                </div>
                                <label className="cursor-pointer">
                                    <input
                                        type="color"
                                        className="sr-only"
                                        onChange={(e) => {
                                            const hex = e.target.value.toUpperCase();
                                            setColors(prev => {
                                                const newColor = { id: crypto.randomUUID(), hex, locked: true };
                                                // Find first unlocked color or append
                                                const unlockedIdx = prev.findIndex(c => !c.locked);
                                                if (unlockedIdx !== -1) {
                                                    const updated = [...prev];
                                                    updated[unlockedIdx] = newColor;
                                                    return updated;
                                                }
                                                return [...prev, newColor].slice(0, 10);
                                            });
                                        }}
                                    />
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors border border-primary-100 shadow-sm">
                                        <RefreshCw className="w-3 h-3 rotate-45" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Add Color</span>
                                    </div>
                                </label>
                            </div>

                            {/* List of currently locked colors as seeds */}
                            <div className="flex flex-wrap gap-2">
                                {colors.filter(c => c.locked).map(c => (
                                    <div key={c.id} className="group/seed relative flex items-center gap-2 p-1 pr-2 bg-gray-50 border border-gray-100 rounded-lg shadow-sm">
                                        <div className="w-4 h-4 rounded-md shadow-inner" style={{ backgroundColor: c.hex }} />
                                        <span className="text-[10px] font-mono font-bold text-gray-600 uppercase">{c.hex}</span>
                                        <button
                                            onClick={() => toggleLock(c.id)}
                                            className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-[8px] font-black"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {colors.filter(c => c.locked).length === 0 && (
                                    <div className="w-full py-4 px-3 border border-dashed border-gray-200 rounded-xl text-center">
                                        <span className="text-[10px] text-gray-400 font-medium">No seed colors yet</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Bulk HEX Import</label>
                                <textarea
                                    placeholder="Paste HEX codes... e.g. #FF5500, #00A896"
                                    className="w-full h-24 p-3 text-xs font-mono bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const hexes = val.match(/#[0-9A-F]{6}|#[0-9A-F]{3}/gi);
                                        if (hexes) {
                                            const newSeeds = hexes.map(hex => ({
                                                id: crypto.randomUUID(),
                                                hex: hex.toUpperCase(),
                                                locked: true
                                            }));
                                            setColors(prev => {
                                                const nonLocked = prev.filter(c => !c.locked);
                                                const updated = [...newSeeds];
                                                // Refill with non-locked until count is met
                                                for (let i = updated.length; i < colorCount; i++) {
                                                    updated.push(nonLocked.shift() || { id: crypto.randomUUID(), hex: "#F3F4F6", locked: false });
                                                }
                                                return updated.slice(0, colorCount);
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                            onClick={handleGenerate}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Match & Complete
                        </Button>

                        <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 space-y-2">
                            <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest block">Pro Tip</span>
                            <p className="text-[10px] text-orange-600 leading-tight">
                                Added colors are automatically <b>locked</b>. The generator will fill the gaps using the chosen Harmony.
                            </p>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    );
}
