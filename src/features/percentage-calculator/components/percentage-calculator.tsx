'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    ArrowCounterClockwise,
    Calculator,
    Check,
    Copy,
    Minus,
    Percent,
    Plus,
    TrendDown,
    TrendUp,
} from '@phosphor-icons/react/dist/ssr';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type CalculationMode = 'percentOf' | 'percentIs' | 'percentChange' | 'adjustByPercent';
type AdjustmentDirection = 'increase' | 'decrease';

const MODE_OPTIONS: Array<{
    id: CalculationMode;
    title: string;
    description: string;
}> = [
    {
        id: 'percentOf',
        title: 'Percent of',
        description: 'What is P% of a value?',
    },
    {
        id: 'percentIs',
        title: 'Percent share',
        description: 'A is what percent of B?',
    },
    {
        id: 'percentChange',
        title: 'Percent change',
        description: 'From old value to new value.',
    },
    {
        id: 'adjustByPercent',
        title: 'Add or subtract',
        description: 'Increase or decrease by P%.',
    },
];

const EXAMPLES: Array<{
    label: string;
    mode: CalculationMode;
    values: Partial<CalculatorState>;
}> = [
    {
        label: '15% of 240',
        mode: 'percentOf',
        values: { percentOfPercent: '15', percentOfValue: '240' },
    },
    {
        label: '45 of 180',
        mode: 'percentIs',
        values: { percentIsPart: '45', percentIsWhole: '180' },
    },
    {
        label: '120 to 150',
        mode: 'percentChange',
        values: { changeFrom: '120', changeTo: '150' },
    },
    {
        label: '250 + 12%',
        mode: 'adjustByPercent',
        values: { adjustValue: '250', adjustPercent: '12', adjustmentDirection: 'increase' },
    },
];

interface CalculatorState {
    percentOfPercent: string;
    percentOfValue: string;
    percentIsPart: string;
    percentIsWhole: string;
    changeFrom: string;
    changeTo: string;
    adjustValue: string;
    adjustPercent: string;
    adjustmentDirection: AdjustmentDirection;
}

interface CalculationResult {
    isValid: boolean;
    label: string;
    value: string;
    detail: string;
    formula: string;
    secondaryLabel: string;
    secondaryValue: string;
    secondaryDetail: string;
    copyText: string;
    tone: 'primary' | 'positive' | 'negative' | 'neutral';
}

const DEFAULT_STATE: CalculatorState = {
    percentOfPercent: '20',
    percentOfValue: '150',
    percentIsPart: '45',
    percentIsWhole: '180',
    changeFrom: '120',
    changeTo: '150',
    adjustValue: '250',
    adjustPercent: '15',
    adjustmentDirection: 'increase',
};

function sanitizeNumberInput(value: string): string {
    const withoutCommas = value.replace(/,/g, '');
    const hasNegative = withoutCommas.trim().startsWith('-');
    const cleaned = withoutCommas.replace(/[^0-9.]/g, '');
    const [whole, ...decimalParts] = cleaned.split('.');
    const decimal = decimalParts.length > 0 ? `.${decimalParts.join('')}` : '';

    return `${hasNegative ? '-' : ''}${whole}${decimal}`;
}

function toNumber(value: string): number {
    const parsed = Number.parseFloat(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, maximumFractionDigits = 4): string {
    if (!Number.isFinite(value)) return 'Not available';
    const normalized = Math.abs(value) < 1e-10 ? 0 : value;

    return normalized.toLocaleString('en-US', {
        maximumFractionDigits,
    });
}

function formatPercent(value: number): string {
    return `${formatNumber(value, 4)}%`;
}

function getResultIcon(tone: CalculationResult['tone']) {
    if (tone === 'positive') return <TrendUp className="h-5 w-5" weight="duotone" />;
    if (tone === 'negative') return <TrendDown className="h-5 w-5" weight="duotone" />;
    if (tone === 'neutral') return <Calculator className="h-5 w-5" weight="duotone" />;
    return <Percent className="h-5 w-5" weight="duotone" />;
}

function CopyButton({
    value,
    copied,
    onCopy,
}: {
    value: string;
    copied: boolean;
    onCopy: (value: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onCopy(value)}
            className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all',
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
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

function InputField({
    id,
    label,
    value,
    unit,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    unit?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-semibold text-gray-800">
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(event) => onChange(sanitizeNumberInput(event.target.value))}
                    placeholder="0"
                    className={cn(
                        'h-14 bg-gray-50 text-lg font-semibold text-gray-900 placeholder:text-gray-300 focus:bg-white',
                        unit && 'pr-12'
                    )}
                />
                {unit && (
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

function ResultCard({
    label,
    value,
    detail,
    icon,
    className,
}: {
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('rounded-xl border border-gray-200 bg-white p-4 shadow-sm', className)}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {label}
                    </p>
                    <p className="mt-1 break-words text-3xl font-bold tracking-tight text-gray-900">
                        {value}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{detail}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export function PercentageCalculator() {
    const [activeMode, setActiveMode] = useState<CalculationMode>('percentOf');
    const [state, setState] = useState<CalculatorState>(DEFAULT_STATE);
    const [copied, setCopied] = useState(false);

    const updateState = useCallback((key: keyof CalculatorState, value: string | AdjustmentDirection) => {
        setState((current) => ({
            ...current,
            [key]: value,
        }));
    }, []);

    const result = useMemo<CalculationResult>(() => {
        if (activeMode === 'percentOf') {
            const percent = toNumber(state.percentOfPercent);
            const value = toNumber(state.percentOfValue);
            const answer = (percent / 100) * value;

            return {
                isValid: Number.isFinite(answer),
                label: 'Result',
                value: formatNumber(answer),
                detail: `${formatPercent(percent)} of ${formatNumber(value)} equals ${formatNumber(answer)}.`,
                formula: `${formatNumber(value)} x ${formatNumber(percent)} / 100 = ${formatNumber(answer)}`,
                secondaryLabel: 'Remaining value',
                secondaryValue: formatNumber(value - answer),
                secondaryDetail: `Value after subtracting ${formatPercent(percent)}.`,
                copyText: `${formatPercent(percent)} of ${formatNumber(value)} = ${formatNumber(answer)}`,
                tone: 'primary',
            };
        }

        if (activeMode === 'percentIs') {
            const part = toNumber(state.percentIsPart);
            const whole = toNumber(state.percentIsWhole);
            const percent = whole === 0 ? Number.NaN : (part / whole) * 100;

            return {
                isValid: whole !== 0 && Number.isFinite(percent),
                label: 'Percentage',
                value: whole === 0 ? 'Set a total' : formatPercent(percent),
                detail:
                    whole === 0
                        ? 'The total must be greater than or less than zero.'
                        : `${formatNumber(part)} is ${formatPercent(percent)} of ${formatNumber(whole)}.`,
                formula:
                    whole === 0
                        ? 'Part / total x 100'
                        : `${formatNumber(part)} / ${formatNumber(whole)} x 100 = ${formatPercent(percent)}`,
                secondaryLabel: 'Difference to total',
                secondaryValue: formatNumber(whole - part),
                secondaryDetail: 'How much remains between the part and the total.',
                copyText:
                    whole === 0
                        ? 'Percentage cannot be calculated with a zero total.'
                        : `${formatNumber(part)} is ${formatPercent(percent)} of ${formatNumber(whole)}`,
                tone: 'primary',
            };
        }

        if (activeMode === 'percentChange') {
            const from = toNumber(state.changeFrom);
            const to = toNumber(state.changeTo);
            const difference = to - from;
            const percent = from === 0 ? Number.NaN : (difference / Math.abs(from)) * 100;
            const tone = difference > 0 ? 'positive' : difference < 0 ? 'negative' : 'neutral';
            const direction = difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'change';

            return {
                isValid: from !== 0 && Number.isFinite(percent),
                label: 'Percent change',
                value: from === 0 ? 'Set a starting value' : formatPercent(percent),
                detail:
                    from === 0
                        ? 'The starting value cannot be zero for percent change.'
                        : `This is a ${formatPercent(Math.abs(percent))} ${direction}.`,
                formula:
                    from === 0
                        ? '(New value - old value) / old value x 100'
                        : `(${formatNumber(to)} - ${formatNumber(from)}) / ${formatNumber(from)} x 100 = ${formatPercent(percent)}`,
                secondaryLabel: 'Absolute change',
                secondaryValue: formatNumber(difference),
                secondaryDetail: `The value moved from ${formatNumber(from)} to ${formatNumber(to)}.`,
                copyText:
                    from === 0
                        ? 'Percent change cannot be calculated from zero.'
                        : `${formatNumber(from)} to ${formatNumber(to)} = ${formatPercent(percent)} change`,
                tone,
            };
        }

        const value = toNumber(state.adjustValue);
        const percent = toNumber(state.adjustPercent);
        const delta = value * (percent / 100);
        const signedDelta = state.adjustmentDirection === 'increase' ? delta : -delta;
        const adjusted = value + signedDelta;
        const directionLabel = state.adjustmentDirection === 'increase' ? 'increased' : 'decreased';

        return {
            isValid: Number.isFinite(adjusted),
            label: 'Adjusted value',
            value: formatNumber(adjusted),
            detail: `${formatNumber(value)} ${directionLabel} by ${formatPercent(percent)}.`,
            formula:
                state.adjustmentDirection === 'increase'
                    ? `${formatNumber(value)} + (${formatNumber(value)} x ${formatNumber(percent)} / 100) = ${formatNumber(adjusted)}`
                    : `${formatNumber(value)} - (${formatNumber(value)} x ${formatNumber(percent)} / 100) = ${formatNumber(adjusted)}`,
            secondaryLabel: 'Percent amount',
            secondaryValue: formatNumber(Math.abs(delta)),
            secondaryDetail: `The ${formatPercent(percent)} amount before applying it.`,
            copyText: `${formatNumber(value)} ${directionLabel} by ${formatPercent(percent)} = ${formatNumber(adjusted)}`,
            tone: state.adjustmentDirection === 'increase' ? 'positive' : 'negative',
        };
    }, [activeMode, state]);

    const handleCopy = useCallback((value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    }, []);

    const handleReset = useCallback(() => {
        setState(DEFAULT_STATE);
        setActiveMode('percentOf');
    }, []);

    const applyExample = useCallback((example: (typeof EXAMPLES)[number]) => {
        setActiveMode(example.mode);
        setState((current) => ({
            ...current,
            ...example.values,
        }));
    }, []);

    return (
        <div className="w-full space-y-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft">
                <div className="grid gap-0 lg:grid-cols-5">
                    <div className="border-b border-gray-100 p-5 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-6">
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Calculation Type
                                </h2>
                                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                                    {MODE_OPTIONS.map((mode) => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setActiveMode(mode.id)}
                                            className={cn(
                                                'rounded-xl border p-3 text-left transition-all',
                                                activeMode === mode.id
                                                    ? 'border-primary-200 bg-primary-50 text-primary-900'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                            )}
                                        >
                                            <span className="block text-sm font-semibold">
                                                {mode.title}
                                            </span>
                                            <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                                                {mode.description}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100" />

                            {activeMode === 'percentOf' && (
                                <div className="space-y-4">
                                    <InputField
                                        id="percent-of-percent"
                                        label="Percentage"
                                        value={state.percentOfPercent}
                                        unit="%"
                                        onChange={(value) => updateState('percentOfPercent', value)}
                                    />
                                    <InputField
                                        id="percent-of-value"
                                        label="Value"
                                        value={state.percentOfValue}
                                        onChange={(value) => updateState('percentOfValue', value)}
                                    />
                                </div>
                            )}

                            {activeMode === 'percentIs' && (
                                <div className="space-y-4">
                                    <InputField
                                        id="percent-is-part"
                                        label="Part"
                                        value={state.percentIsPart}
                                        onChange={(value) => updateState('percentIsPart', value)}
                                    />
                                    <InputField
                                        id="percent-is-whole"
                                        label="Total"
                                        value={state.percentIsWhole}
                                        onChange={(value) => updateState('percentIsWhole', value)}
                                    />
                                </div>
                            )}

                            {activeMode === 'percentChange' && (
                                <div className="space-y-4">
                                    <InputField
                                        id="percent-change-from"
                                        label="Starting value"
                                        value={state.changeFrom}
                                        onChange={(value) => updateState('changeFrom', value)}
                                    />
                                    <InputField
                                        id="percent-change-to"
                                        label="Final value"
                                        value={state.changeTo}
                                        onChange={(value) => updateState('changeTo', value)}
                                    />
                                </div>
                            )}

                            {activeMode === 'adjustByPercent' && (
                                <div className="space-y-4">
                                    <InputField
                                        id="adjust-value"
                                        label="Value"
                                        value={state.adjustValue}
                                        onChange={(value) => updateState('adjustValue', value)}
                                    />
                                    <InputField
                                        id="adjust-percent"
                                        label="Percentage"
                                        value={state.adjustPercent}
                                        unit="%"
                                        onChange={(value) => updateState('adjustPercent', value)}
                                    />
                                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                                        {(['increase', 'decrease'] as AdjustmentDirection[]).map((direction) => (
                                            <button
                                                key={direction}
                                                type="button"
                                                onClick={() => updateState('adjustmentDirection', direction)}
                                                className={cn(
                                                    'inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold capitalize transition-all',
                                                    state.adjustmentDirection === direction
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                )}
                                            >
                                                {direction === 'increase' ? (
                                                    <Plus className="h-4 w-4" weight="bold" />
                                                ) : (
                                                    <Minus className="h-4 w-4" weight="bold" />
                                                )}
                                                {direction}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-gray-600"
                                >
                                    <ArrowCounterClockwise className="h-3.5 w-3.5" weight="duotone" />
                                    Reset
                                </button>
                                <CopyButton
                                    value={result.copyText}
                                    copied={copied}
                                    onCopy={handleCopy}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50/60 p-5 lg:col-span-3 lg:p-6">
                        <div className="flex h-full flex-col gap-4">
                            <ResultCard
                                label={result.label}
                                value={result.value}
                                detail={result.detail}
                                icon={getResultIcon(result.tone)}
                                className={cn(
                                    result.tone === 'positive' && 'border-emerald-200 bg-emerald-50/70',
                                    result.tone === 'negative' && 'border-rose-200 bg-rose-50/70'
                                )}
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <ResultCard
                                    label={result.secondaryLabel}
                                    value={result.secondaryValue}
                                    detail={result.secondaryDetail}
                                    icon={<Calculator className="h-5 w-5" weight="duotone" />}
                                />
                                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Formula
                                    </p>
                                    <code className="mt-3 block break-words rounded-lg bg-gray-100 px-3 py-2 text-sm leading-relaxed text-gray-700">
                                        {result.formula}
                                    </code>
                                    {!result.isValid && (
                                        <p className="mt-3 text-xs leading-relaxed text-amber-700">
                                            Adjust the inputs to get a valid percentage result.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto rounded-xl border border-gray-200 bg-white p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Percent className="h-4 w-4 text-primary-600" weight="duotone" />
                                    Common calculations
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {EXAMPLES.map((example) => (
                                        <button
                                            key={example.label}
                                            type="button"
                                            onClick={() => applyExample(example)}
                                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                                        >
                                            {example.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
