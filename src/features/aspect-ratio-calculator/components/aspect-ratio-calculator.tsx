'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    ArrowCounterClockwise,
    ArrowsLeftRight,
    ArrowsOut,
    Calculator,
    Check,
    Copy,
    Crop,
    GridFour,
} from '@phosphor-icons/react/dist/ssr';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ActiveTarget = 'width' | 'height';

const PRESETS = [
    { label: '16:9', name: 'Widescreen', width: 1920, height: 1080 },
    { label: '9:16', name: 'Vertical', width: 1080, height: 1920 },
    { label: '1:1', name: 'Square', width: 1080, height: 1080 },
    { label: '4:3', name: 'Classic', width: 1600, height: 1200 },
    { label: '3:2', name: 'Photo', width: 1800, height: 1200 },
    { label: '5:4', name: 'Print', width: 1500, height: 1200 },
    { label: '21:9', name: 'Ultrawide', width: 2560, height: 1080 },
    { label: '2:3', name: 'Portrait', width: 1200, height: 1800 },
];

function sanitizeDimension(value: string): string {
    return value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
}

function toNumber(value: string): number {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

function gcd(a: number, b: number): number {
    let x = Math.abs(a);
    let y = Math.abs(b);

    while (y) {
        const next = y;
        y = x % y;
        x = next;
    }

    return x || 1;
}

function formatCompact(value: number): string {
    return value.toLocaleString('en-US');
}

function formatDecimal(value: number, digits = 4): string {
    return value
        .toFixed(digits)
        .replace(/\.?0+$/, '');
}

function CopyButton({
    value,
    copied,
    onCopy,
    label = 'Copy',
}: {
    value: string;
    copied: boolean;
    onCopy: (value: string) => void;
    label?: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onCopy(value)}
            className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all',
                copied
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            )}
        >
            {copied ? (
                <Check className="h-3.5 w-3.5" weight="duotone" />
            ) : (
                <Copy className="h-3.5 w-3.5" weight="duotone" />
            )}
            {copied ? 'Copied' : label}
        </button>
    );
}

function MetricCard({
    label,
    value,
    detail,
    icon,
    copyValue,
    copied,
    onCopy,
}: {
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
    copyValue: string;
    copied: boolean;
    onCopy: (value: string) => void;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {label}
                    </p>
                    <p className="mt-1 break-words text-2xl font-bold tracking-tight text-gray-900">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{detail}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <CopyButton value={copyValue} copied={copied} onCopy={onCopy} />
            </div>
        </div>
    );
}

export function AspectRatioCalculator() {
    const [sourceWidth, setSourceWidth] = useState('1920');
    const [sourceHeight, setSourceHeight] = useState('1080');
    const [targetWidth, setTargetWidth] = useState('1280');
    const [targetHeight, setTargetHeight] = useState('720');
    const [activeTarget, setActiveTarget] = useState<ActiveTarget>('width');
    const [copied, setCopied] = useState<string | null>(null);

    const source = useMemo(() => {
        const width = toNumber(sourceWidth);
        const height = toNumber(sourceHeight);
        const isValid = width > 0 && height > 0;
        const divisor = isValid ? gcd(width, height) : 1;
        const ratioWidth = isValid ? width / divisor : 0;
        const ratioHeight = isValid ? height / divisor : 0;
        const decimal = isValid ? width / height : 0;
        const orientation =
            !isValid ? 'Unknown' : width === height ? 'Square' : width > height ? 'Landscape' : 'Portrait';

        return {
            width,
            height,
            isValid,
            ratioWidth,
            ratioHeight,
            decimal,
            orientation,
        };
    }, [sourceWidth, sourceHeight]);

    const ratioLabel = source.isValid
        ? `${source.ratioWidth}:${source.ratioHeight}`
        : 'Set dimensions';
    const sourceLabel = source.isValid
        ? `${formatCompact(source.width)} x ${formatCompact(source.height)}`
        : 'Invalid dimensions';
    const cssAspectRatio = source.isValid
        ? `${source.ratioWidth} / ${source.ratioHeight}`
        : '16 / 9';
    const paddingFallback = source.isValid
        ? `${formatDecimal((source.height / source.width) * 100, 3)}%`
        : '56.25%';

    const target = useMemo(() => {
        const inputWidth = toNumber(targetWidth);
        const inputHeight = toNumber(targetHeight);
        const width =
            activeTarget === 'height' && source.isValid
                ? Math.max(1, Math.round(inputHeight * source.decimal))
                : inputWidth;
        const height =
            activeTarget === 'width' && source.isValid
                ? Math.max(1, Math.round(inputWidth / source.decimal))
                : inputHeight;
        const activeValue = activeTarget === 'width' ? inputWidth : inputHeight;
        const isValid = source.isValid && activeValue > 0 && width > 0 && height > 0;
        const scale = isValid ? (width / source.width) * 100 : 0;

        return {
            width,
            height,
            isValid,
            scale,
            label: isValid ? `${formatCompact(width)} x ${formatCompact(height)}` : 'Set a target',
        };
    }, [activeTarget, source.decimal, source.isValid, source.width, targetHeight, targetWidth]);

    const closestPreset = useMemo(() => {
        if (!source.isValid) return null;
        return PRESETS.reduce((closest, preset) => {
            const presetDecimal = preset.width / preset.height;
            const difference = Math.abs(presetDecimal - source.decimal);
            if (!closest || difference < closest.difference) {
                return { ...preset, difference };
            }
            return closest;
        }, null as (typeof PRESETS[number] & { difference: number }) | null);
    }, [source.decimal, source.isValid]);

    const handleCopy = useCallback((value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(value);
        window.setTimeout(() => setCopied(null), 1500);
    }, []);

    const applyPreset = useCallback((width: number, height: number) => {
        setSourceWidth(String(width));
        setSourceHeight(String(height));
    }, []);

    const handleSwap = useCallback(() => {
        setSourceWidth(sourceHeight || '0');
        setSourceHeight(sourceWidth || '0');
    }, [sourceHeight, sourceWidth]);

    const handleReset = useCallback(() => {
        setSourceWidth('1920');
        setSourceHeight('1080');
        setTargetWidth('1280');
        setTargetHeight('720');
        setActiveTarget('width');
    }, []);

    const previewWidth =
        source.orientation === 'Portrait' ? '42%' : source.orientation === 'Square' ? '54%' : '82%';

    return (
        <div className="w-full space-y-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft">
                <div className="grid gap-0 lg:grid-cols-5">
                    <div className="border-b border-gray-100 p-5 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-6">
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Source Dimensions
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                    Enter the original width and height to calculate the simplified ratio.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="source-width" className="text-sm font-semibold text-gray-800">
                                        Width
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="source-width"
                                            type="text"
                                            inputMode="numeric"
                                            value={sourceWidth}
                                            onChange={(event) => setSourceWidth(sanitizeDimension(event.target.value))}
                                            className="h-14 rounded-xl border-gray-200 bg-gray-50 pr-10 text-lg font-semibold focus:bg-white"
                                            placeholder="1920"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                            px
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source-height" className="text-sm font-semibold text-gray-800">
                                        Height
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="source-height"
                                            type="text"
                                            inputMode="numeric"
                                            value={sourceHeight}
                                            onChange={(event) => setSourceHeight(sanitizeDimension(event.target.value))}
                                            className="h-14 rounded-xl border-gray-200 bg-gray-50 pr-10 text-lg font-semibold focus:bg-white"
                                            placeholder="1080"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                            px
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleSwap}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                    <ArrowsLeftRight className="h-3.5 w-3.5" weight="duotone" />
                                    Swap
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                    <ArrowCounterClockwise className="h-3.5 w-3.5" weight="duotone" />
                                    Reset
                                </button>
                            </div>

                            <div className="border-t border-gray-100 pt-5">
                                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Common presets
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRESETS.map((preset) => {
                                        const isActive =
                                            source.ratioWidth === preset.width / gcd(preset.width, preset.height) &&
                                            source.ratioHeight === preset.height / gcd(preset.width, preset.height);

                                        return (
                                            <button
                                                key={`${preset.width}-${preset.height}`}
                                                type="button"
                                                onClick={() => applyPreset(preset.width, preset.height)}
                                                className={cn(
                                                    'rounded-xl border p-3 text-left transition-all',
                                                    isActive
                                                        ? 'border-primary-200 bg-primary-50 text-primary-800'
                                                        : 'border-gray-100 bg-gray-50/70 text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                                                )}
                                            >
                                                <span className="block text-sm font-bold">{preset.label}</span>
                                                <span className="mt-0.5 block text-[11px] text-gray-500">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 p-5 lg:col-span-3 lg:p-6">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Ratio Result
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {source.isValid
                                            ? `${source.orientation} format from ${sourceLabel}`
                                            : 'Enter positive dimensions to calculate'}
                                    </p>
                                </div>
                                {closestPreset && (
                                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                                        Closest {closestPreset.label}
                                    </span>
                                )}
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Simplified ratio
                                        </p>
                                        <p className="mt-1 text-5xl font-bold tracking-tight text-gray-900">
                                            {ratioLabel}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Decimal ratio {source.isValid ? formatDecimal(source.decimal) : '0'}
                                        </p>
                                    </div>
                                    <div className="flex h-48 flex-1 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <div
                                            className="relative rounded-lg border-2 border-primary-300 bg-white shadow-[0_12px_32px_rgba(14,165,233,0.14)]"
                                            style={{
                                                aspectRatio: cssAspectRatio,
                                                width: previewWidth,
                                                maxHeight: '150px',
                                            }}
                                        >
                                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                                {Array.from({ length: 9 }).map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-primary-100/70"
                                                    />
                                                ))}
                                            </div>
                                            <div className="absolute inset-x-0 bottom-2 text-center text-xs font-semibold text-primary-700">
                                                {source.isValid ? ratioLabel : 'Ratio'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <MetricCard
                                    label="CSS"
                                    value={cssAspectRatio}
                                    detail="aspect-ratio value"
                                    icon={<Crop className="h-4 w-4" weight="duotone" />}
                                    copyValue={`aspect-ratio: ${cssAspectRatio};`}
                                    copied={copied === `aspect-ratio: ${cssAspectRatio};`}
                                    onCopy={handleCopy}
                                />
                                <MetricCard
                                    label="Fallback"
                                    value={paddingFallback}
                                    detail="padding-bottom"
                                    icon={<GridFour className="h-4 w-4" weight="duotone" />}
                                    copyValue={`padding-bottom: ${paddingFallback};`}
                                    copied={copied === `padding-bottom: ${paddingFallback};`}
                                    onCopy={handleCopy}
                                />
                                <MetricCard
                                    label="Source"
                                    value={sourceLabel}
                                    detail={source.orientation}
                                    icon={<ArrowsOut className="h-4 w-4" weight="duotone" />}
                                    copyValue={sourceLabel}
                                    copied={copied === sourceLabel}
                                    onCopy={handleCopy}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft">
                <div className="grid gap-0 lg:grid-cols-5">
                    <div className="border-b border-gray-100 p-5 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-6">
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Scale Dimensions
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                    Type a target width or height. The paired value updates using the same ratio.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="target-width" className="text-sm font-semibold text-gray-800">
                                        Target width
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="target-width"
                                            type="text"
                                            inputMode="numeric"
                                            value={activeTarget === 'height' && target.isValid ? String(target.width) : targetWidth}
                                            onChange={(event) => {
                                                setActiveTarget('width');
                                                setTargetWidth(sanitizeDimension(event.target.value));
                                            }}
                                            className={cn(
                                                'h-14 rounded-xl border-gray-200 bg-gray-50 pr-10 text-lg font-semibold focus:bg-white',
                                                activeTarget === 'width' && 'border-primary-300 bg-white'
                                            )}
                                            placeholder="1280"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                            px
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target-height" className="text-sm font-semibold text-gray-800">
                                        Target height
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="target-height"
                                            type="text"
                                            inputMode="numeric"
                                            value={activeTarget === 'width' && target.isValid ? String(target.height) : targetHeight}
                                            onChange={(event) => {
                                                setActiveTarget('height');
                                                setTargetHeight(sanitizeDimension(event.target.value));
                                            }}
                                            className={cn(
                                                'h-14 rounded-xl border-gray-200 bg-gray-50 pr-10 text-lg font-semibold focus:bg-white',
                                                activeTarget === 'height' && 'border-primary-300 bg-white'
                                            )}
                                            placeholder="720"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                            px
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 p-5 lg:col-span-3 lg:p-6">
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Resized Output
                            </h2>
                            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                                    <Calculator className="h-7 w-7" weight="duotone" />
                                </div>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    New dimensions
                                </p>
                                <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
                                    {target.label}
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    {target.isValid
                                        ? `${formatDecimal(target.scale, 2)}% of the original width`
                                        : 'Enter valid source and target dimensions'}
                                </p>

                                <div className="mt-5 flex flex-wrap justify-center gap-2">
                                    <CopyButton
                                        value={target.label}
                                        copied={copied === target.label}
                                        onCopy={handleCopy}
                                        label="Copy size"
                                    />
                                    <CopyButton
                                        value={`${target.width}w ${target.height}h`}
                                        copied={copied === `${target.width}w ${target.height}h`}
                                        onCopy={handleCopy}
                                        label="Copy shorthand"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    {
                                        label: 'Width formula',
                                        value: `height x ${formatDecimal(source.decimal)}`,
                                    },
                                    {
                                        label: 'Height formula',
                                        value: `width / ${formatDecimal(source.decimal)}`,
                                    },
                                    {
                                        label: 'Ratio lock',
                                        value: ratioLabel,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-xl border border-gray-200 bg-white p-4"
                                    >
                                        <p className="text-xs font-medium text-gray-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
