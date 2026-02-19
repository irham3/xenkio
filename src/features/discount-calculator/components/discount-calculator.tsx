'use client';

import { useState, useMemo, useCallback } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_DISCOUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75];

function formatCurrency(value: number): string {
    if (value >= 1_000_000_000) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    if (Number.isInteger(value)) {
        return value.toLocaleString('en-US');
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseNumericInput(raw: string): string {
    // Allow digits, dots, and commas only
    return raw.replace(/[^0-9.,]/g, '');
}

function inputToNumber(raw: string): number {
    if (!raw) return 0;
    // Remove commas used as thousand separators
    const cleaned = raw.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

export function DiscountCalculator() {
    const [price, setPrice] = useState('250000');
    const [discount, setDiscount] = useState('20');
    const [additionalDiscount, setAdditionalDiscount] = useState('');
    const [taxRate, setTaxRate] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const priceNum = useMemo(() => inputToNumber(price), [price]);
    const discountNum = useMemo(() => {
        const d = parseFloat(discount);
        return isNaN(d) ? 0 : Math.min(Math.max(d, 0), 100);
    }, [discount]);
    const additionalNum = useMemo(() => {
        if (!additionalDiscount) return 0;
        const d = parseFloat(additionalDiscount);
        return isNaN(d) ? 0 : Math.min(Math.max(d, 0), 100);
    }, [additionalDiscount]);
    const taxNum = useMemo(() => {
        if (!taxRate) return 0;
        const t = parseFloat(taxRate);
        return isNaN(t) ? 0 : Math.max(t, 0);
    }, [taxRate]);

    const result = useMemo(() => {
        if (priceNum <= 0) return null;

        // First discount
        const firstSaving = priceNum * (discountNum / 100);
        const afterFirst = priceNum - firstSaving;

        // Second discount (stacked on reduced price)
        const secondSaving = additionalNum > 0 ? afterFirst * (additionalNum / 100) : 0;
        const afterSecond = afterFirst - secondSaving;

        const totalSaving = firstSaving + secondSaving;
        const subtotal = afterSecond;

        // Tax
        const taxAmount = taxNum > 0 ? subtotal * (taxNum / 100) : 0;
        const finalPrice = subtotal + taxAmount;

        // Effective discount = total saving as % of original
        const effectiveDiscount = priceNum > 0 ? (totalSaving / priceNum) * 100 : 0;

        return {
            firstSaving,
            afterFirst,
            secondSaving,
            subtotal,
            totalSaving,
            taxAmount,
            finalPrice,
            effectiveDiscount,
            hasAdditional: additionalNum > 0,
            hasTax: taxNum > 0,
        };
    }, [priceNum, discountNum, additionalNum, taxNum]);

    const handleCopy = useCallback((text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    }, []);

    const handleReset = useCallback(() => {
        setPrice('');
        setDiscount('');
        setAdditionalDiscount('');
        setTaxRate('');
        setShowAdvanced(false);
    }, []);

    return (
        <div className="w-full space-y-5">
            {/* Main Calculator */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="grid lg:grid-cols-5 gap-0">
                    {/* Left: Inputs */}
                    <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="space-y-5">
                            {/* Price Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800 block">
                                    Original Price
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={price}
                                    onChange={(e) => setPrice(parseNumericInput(e.target.value))}
                                    placeholder="0"
                                    className="w-full h-14 text-xl font-semibold bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-4 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-gray-900 placeholder:text-gray-300"
                                />
                            </div>

                            {/* Discount Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800 block">
                                    Discount
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value.replace(/[^0-9.]/g, ''))}
                                        placeholder="0"
                                        className="w-full h-12 text-lg font-semibold bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-4 pr-10 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-gray-900 placeholder:text-gray-300"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold pointer-events-none">
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Quick Presets */}
                            <div className="space-y-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                                    Quick select
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_DISCOUNTS.map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDiscount(String(d))}
                                            className={cn(
                                                'px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all',
                                                discount === String(d)
                                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                    : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                            )}
                                        >
                                            {d}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100" />

                            {/* Advanced Toggle */}
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
                            >
                                <svg
                                    className={cn(
                                        'w-3.5 h-3.5 transition-transform',
                                        showAdvanced && 'rotate-90'
                                    )}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                                Additional discount &amp; tax
                            </button>

                            {showAdvanced && (
                                <div className="space-y-4 pt-1">
                                    {/* Additional Discount */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">
                                            Additional Discount
                                        </label>
                                        <p className="text-[11px] text-gray-400 -mt-0.5 mb-1">
                                            Applied after the first discount (stacked)
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={additionalDiscount}
                                                onChange={(e) => setAdditionalDiscount(e.target.value.replace(/[^0-9.]/g, ''))}
                                                placeholder="0"
                                                className="w-full h-11 text-base font-medium bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-4 pr-10 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-gray-900 placeholder:text-gray-300"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                                                %
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tax */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">
                                            Tax Rate
                                        </label>
                                        <p className="text-[11px] text-gray-400 -mt-0.5 mb-1">
                                            Applied on the discounted price
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(e.target.value.replace(/[^0-9.]/g, ''))}
                                                placeholder="0"
                                                className="w-full h-11 text-base font-medium bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-4 pr-10 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-gray-900 placeholder:text-gray-300"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reset Button */}
                            <div className="pt-2">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col" style={{ minHeight: '340px' }}>
                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <RotateCcw className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-0.5">Enter a price</p>
                                <p className="text-xs text-gray-400">Type the original price to see the result</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Price Breakdown
                                </h3>

                                {/* Final Price — Highlight */}
                                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-center">
                                        <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                                            {result.hasTax ? 'Final Price (incl. tax)' : 'Final Price'}
                                        </span>
                                        <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                            {formatCurrency(result.finalPrice)}
                                        </p>
                                        {result.effectiveDiscount > 0 && (
                                            <span className="inline-block mt-3 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                                You save {result.effectiveDiscount % 1 === 0 ? result.effectiveDiscount : result.effectiveDiscount.toFixed(1)}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Copy */}
                                    <div className="flex justify-center mt-4">
                                        <button
                                            onClick={() => handleCopy(formatCurrency(result.finalPrice), 'final')}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all',
                                                copiedField === 'final'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            )}
                                        >
                                            {copiedField === 'final' ? (
                                                <><Check className="w-3.5 h-3.5" /> Copied</>
                                            ) : (
                                                <><Copy className="w-3.5 h-3.5" /> Copy</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Breakdown Rows */}
                                <div className="space-y-2.5">
                                    {/* Original */}
                                    <BreakdownRow
                                        label="Original price"
                                        value={formatCurrency(priceNum)}
                                        onCopy={() => handleCopy(formatCurrency(priceNum), 'original')}
                                        copied={copiedField === 'original'}
                                    />

                                    {/* First Discount */}
                                    <BreakdownRow
                                        label={`Discount (${discountNum}%)`}
                                        value={`− ${formatCurrency(result.firstSaving)}`}
                                        variant="saving"
                                        onCopy={() => handleCopy(formatCurrency(result.firstSaving), 'saving1')}
                                        copied={copiedField === 'saving1'}
                                    />

                                    {/* After First */}
                                    {result.hasAdditional && (
                                        <>
                                            <BreakdownRow
                                                label="After first discount"
                                                value={formatCurrency(result.afterFirst)}
                                                variant="subtotal"
                                            />
                                            <BreakdownRow
                                                label={`Additional discount (${additionalNum}%)`}
                                                value={`− ${formatCurrency(result.secondSaving)}`}
                                                variant="saving"
                                                onCopy={() => handleCopy(formatCurrency(result.secondSaving), 'saving2')}
                                                copied={copiedField === 'saving2'}
                                            />
                                        </>
                                    )}

                                    {/* Tax */}
                                    {result.hasTax && (
                                        <>
                                            <BreakdownRow
                                                label="Subtotal"
                                                value={formatCurrency(result.subtotal)}
                                                variant="subtotal"
                                            />
                                            <BreakdownRow
                                                label={`Tax (${taxNum}%)`}
                                                value={`+ ${formatCurrency(result.taxAmount)}`}
                                                variant="tax"
                                                onCopy={() => handleCopy(formatCurrency(result.taxAmount), 'tax')}
                                                copied={copiedField === 'tax'}
                                            />
                                        </>
                                    )}

                                    {/* Total Savings */}
                                    {result.totalSaving > 0 && (
                                        <div className="pt-2 mt-2 border-t border-gray-100">
                                            <BreakdownRow
                                                label="Total savings"
                                                value={formatCurrency(result.totalSaving)}
                                                variant="total-saving"
                                                onCopy={() => handleCopy(formatCurrency(result.totalSaving), 'total-saving')}
                                                copied={copiedField === 'total-saving'}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Stacked Discount Note */}
                                {result.hasAdditional && result.effectiveDiscount > 0 && (
                                    <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                                        Note: Two stacked discounts of {discountNum}% + {additionalNum}% result in an
                                        effective discount of {result.effectiveDiscount.toFixed(1)}%, not {discountNum + additionalNum}%.
                                        The second discount is applied to the already-reduced price.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Examples */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Common Calculations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { p: '100000', d: '10', label: '10% off 100K' },
                        { p: '500000', d: '25', label: '25% off 500K' },
                        { p: '1500000', d: '30', label: '30% off 1.5M' },
                        { p: '2000000', d: '50', label: '50% off 2M' },
                    ].map((ex) => (
                        <button
                            key={ex.label}
                            onClick={() => {
                                setPrice(ex.p);
                                setDiscount(ex.d);
                            }}
                            className={cn(
                                'p-3 rounded-xl border text-left transition-all',
                                price === ex.p && discount === ex.d
                                    ? 'border-primary-200 bg-primary-50'
                                    : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
                            )}
                        >
                            <p className="text-xs font-medium text-gray-800">{ex.label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                = {formatCurrency(parseInt(ex.p) - parseInt(ex.p) * parseInt(ex.d) / 100)}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Sub-components ─── */

function BreakdownRow({
    label,
    value,
    variant = 'default',
    onCopy,
    copied,
}: {
    label: string;
    value: string;
    variant?: 'default' | 'saving' | 'tax' | 'subtotal' | 'total-saving';
    onCopy?: () => void;
    copied?: boolean;
}) {
    const valueColor = {
        default: 'text-gray-900',
        saving: 'text-emerald-600',
        tax: 'text-amber-600',
        subtotal: 'text-gray-500',
        'total-saving': 'text-emerald-700 font-semibold',
    }[variant];

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 group">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium tabular-nums', valueColor)}>{value}</span>
                {onCopy && (
                    <button
                        onClick={onCopy}
                        className={cn(
                            'p-1 rounded-md transition-all',
                            copied
                                ? 'text-emerald-500 bg-emerald-50'
                                : 'text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100'
                        )}
                        title="Copy"
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                )}
            </div>
        </div>
    );
}
