'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRightLeft,
    Copy,
    Check,
    History,
    Trash2,
    ChevronDown,
    Ruler,
    Weight,
    Thermometer,
    Droplet,
    Square,
    Gauge,
    ArrowDown,
    Zap,
    Battery,
    HardDrive,
    Clock,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnitConverter } from '../hooks/use-unit-converter';
import { UNIT_CATEGORIES, CATEGORY_ICONS } from '../constants';
import { cn } from '@/lib/utils';
import type { UnitCategory, ConversionHistoryItem } from '../types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Ruler,
    Weight,
    Thermometer,
    Droplet,
    Square,
    Gauge,
    ArrowDown,
    Zap,
    Battery,
    HardDrive,
    Clock,
};

interface CopyButtonProps {
    text: string;
    field: string;
    copiedField: string | null;
    onCopy: (text: string, field: string) => void;
}

function CopyButton({ text, field, copiedField, onCopy }: CopyButtonProps) {
    return (
        <button
            onClick={() => onCopy(text, field)}
            className={cn(
                'p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100',
                copiedField === field
                    ? 'text-success-600 bg-success-50'
                    : 'text-gray-400 hover:text-gray-600'
            )}
            title="Copy"
        >
            {copiedField === field ? (
                <Check className="w-3.5 h-3.5" />
            ) : (
                <Copy className="w-3.5 h-3.5" />
            )}
        </button>
    );
}

export function UnitConverter() {
    const {
        category,
        fromUnit,
        toUnit,
        inputValue,
        result,
        history,
        copiedField,
        availableUnits,
        setCategory,
        setFromUnit,
        setToUnit,
        setInputValue,
        swapUnits,
        onCopy,
        onHistoryItemClick,
        clearHistory,
        getUnitSymbol,
    } = useUnitConverter();

    const [showHistory, setShowHistory] = useState(false);

    const getCategoryIcon = (catId: string) => {
        const iconName = CATEGORY_ICONS[catId]?.icon || 'Ruler';
        const Icon = ICON_MAP[iconName] || Ruler;
        return Icon;
    };

    return (
        <div className="w-full space-y-6">
            {/* Category Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-soft">
                <Label className="text-sm font-semibold text-gray-800 mb-3 block">
                    Select Category
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {UNIT_CATEGORIES.map((cat) => {
                        const Icon = getCategoryIcon(cat.id);
                        const isActive = category === cat.id;
                        const colors = CATEGORY_ICONS[cat.id];

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id as UnitCategory)}
                                className={cn(
                                    'flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 border',
                                    isActive
                                        ? cn(
                                              'border-primary-200 bg-primary-50',
                                              colors?.color || 'text-primary-600'
                                          )
                                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-5 h-5',
                                        isActive
                                            ? colors?.color || 'text-primary-600'
                                            : 'text-gray-500'
                                    )}
                                />
                                <span className="text-[10px] font-medium text-center leading-tight">
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Converter */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-5 gap-0">
                    {/* Left Panel: Inputs */}
                    <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                {/* From Unit */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-800">
                                        From
                                    </Label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={inputValue}
                                                onChange={(e) =>
                                                    setInputValue(e.target.value)
                                                }
                                                placeholder="Enter value"
                                                className="h-14 text-xl font-semibold bg-gray-50 focus:bg-white border-gray-200 pr-20"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                                                {getUnitSymbol(fromUnit)}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={fromUnit}
                                                onChange={(e) =>
                                                    setFromUnit(e.target.value)
                                                }
                                                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 pr-10 outline-none transition-all hover:border-gray-300 cursor-pointer"
                                            >
                                                {availableUnits.map((unit) => (
                                                    <option
                                                        key={unit.id}
                                                        value={unit.id}
                                                    >
                                                        {unit.name} ({unit.symbol})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Swap Button */}
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={swapUnits}
                                        className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                    >
                                        <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </div>

                                {/* To Unit */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-800">
                                        To
                                    </Label>
                                    <div className="relative">
                                        <select
                                            value={toUnit}
                                            onChange={(e) =>
                                                setToUnit(e.target.value)
                                            }
                                            className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 pr-10 outline-none transition-all hover:border-gray-300 cursor-pointer"
                                        >
                                            {availableUnits.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.name} ({unit.symbol})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Quick Presets */}
                                <div className="pt-4 border-t border-gray-100">
                                    <Label className="text-xs font-medium text-gray-500 mb-2 block">
                                        Quick Values
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['1', '10', '100', '1000'].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => setInputValue(val)}
                                                className={cn(
                                                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                                                    inputValue === val
                                                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                )}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setInputValue('')}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Panel: Result */}
                    <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col" style={{ minHeight: '300px' }}>
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="no-result"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center opacity-60"
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <RotateCcw className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                        Enter a Value
                                    </h3>
                                    <p className="text-xs text-gray-500" style={{ maxWidth: '200px' }}>
                                        Type a number to see the conversion result
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            Conversion Result
                                        </h3>

                                        {/* Main Result Display */}
                                        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                            <div className="text-center">
                                                <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
                                                    {result.formatted}
                                                </p>
                                                <p className="text-lg text-gray-500 font-medium">
                                                    {getUnitSymbol(toUnit)}
                                                </p>
                                                {result.scientific && (
                                                    <p className="text-sm text-gray-400 mt-2 font-mono">
                                                        {result.scientific}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Copy Button */}
                                            <div className="flex justify-center mt-4">
                                                <Button
                                                    onClick={() =>
                                                        onCopy(
                                                            result.formatted,
                                                            'result'
                                                        )
                                                    }
                                                    className={cn(
                                                        'gap-2',
                                                        copiedField === 'result' &&
                                                            'bg-success-600 hover:bg-success-700'
                                                    )}
                                                    variant="outline"
                                                >
                                                    {copiedField === 'result' ? (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4" />
                                                            Copy Result
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Conversion Details */}
                                        <div className="grid gap-3">
                                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                                                        Original
                                                    </span>
                                                    <CopyButton
                                                        text={inputValue}
                                                        field="input"
                                                        copiedField={copiedField}
                                                        onCopy={onCopy}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-900">
                                                    {inputValue}{' '}
                                                    {getUnitSymbol(fromUnit)}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                                                        Converted
                                                    </span>
                                                    <CopyButton
                                                        text={result.formatted}
                                                        field="converted"
                                                        copiedField={copiedField}
                                                        onCopy={onCopy}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-900">
                                                    {result.formatted}{' '}
                                                    {getUnitSymbol(toUnit)}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                                                        Full Precision
                                                    </span>
                                                    <CopyButton
                                                        text={result.value.toString()}
                                                        field="precision"
                                                        copiedField={copiedField}
                                                        onCopy={onCopy}
                                                    />
                                                </div>
                                                <p className="text-sm font-mono text-gray-900 break-all">
                                                    {result.value.toPrecision(12)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-soft">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-800">
                                Recent Conversions
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {history.length}
                            </span>
                        </div>
                        <ChevronDown
                            className={cn(
                                'w-4 h-4 text-gray-500 transition-transform',
                                showHistory && 'rotate-180'
                            )}
                        />
                    </button>

                    <AnimatePresence>
                        {showHistory && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                                    {history.map((item: ConversionHistoryItem) => (
                                        <button
                                            key={item.id}
                                            onClick={() => onHistoryItemClick(item)}
                                            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200">
                                                    {item.category
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.fromValue}{' '}
                                                        {getUnitSymbol(item.fromUnit)}{' '}
                                                        →{' '}
                                                        {formatResult(item.toValue).formatted}{' '}
                                                        {getUnitSymbol(item.toUnit)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(
                                                            item.timestamp
                                                        ).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                        </button>
                                    ))}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearHistory}
                                        className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear History
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

// Helper function for history display
function formatResult(value: number): { formatted: string } {
    if (Math.abs(value) >= 1e9) {
        return { formatted: value.toExponential(4) };
    }
    if (Number.isInteger(value)) {
        return { formatted: value.toString() };
    }
    return { formatted: value.toLocaleString('en-US', { maximumFractionDigits: 6 }) };
}
