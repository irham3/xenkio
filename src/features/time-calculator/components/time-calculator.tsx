'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowsLeftRight, Plus, Minus, Timer, Hash, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimeCalculator } from '../hooks/use-time-calculator';
import { formatNumber } from '../lib/time-utils';
import { cn } from '@/lib/utils';
import type { TimeUnit, TimeOperation } from '../types';

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                           */
/* ------------------------------------------------------------------ */

interface StatCardProps {
    label: string;
    value: string;
    sublabel?: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

function StatCard({ label, value, sublabel, icon, color, bgColor }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4',
                'transition-shadow duration-200 hover:shadow-soft'
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">
                        {value}
                    </p>
                    {sublabel && (
                        <p className="text-xs text-gray-500">{sublabel}</p>
                    )}
                </div>
                <div className={cn('p-2 rounded-lg', bgColor)}>
                    <div className={color}>{icon}</div>
                </div>
            </div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Mode tabs                                                         */
/* ------------------------------------------------------------------ */

const MODE_OPTIONS = [
    { key: 'difference' as const, label: 'Time Difference', icon: ArrowsLeftRight },
    { key: 'add-subtract' as const, label: 'Add / Subtract', icon: Plus },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function TimeCalculator() {
    const {
        mode, setMode,
        startTimeStr, setStartTimeStr,
        endTimeStr, setEndTimeStr,
        timeDifference, differenceError, isDifferenceCalculated,
        baseTimeStr, setBaseTimeStr,
        amount, setAmount,
        unit, setUnit,
        operation, setOperation,
        addSubtractResult, addSubtractError, isAddSubtractCalculated,
        resetAll, setNow,
    } = useTimeCalculator();

    return (
        <div className="space-y-8">
            {/* Mode Tabs */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                    {MODE_OPTIONS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setMode(key)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200',
                                mode === key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Icon size={16} weight="duotone" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {mode === 'difference' ? (
                    <motion.div
                        key="difference"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <DifferencePanel
                            startTimeStr={startTimeStr}
                            setStartTimeStr={setStartTimeStr}
                            endTimeStr={endTimeStr}
                            setEndTimeStr={setEndTimeStr}
                            timeDifference={timeDifference}
                            differenceError={differenceError}
                            isDifferenceCalculated={isDifferenceCalculated}
                            setNow={setNow}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="add-subtract"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <AddSubtractPanel
                            baseTimeStr={baseTimeStr}
                            setBaseTimeStr={setBaseTimeStr}
                            amount={amount}
                            setAmount={setAmount}
                            unit={unit}
                            setUnit={setUnit}
                            operation={operation}
                            setOperation={setOperation}
                            addSubtractResult={addSubtractResult}
                            addSubtractError={addSubtractError}
                            isAddSubtractCalculated={isAddSubtractCalculated}
                            setNow={setNow}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset */}
            <div className="flex justify-center">
                <button
                    onClick={resetAll}
                    className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors"
                >
                    Reset all fields
                </button>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Difference Panel                                                  */
/* ------------------------------------------------------------------ */

interface DifferencePanelProps {
    startTimeStr: string;
    setStartTimeStr: (v: string) => void;
    endTimeStr: string;
    setEndTimeStr: (v: string) => void;
    timeDifference: ReturnType<typeof useTimeCalculator>['timeDifference'];
    differenceError: string | null;
    isDifferenceCalculated: boolean;
    setNow: (target: 'start' | 'end' | 'base') => void;
}

function DifferencePanel({
    startTimeStr, setStartTimeStr,
    endTimeStr, setEndTimeStr,
    timeDifference, differenceError, isDifferenceCalculated,
    setNow,
}: DifferencePanelProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-50">
                        <ArrowsLeftRight size={20} className="text-blue-600" weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Time Difference</h2>
                        <p className="text-sm text-gray-500">Find the duration between two times</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="start-time" className="text-sm font-medium text-gray-700">Start Time</Label>
                            <button
                                onClick={() => setNow('start')}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Use now
                            </button>
                        </div>
                        <Input
                            id="start-time"
                            type="text"
                            placeholder="HH:MM:SS"
                            value={startTimeStr}
                            onChange={(e) => setStartTimeStr(e.target.value)}
                            className="text-lg font-mono h-12"
                        />
                    </div>

                    <div className="flex items-center justify-center pb-1">
                        <ArrowRight size={20} className="text-gray-300" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="end-time" className="text-sm font-medium text-gray-700">End Time</Label>
                            <button
                                onClick={() => setNow('end')}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Use now
                            </button>
                        </div>
                        <Input
                            id="end-time"
                            type="text"
                            placeholder="HH:MM:SS"
                            value={endTimeStr}
                            onChange={(e) => setEndTimeStr(e.target.value)}
                            className="text-lg font-mono h-12"
                        />
                    </div>
                </div>

                {differenceError && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                    >
                        {differenceError}
                    </motion.div>
                )}
            </div>

            {/* Results */}
            <AnimatePresence>
                {isDifferenceCalculated && timeDifference && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-4"
                    >
                        {/* Main result */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-center">
                            <p className="text-sm text-gray-500 mb-2">Time Difference</p>
                            <p className="text-4xl md:text-5xl font-bold text-gray-900 font-mono tracking-tight">
                                {timeDifference.formatted}
                            </p>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <StatCard
                                label="Hours"
                                value={formatNumber(timeDifference.hours)}
                                sublabel="hours"
                                icon={<Clock size={20} weight="duotone" />}
                                color="text-blue-600"
                                bgColor="bg-blue-50"
                            />
                            <StatCard
                                label="Minutes"
                                value={formatNumber(timeDifference.minutes)}
                                sublabel="minutes"
                                icon={<Timer size={20} weight="duotone" />}
                                color="text-emerald-600"
                                bgColor="bg-emerald-50"
                            />
                            <StatCard
                                label="Seconds"
                                value={formatNumber(timeDifference.seconds)}
                                sublabel="seconds"
                                icon={<Hash size={20} weight="duotone" />}
                                color="text-violet-600"
                                bgColor="bg-violet-50"
                            />
                            <StatCard
                                label="Total Minutes"
                                value={formatNumber(timeDifference.totalMinutes)}
                                sublabel="minutes"
                                icon={<Timer size={20} weight="duotone" />}
                                color="text-amber-600"
                                bgColor="bg-amber-50"
                            />
                            <StatCard
                                label="Total Hours"
                                value={String(timeDifference.totalHours)}
                                sublabel="hours"
                                icon={<Clock size={20} weight="duotone" />}
                                color="text-rose-600"
                                bgColor="bg-rose-50"
                            />
                            <StatCard
                                label="Total Seconds"
                                value={formatNumber(timeDifference.totalSeconds)}
                                sublabel="seconds"
                                icon={<Hash size={20} weight="duotone" />}
                                color="text-cyan-600"
                                bgColor="bg-cyan-50"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Add / Subtract Panel                                              */
/* ------------------------------------------------------------------ */

interface AddSubtractPanelProps {
    baseTimeStr: string;
    setBaseTimeStr: (v: string) => void;
    amount: number;
    setAmount: (v: number) => void;
    unit: TimeUnit;
    setUnit: (v: TimeUnit) => void;
    operation: TimeOperation;
    setOperation: (v: TimeOperation) => void;
    addSubtractResult: ReturnType<typeof useTimeCalculator>['addSubtractResult'];
    addSubtractError: string | null;
    isAddSubtractCalculated: boolean;
    setNow: (target: 'start' | 'end' | 'base') => void;
}

const UNIT_OPTIONS: { key: TimeUnit; label: string }[] = [
    { key: 'hours', label: 'Hours' },
    { key: 'minutes', label: 'Minutes' },
    { key: 'seconds', label: 'Seconds' },
];

function AddSubtractPanel({
    baseTimeStr, setBaseTimeStr,
    amount, setAmount,
    unit, setUnit,
    operation, setOperation,
    addSubtractResult, addSubtractError, isAddSubtractCalculated,
    setNow,
}: AddSubtractPanelProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-violet-50">
                        <Plus size={20} className="text-violet-600" weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Add / Subtract Time</h2>
                        <p className="text-sm text-gray-500">Add or subtract a duration from a time</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Base time */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="base-time" className="text-sm font-medium text-gray-700">Base Time</Label>
                            <button
                                onClick={() => setNow('base')}
                                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                            >
                                Use now
                            </button>
                        </div>
                        <Input
                            id="base-time"
                            type="text"
                            placeholder="HH:MM:SS"
                            value={baseTimeStr}
                            onChange={(e) => setBaseTimeStr(e.target.value)}
                            className="text-lg font-mono h-12"
                        />
                    </div>

                    {/* Operation toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setOperation('add')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                                operation === 'add'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            )}
                        >
                            <Plus size={16} />
                            Add
                        </button>
                        <button
                            onClick={() => setOperation('subtract')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                                operation === 'subtract'
                                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            )}
                        >
                            <Minus size={16} />
                            Subtract
                        </button>
                    </div>

                    {/* Amount and unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                min={0}
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="text-lg font-mono h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Unit</Label>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden h-12">
                                {UNIT_OPTIONS.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setUnit(key)}
                                        className={cn(
                                            'flex-1 text-sm font-medium transition-all',
                                            unit === key
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {addSubtractError && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                    >
                        {addSubtractError}
                    </motion.div>
                )}
            </div>

            {/* Result */}
            <AnimatePresence>
                {isAddSubtractCalculated && addSubtractResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-4"
                    >
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-center">
                            <p className="text-sm text-gray-500 mb-2">Result</p>
                            <p className="text-4xl md:text-5xl font-bold text-gray-900 font-mono tracking-tight">
                                {addSubtractResult.formatted}
                            </p>
                            {addSubtractResult.wrappedDays > 0 && (
                                <p className="text-sm text-amber-600 mt-2 font-medium">
                                    + {addSubtractResult.wrappedDays} day{addSubtractResult.wrappedDays > 1 ? 's' : ''} wrapped
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <StatCard
                                label="Hours"
                                value={String(addSubtractResult.result.hours)}
                                icon={<Clock size={20} weight="duotone" />}
                                color="text-blue-600"
                                bgColor="bg-blue-50"
                            />
                            <StatCard
                                label="Minutes"
                                value={String(addSubtractResult.result.minutes)}
                                icon={<Timer size={20} weight="duotone" />}
                                color="text-emerald-600"
                                bgColor="bg-emerald-50"
                            />
                            <StatCard
                                label="Seconds"
                                value={String(addSubtractResult.result.seconds)}
                                icon={<Hash size={20} weight="duotone" />}
                                color="text-violet-600"
                                bgColor="bg-violet-50"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
