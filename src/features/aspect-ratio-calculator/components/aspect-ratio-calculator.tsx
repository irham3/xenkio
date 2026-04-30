'use client';

import { useState, useMemo, useCallback } from 'react';
import { Copy, Check, RotateCcw, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AspectRatioMode } from '../types';

function gcd(a: number, b: number): number {
    a = Math.round(a);
    b = Math.round(b);
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

const COMMON_RATIOS = [
    { label: '16:9', w: 16, h: 9, desc: 'HD / Full HD / 4K (widescreen)' },
    { label: '4:3', w: 4, h: 3, desc: 'Traditional TV / monitor' },
    { label: '1:1', w: 1, h: 1, desc: 'Square (Instagram, avatar)' },
    { label: '21:9', w: 21, h: 9, desc: 'Ultrawide / cinematic' },
    { label: '9:16', w: 9, h: 16, desc: 'Vertical video (Reels, Shorts)' },
    { label: '3:2', w: 3, h: 2, desc: 'DSLR / APS-C sensor' },
    { label: '2:1', w: 2, h: 1, desc: 'Cinematic scope' },
    { label: '4:5', w: 4, h: 5, desc: 'Instagram portrait' },
    { label: '5:4', w: 5, h: 4, desc: 'Medium format / print' },
    { label: '3:4', w: 3, h: 4, desc: 'Portrait monitor' },
];

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function findCommonMatch(wPart: number, hPart: number): string | null {
    const match = COMMON_RATIOS.find((r) => r.w === wPart && r.h === hPart);
    return match ? match.label : null;
}

export function AspectRatioCalculator() {
    const [mode, setMode] = useState<AspectRatioMode>('calculate');
    const [calcWidth, setCalcWidth] = useState('1920');
    const [calcHeight, setCalcHeight] = useState('1080');
    const [scaleWidth, setScaleWidth] = useState('1920');
    const [scaleHeight, setScaleHeight] = useState('1080');
    const [scaleNewWidth, setScaleNewWidth] = useState('1280');
    const [scaleNewHeight, setScaleNewHeight] = useState('');
    const [scaleLock, setScaleLock] = useState<'width' | 'height'>('width');
    const [copied, setCopied] = useState<string | null>(null);

    const calcResult = useMemo(() => {
        const w = parseFloat(calcWidth);
        const h = parseFloat(calcHeight);
        if (!w || !h || w <= 0 || h <= 0) return null;
        const d = gcd(Math.round(w), Math.round(h));
        const wp = Math.round(w) / d;
        const hp = Math.round(h) / d;
        const decimal = w / h;
        const orientation = w > h ? 'landscape' : w < h ? 'portrait' : 'square';
        return {
            ratio: `${wp}:${hp}`,
            gcd: d,
            widthPart: wp,
            heightPart: hp,
            decimal,
            orientation,
            commonMatch: findCommonMatch(wp, hp),
        };
    }, [calcWidth, calcHeight]);

    const scaleResult = useMemo(() => {
        const w = parseFloat(scaleWidth);
        const h = parseFloat(scaleHeight);
        if (!w || !h || w <= 0 || h <= 0) return null;
        const ratio = w / h;

        if (scaleLock === 'width') {
            const nw = parseFloat(scaleNewWidth);
            if (!nw || nw <= 0) return null;
            const nh = nw / ratio;
            return { newWidth: nw, newHeight: Math.round(nh), ratio };
        } else {
            const nh = parseFloat(scaleNewHeight);
            if (!nh || nh <= 0) return null;
            const nw = nh * ratio;
            return { newWidth: Math.round(nw), newHeight: nh, ratio };
        }
    }, [scaleWidth, scaleHeight, scaleNewWidth, scaleNewHeight, scaleLock]);

    const handleCopy = useCallback((text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        }).catch(() => {
            // Silently fail if clipboard is not available
        });
    }, []);

    const handleReset = useCallback(() => {
        if (mode === 'calculate') {
            setCalcWidth('');
            setCalcHeight('');
        } else {
            setScaleWidth('');
            setScaleHeight('');
            setScaleNewWidth('');
            setScaleNewHeight('');
        }
    }, [mode]);

    const handleQuickRatio = useCallback((w: number, h: number) => {
        if (mode === 'calculate') {
            setCalcWidth(String(w * 100));
            setCalcHeight(String(h * 100));
        } else {
            setScaleWidth(String(w * 100));
            setScaleHeight(String(h * 100));
        }
    }, [mode]);

    return (
        <div className="space-y-6">
            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                {(['calculate', 'scale'] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                            'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                            mode === m
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700',
                        )}
                    >
                        {m === 'calculate' ? 'Calculate Ratio' : 'Scale Dimensions'}
                    </button>
                ))}
            </div>

            {/* Calculate Mode */}
            {mode === 'calculate' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900">Dimensions</h2>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Width (px)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={calcWidth}
                                        onChange={(e) => setCalcWidth(e.target.value)}
                                        placeholder="1920"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                                <div className="pt-5 text-gray-400 font-medium select-none">×</div>
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Height (px)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={calcHeight}
                                        onChange={(e) => setCalcHeight(e.target.value)}
                                        placeholder="1080"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Visual preview */}
                            {calcResult && (
                                <div className="pt-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preview</p>
                                    <div className="flex items-center justify-center h-28 bg-gray-50 rounded-xl border border-gray-100">
                                        <div
                                            className="bg-gray-800 rounded"
                                            style={{
                                                aspectRatio: `${calcResult.widthPart} / ${calcResult.heightPart}`,
                                                maxWidth: '100%',
                                                maxHeight: '96px',
                                                width: calcResult.decimal >= 1
                                                    ? `${Math.min(96 * calcResult.decimal, 160)}px`
                                                    : `${Math.min(96, 160)}px`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Presets */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                            <h2 className="font-semibold text-gray-900 text-sm">Quick Presets</h2>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_RATIOS.map((r) => (
                                    <button
                                        key={r.label}
                                        type="button"
                                        onClick={() => handleQuickRatio(r.w, r.h)}
                                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all"
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                        {calcResult ? (
                            <>
                                {/* Main ratio result */}
                                <div className="bg-gray-900 text-white rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-400">Aspect Ratio</p>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(calcResult.ratio, 'ratio')}
                                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                        >
                                            {copied === 'ratio' ? (
                                                <Check className="w-3.5 h-3.5 text-green-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                            {copied === 'ratio' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="text-4xl font-bold tracking-tight">{calcResult.ratio}</p>
                                    {calcResult.commonMatch && (
                                        <span className="inline-block px-2.5 py-1 bg-white/10 rounded-lg text-xs font-medium text-gray-300">
                                            {calcResult.commonMatch}
                                        </span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Decimal', value: calcResult.decimal.toFixed(4), key: 'decimal' },
                                        { label: 'Orientation', value: capitalize(calcResult.orientation), key: 'orientation' },
                                        { label: 'GCD', value: String(calcResult.gcd), key: 'gcd' },
                                        { label: 'Reduced', value: `${calcResult.widthPart} × ${calcResult.heightPart}`, key: 'reduced' },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="bg-white border border-gray-200 rounded-xl p-4"
                                        >
                                            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(stat.value, stat.key)}
                                                    className="text-gray-300 hover:text-gray-600 transition-colors"
                                                >
                                                    {copied === stat.key ? (
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10">
                                <p className="text-sm text-gray-400 text-center">
                                    Enter width and height to<br />calculate the aspect ratio
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Scale Mode */}
            {mode === 'scale' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900">Original Dimensions</h2>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Width</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={scaleWidth}
                                        onChange={(e) => setScaleWidth(e.target.value)}
                                        placeholder="1920"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                                <div className="pt-5 text-gray-400 font-medium select-none">×</div>
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Height</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={scaleHeight}
                                        onChange={(e) => setScaleHeight(e.target.value)}
                                        placeholder="1080"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900">Scale To</h2>
                                <button
                                    type="button"
                                    onClick={() => setScaleLock(scaleLock === 'width' ? 'height' : 'width')}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-all hover:border-gray-900"
                                >
                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                    Lock: {scaleLock === 'width' ? 'Width' : 'Height'}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={cn('flex-1 space-y-1.5', scaleLock !== 'width' && 'opacity-40')}>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Width</label>
                                    <input
                                        type="number"
                                        min="1"
                                        disabled={scaleLock !== 'width'}
                                        value={scaleNewWidth}
                                        onChange={(e) => setScaleNewWidth(e.target.value)}
                                        placeholder="1280"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="pt-5 text-gray-400 font-medium select-none">×</div>
                                <div className={cn('flex-1 space-y-1.5', scaleLock !== 'height' && 'opacity-40')}>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Height</label>
                                    <input
                                        type="number"
                                        min="1"
                                        disabled={scaleLock !== 'height'}
                                        value={scaleNewHeight}
                                        onChange={(e) => setScaleNewHeight(e.target.value)}
                                        placeholder="720"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                            <h2 className="font-semibold text-gray-900 text-sm">Quick Presets</h2>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_RATIOS.map((r) => (
                                    <button
                                        key={r.label}
                                        type="button"
                                        onClick={() => handleQuickRatio(r.w, r.h)}
                                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all"
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="space-y-4">
                        {scaleResult ? (
                            <>
                                <div className="bg-gray-900 text-white rounded-2xl p-6 space-y-4">
                                    <p className="text-sm text-gray-400">Scaled Dimensions</p>
                                    <div className="flex items-center gap-2">
                                        <div className="space-y-1">
                                            <p className="text-3xl font-bold">{scaleResult.newWidth}</p>
                                            <p className="text-xs text-gray-400">Width (px)</p>
                                        </div>
                                        <span className="text-2xl text-gray-500 font-light px-2">×</span>
                                        <div className="space-y-1">
                                            <p className="text-3xl font-bold">{scaleResult.newHeight}</p>
                                            <p className="text-xs text-gray-400">Height (px)</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(`${scaleResult.newWidth}x${scaleResult.newHeight}`, 'scale')}
                                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copied === 'scale' ? (
                                            <Check className="w-3.5 h-3.5 text-green-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                        {copied === 'scale' ? 'Copied' : `Copy ${scaleResult.newWidth}×${scaleResult.newHeight}`}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Scale Factor', value: scaleLock === 'width' ? `${(scaleResult.newWidth / parseFloat(scaleWidth)).toFixed(3)}×` : `${(scaleResult.newHeight / parseFloat(scaleHeight)).toFixed(3)}×`, key: 'factor' },
                                        { label: 'Ratio (decimal)', value: scaleResult.ratio.toFixed(4), key: 'ratioD' },
                                        { label: 'New Width', value: `${scaleResult.newWidth}px`, key: 'nw' },
                                        { label: 'New Height', value: `${scaleResult.newHeight}px`, key: 'nh' },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="bg-white border border-gray-200 rounded-xl p-4"
                                        >
                                            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(stat.value, stat.key)}
                                                    className="text-gray-300 hover:text-gray-600 transition-colors"
                                                >
                                                    {copied === stat.key ? (
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10">
                                <p className="text-sm text-gray-400 text-center">
                                    Enter original dimensions and a<br />new value to scale proportionally
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Common Aspect Ratios Reference */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Common Aspect Ratios</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {COMMON_RATIOS.map((r) => (
                        <button
                            key={r.label}
                            type="button"
                            onClick={() => handleQuickRatio(r.w, r.h)}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-left group"
                        >
                            {/* Mini ratio visual */}
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                <div
                                    className="bg-gray-700 rounded-sm"
                                    style={{
                                        aspectRatio: `${r.w} / ${r.h}`,
                                        width: r.w >= r.h ? '22px' : `${Math.round(22 * r.w / r.h)}px`,
                                        height: r.h > r.w ? '22px' : `${Math.round(22 * r.h / r.w)}px`,
                                    }}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                                <p className="text-xs text-gray-500">{r.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
