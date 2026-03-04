'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FONT_PAIRS, FONT_PAIR_CATEGORIES, PREVIEW_TEXT, GOOGLE_FONTS_CSS_BASE } from '../constants';
import { FontPair, FontPairCategory, PreviewLayout } from '../types';
import { Copy, Check, Shuffle, Type, LayoutTemplate, FileText, Columns2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

function buildGoogleFontsUrl(fonts: string[]): string {
    const families = fonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`);
    return `${GOOGLE_FONTS_CSS_BASE}?${families.join('&')}&display=swap`;
}

function getUniqueFonts(pairs: FontPair[]): string[] {
    const fonts = new Set<string>();
    pairs.forEach(p => {
        fonts.add(p.heading);
        fonts.add(p.body);
    });
    return Array.from(fonts);
}

function getHeadingFallback(category: FontPairCategory): string {
    if (category.startsWith('serif') || category === 'display-sans') return 'serif';
    if (category.startsWith('mono')) return 'monospace';
    return 'sans-serif';
}

function getCSSSnippet(pair: FontPair): string {
    return `/* ${pair.name} */
/* Import: https://fonts.googleapis.com/css2?family=${pair.heading.replace(/ /g, '+')}:wght@400;700&family=${pair.body.replace(/ /g, '+')}:wght@400;500&display=swap */

h1, h2, h3, h4, h5, h6 {
  font-family: '${pair.heading}', ${getHeadingFallback(pair.category)};
}

body, p {
  font-family: '${pair.body}', sans-serif;
}`;
}

const LAYOUT_OPTIONS: { value: PreviewLayout; label: string; icon: React.ReactNode }[] = [
    { value: 'card', label: 'Card', icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
    { value: 'article', label: 'Article', icon: <FileText className="w-3.5 h-3.5" /> },
    { value: 'hero', label: 'Hero', icon: <Columns2 className="w-3.5 h-3.5" /> },
];

export function FontPairingTool() {
    const [mounted, setMounted] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<FontPairCategory | 'all'>('all');
    const [selectedPair, setSelectedPair] = useState<FontPair>(FONT_PAIRS[0]);
    const [previewLayout, setPreviewLayout] = useState<PreviewLayout>('card');
    const [fontSize, setFontSize] = useState(32);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    // Load all Google Fonts
    useEffect(() => {
        const allFonts = getUniqueFonts(FONT_PAIRS);
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = buildGoogleFontsUrl(allFonts);
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const filteredPairs = useMemo(() => {
        if (categoryFilter === 'all') return FONT_PAIRS;
        return FONT_PAIRS.filter(p => p.category === categoryFilter);
    }, [categoryFilter]);

    const handleCopyCSS = useCallback(async (pair: FontPair) => {
        const css = getCSSSnippet(pair);
        await navigator.clipboard.writeText(css);
        setCopiedId(pair.id);
        toast.success('CSS snippet copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    const handleRandomPair = useCallback(() => {
        const pool = categoryFilter === 'all' ? FONT_PAIRS : FONT_PAIRS.filter(p => p.category === categoryFilter);
        const randomIndex = Math.floor(Math.random() * pool.length);
        setSelectedPair(pool[randomIndex]);
    }, [categoryFilter]);

    const headingFallback = getHeadingFallback(selectedPair.category);

    if (!mounted) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto items-stretch lg:min-h-[700px]">
            {/* Main Preview Area */}
            <main className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Header Controls */}
                <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button
                            size="lg"
                            onClick={handleRandomPair}
                            className="font-bold px-6 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all active:scale-95 group shadow-lg shadow-primary/20"
                        >
                            <Shuffle className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                            Random Pair
                        </Button>

                        <div className="h-10 w-px bg-gray-100 hidden md:block" />

                        {/* Layout switcher */}
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                            {LAYOUT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setPreviewLayout(opt.value)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                        previewLayout === opt.value
                                            ? "bg-white shadow-sm text-primary-600 border border-gray-100"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {opt.icon}
                                    <span className="hidden sm:inline">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-40 space-y-1">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</span>
                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{fontSize}px</span>
                            </div>
                            <Slider
                                value={[fontSize]}
                                onValueChange={(val) => setFontSize(val[0])}
                                min={20}
                                max={64}
                                step={2}
                                className="py-2"
                            />
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCSS(selectedPair)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3"
                        >
                            {copiedId === selectedPair.id ? (
                                <Check className="w-3.5 h-3.5 mr-2 text-green-500" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 mr-2" />
                            )}
                            CSS
                        </Button>
                    </div>
                </div>

                {/* Preview Canvas */}
                <div className="flex-1 w-full bg-white rounded-3xl shadow-xl border-8 border-white overflow-hidden p-8 md:p-12 flex flex-col justify-center">
                    {previewLayout === 'card' && (
                        <div className="max-w-xl mx-auto w-full space-y-6">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]"
                                    style={{ fontFamily: `'${selectedPair.body}', sans-serif` }}>
                                    {selectedPair.name}
                                </span>
                                <h2
                                    className="text-gray-900 font-bold leading-tight"
                                    style={{
                                        fontFamily: `'${selectedPair.heading}', ${headingFallback}`,
                                        fontSize: `${fontSize}px`,
                                    }}
                                >
                                    {PREVIEW_TEXT.heading}
                                </h2>
                            </div>
                            <p
                                className="text-gray-500 leading-relaxed"
                                style={{
                                    fontFamily: `'${selectedPair.body}', sans-serif`,
                                    fontSize: `${Math.max(14, fontSize * 0.45)}px`,
                                }}
                            >
                                {PREVIEW_TEXT.body}
                            </p>
                            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                    <Type className="w-4 h-4 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-700"
                                        style={{ fontFamily: `'${selectedPair.heading}', ${headingFallback}` }}>
                                        {selectedPair.heading}
                                    </p>
                                    <p className="text-[10px] text-gray-400"
                                        style={{ fontFamily: `'${selectedPair.body}', sans-serif` }}>
                                        paired with {selectedPair.body}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {previewLayout === 'article' && (
                        <div className="max-w-2xl mx-auto w-full space-y-6">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]"
                                    style={{ fontFamily: `'${selectedPair.body}', sans-serif` }}>
                                    Article Preview
                                </span>
                                <h1
                                    className="text-gray-900 font-bold leading-tight"
                                    style={{
                                        fontFamily: `'${selectedPair.heading}', ${headingFallback}`,
                                        fontSize: `${fontSize}px`,
                                    }}
                                >
                                    {PREVIEW_TEXT.heading}
                                </h1>
                                <p
                                    className="text-gray-400 font-medium"
                                    style={{
                                        fontFamily: `'${selectedPair.body}', sans-serif`,
                                        fontSize: `${Math.max(14, fontSize * 0.45)}px`,
                                    }}
                                >
                                    {PREVIEW_TEXT.subheading}
                                </p>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <p
                                className="text-gray-600 leading-relaxed"
                                style={{
                                    fontFamily: `'${selectedPair.body}', sans-serif`,
                                    fontSize: `${Math.max(14, fontSize * 0.42)}px`,
                                    lineHeight: '1.8',
                                }}
                            >
                                {PREVIEW_TEXT.body}
                            </p>
                            <h3
                                className="text-gray-800 font-bold"
                                style={{
                                    fontFamily: `'${selectedPair.heading}', ${headingFallback}`,
                                    fontSize: `${Math.max(18, fontSize * 0.6)}px`,
                                }}
                            >
                                Section Heading Example
                            </h3>
                            <p
                                className="text-gray-600 leading-relaxed"
                                style={{
                                    fontFamily: `'${selectedPair.body}', sans-serif`,
                                    fontSize: `${Math.max(14, fontSize * 0.42)}px`,
                                    lineHeight: '1.8',
                                }}
                            >
                                {PREVIEW_TEXT.short}
                            </p>
                        </div>
                    )}

                    {previewLayout === 'hero' && (
                        <div className="text-center max-w-3xl mx-auto w-full space-y-6">
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]"
                                style={{ fontFamily: `'${selectedPair.body}', sans-serif` }}>
                                Hero Preview
                            </span>
                            <h1
                                className="text-gray-900 font-bold leading-tight"
                                style={{
                                    fontFamily: `'${selectedPair.heading}', ${headingFallback}`,
                                    fontSize: `${fontSize * 1.2}px`,
                                }}
                            >
                                {PREVIEW_TEXT.heading}
                            </h1>
                            <p
                                className="text-gray-500 max-w-lg mx-auto leading-relaxed"
                                style={{
                                    fontFamily: `'${selectedPair.body}', sans-serif`,
                                    fontSize: `${Math.max(14, fontSize * 0.5)}px`,
                                }}
                            >
                                {PREVIEW_TEXT.subheading}
                            </p>
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <div
                                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm"
                                    style={{ fontFamily: `'${selectedPair.body}', sans-serif` }}
                                >
                                    Get Started
                                </div>
                                <div
                                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm"
                                    style={{ fontFamily: `'${selectedPair.body}', sans-serif` }}
                                >
                                    Learn More
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Font Info Bar */}
                <div className="flex items-center justify-center gap-2 py-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        <Type className="w-3 h-3" />
                        {selectedPair.heading} + {selectedPair.body}
                    </div>
                </div>
            </main>

            {/* Sidebar - Font Pair Library */}
            <aside className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden lg:h-[700px]">
                {/* Category Filter */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-[10px] uppercase tracking-widest">
                        <Type className="w-3 h-3 text-primary-500" />
                        <span>Font Pairs</span>
                    </div>
                    <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val as FontPairCategory | 'all')}>
                        <SelectTrigger className="h-8 text-xs font-bold border-gray-200 bg-gray-50 focus:ring-0 rounded-lg">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {FONT_PAIR_CATEGORIES.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Font Pair List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredPairs.map(pair => (
                        <button
                            key={pair.id}
                            onClick={() => setSelectedPair(pair)}
                            className={cn(
                                "group w-full flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 text-left",
                                selectedPair.id === pair.id
                                    ? "border-primary-300 bg-primary-50/50 shadow-sm"
                                    : "border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"
                            )}
                        >
                            {/* Font preview strip */}
                            <div className="w-full rounded-lg overflow-hidden bg-gray-50 p-3 space-y-1">
                                <p
                                    className="text-gray-900 font-bold text-sm truncate"
                                    style={{ fontFamily: `'${pair.heading}', ${getHeadingFallback(pair.category)}` }}
                                >
                                    {pair.heading}
                                </p>
                                <p
                                    className="text-gray-500 text-xs truncate"
                                    style={{ fontFamily: `'${pair.body}', sans-serif` }}
                                >
                                    {pair.body}
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-700 text-[11px] truncate">{pair.name}</span>
                                <span className="text-[9px] text-gray-400 font-mono">{FONT_PAIR_CATEGORIES.find(c => c.id === pair.category)?.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Copy CSS */}
                <div className="p-4 border-t border-gray-100">
                    <Button
                        className="w-full h-11 font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                        onClick={() => handleCopyCSS(selectedPair)}
                    >
                        {copiedId === selectedPair.id ? (
                            <Check className="w-4 h-4 mr-2" />
                        ) : (
                            <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copy CSS for {selectedPair.name}
                    </Button>
                    <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-100 space-y-2">
                        <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest block">Pro Tip</span>
                        <p className="text-[10px] text-orange-600 leading-tight">
                            {selectedPair.description}
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
