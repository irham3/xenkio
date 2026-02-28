'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    CalendarDays,
    Clock,
    ArrowRight,
    Plus,
    Minus,
    ArrowLeftRight,
    Briefcase,
    Sun,
    Hash,
    ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDateCalculator } from '../hooks/use-date-calculator';
import { formatNumber } from '../lib/date-utils';
import { cn } from '@/lib/utils';
import type { DateUnit, DateOperation } from '../types';

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

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: string;
}

function DetailRow({ icon, label, value, color = 'text-gray-500' }: DetailRowProps) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center',
                        color
                    )}
                >
                    {icon}
                </div>
                <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Mode tabs                                                         */
/* ------------------------------------------------------------------ */

const MODE_OPTIONS = [
    { key: 'difference' as const, label: 'Date Difference', icon: ArrowLeftRight },
    { key: 'add-subtract' as const, label: 'Add / Subtract', icon: Plus },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function DateCalculator() {
    const {
        mode,
        setMode,
        startDateStr,
        setStartDateStr,
        endDateStr,
        setEndDateStr,
        dateDifference,
        differenceError,
        isDifferenceCalculated,
        baseDateStr,
        setBaseDateStr,
        amount,
        setAmount,
        unit,
        setUnit,
        operation,
        setOperation,
        addSubtractResult,
        addSubtractError,
        isAddSubtractCalculated,
        resetAll,
        setToday,
    } = useDateCalculator();

    return (
        <div className="w-full space-y-6">
            {/* Mode Tabs */}
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                {MODE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = mode === opt.key;
                    return (
                        <button
                            key={opt.key}
                            onClick={() => setMode(opt.key)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
                                active
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            {/* -------------------------------------------------------- */}
            {/*  DIFFERENCE MODE                                         */}
            {/* -------------------------------------------------------- */}
            {mode === 'difference' && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                    <div className="grid lg:grid-cols-5 gap-0">
                        {/* Left: Inputs */}
                        <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <div className="space-y-5">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="start-date"
                                            className="text-sm font-semibold text-gray-800"
                                        >
                                            Start Date
                                        </Label>
                                        <button
                                            onClick={() => setToday('start')}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Today
                                        </button>
                                    </div>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDateStr}
                                        onChange={(e) => setStartDateStr(e.target.value)}
                                        className="h-12 text-base font-semibold bg-gray-50 focus:bg-white border-gray-200 cursor-pointer"
                                    />
                                </div>

                                {/* Arrow Separator */}
                                <div className="flex items-center justify-center py-1">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="end-date"
                                            className="text-sm font-semibold text-gray-800"
                                        >
                                            End Date
                                        </Label>
                                        <button
                                            onClick={() => setToday('end')}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Today
                                        </button>
                                    </div>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={endDateStr}
                                        onChange={(e) => setEndDateStr(e.target.value)}
                                        className="h-12 text-base font-semibold bg-gray-50 focus:bg-white border-gray-200 cursor-pointer"
                                    />
                                </div>

                                {differenceError && (
                                    <p className="text-xs text-error-500 font-medium">
                                        {differenceError}
                                    </p>
                                )}

                                {/* Quick Presets */}
                                <div className="pt-4 border-t border-gray-100">
                                    <Label className="text-xs font-medium text-gray-500 mb-2 block">
                                        Quick Presets
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'This year', start: `${new Date().getFullYear()}-01-01`, end: new Date().toISOString().split('T')[0] },
                                            { label: 'Last 90 days', start: (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split('T')[0]; })(), end: new Date().toISOString().split('T')[0] },
                                            { label: 'Last 30 days', start: (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })(), end: new Date().toISOString().split('T')[0] },
                                        ].map((preset) => (
                                            <button
                                                key={preset.label}
                                                onClick={() => {
                                                    setStartDateStr(preset.start);
                                                    setEndDateStr(preset.end);
                                                }}
                                                className={cn(
                                                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                                                    startDateStr === preset.start &&
                                                        endDateStr === preset.end
                                                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                )}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                        {isDifferenceCalculated && (
                                            <button
                                                onClick={resetAll}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Result */}
                        <div
                            className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col"
                            style={{ minHeight: '320px' }}
                        >
                            <AnimatePresence mode="wait">
                                {!isDifferenceCalculated ? (
                                    <motion.div
                                        key="no-result"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full text-center opacity-60"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <CalendarDays className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                            Pick Two Dates
                                        </h3>
                                        <p
                                            className="text-xs text-gray-500"
                                            style={{ maxWidth: '220px' }}
                                        >
                                            Select a start and end date to see the exact difference
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
                                        {dateDifference && (
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-gray-800">
                                                    Date Difference
                                                </h3>

                                                {/* Primary result */}
                                                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center gap-3 mb-3">
                                                            {dateDifference.years > 0 && (
                                                                <>
                                                                    <div className="text-center">
                                                                        <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                                                            {dateDifference.years}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 font-medium">
                                                                            {dateDifference.years ===
                                                                            1
                                                                                ? 'Year'
                                                                                : 'Years'}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-2xl text-gray-300 font-light self-start mt-2">
                                                                        ·
                                                                    </span>
                                                                </>
                                                            )}
                                                            {(dateDifference.years > 0 ||
                                                                dateDifference.months > 0) && (
                                                                <>
                                                                    <div className="text-center">
                                                                        <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                                                            {dateDifference.months}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 font-medium">
                                                                            {dateDifference.months ===
                                                                            1
                                                                                ? 'Month'
                                                                                : 'Months'}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-2xl text-gray-300 font-light self-start mt-2">
                                                                        ·
                                                                    </span>
                                                                </>
                                                            )}
                                                            <div className="text-center">
                                                                <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                                                    {dateDifference.days}
                                                                </p>
                                                                <p className="text-sm text-gray-500 font-medium">
                                                                    {dateDifference.days === 1
                                                                        ? 'Day'
                                                                        : 'Days'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total days summary */}
                                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                                            <Calendar className="w-4 h-4 text-primary-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-gray-500">
                                                                Total
                                                            </p>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatNumber(
                                                                    dateDifference.totalDays
                                                                )}{' '}
                                                                days
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {formatNumber(
                                                                dateDifference.totalWeeks
                                                            )}{' '}
                                                            weeks
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------------------------------------------- */}
            {/*  ADD / SUBTRACT MODE                                     */}
            {/* -------------------------------------------------------- */}
            {mode === 'add-subtract' && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                    <div className="grid lg:grid-cols-5 gap-0">
                        {/* Left: Inputs */}
                        <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <div className="space-y-5">
                                {/* Base Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="base-date"
                                            className="text-sm font-semibold text-gray-800"
                                        >
                                            Start Date
                                        </Label>
                                        <button
                                            onClick={() => setToday('base')}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Today
                                        </button>
                                    </div>
                                    <Input
                                        id="base-date"
                                        type="date"
                                        value={baseDateStr}
                                        onChange={(e) => setBaseDateStr(e.target.value)}
                                        className="h-12 text-base font-semibold bg-gray-50 focus:bg-white border-gray-200 cursor-pointer"
                                    />
                                </div>

                                {/* Operation Toggle */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-800">
                                        Operation
                                    </Label>
                                    <div className="flex gap-2">
                                        {(
                                            [
                                                { key: 'add', label: 'Add', icon: Plus },
                                                { key: 'subtract', label: 'Subtract', icon: Minus },
                                            ] as const
                                        ).map((op) => {
                                            const Icon = op.icon;
                                            return (
                                                <button
                                                    key={op.key}
                                                    onClick={() =>
                                                        setOperation(op.key as DateOperation)
                                                    }
                                                    className={cn(
                                                        'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all',
                                                        operation === op.key
                                                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {op.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="amount"
                                        className="text-sm font-semibold text-gray-800"
                                    >
                                        Amount
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={0}
                                        max={99999}
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(
                                                Math.max(
                                                    0,
                                                    parseInt(e.target.value, 10) || 0
                                                )
                                            )
                                        }
                                        className="h-12 text-base font-semibold bg-gray-50 focus:bg-white border-gray-200"
                                    />
                                </div>

                                {/* Unit Select */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="unit"
                                        className="text-sm font-semibold text-gray-800"
                                    >
                                        Unit
                                    </Label>
                                    <div className="relative">
                                        <select
                                            id="unit"
                                            value={unit}
                                            onChange={(e) =>
                                                setUnit(e.target.value as DateUnit)
                                            }
                                            className="w-full h-12 text-base font-semibold bg-gray-50 border border-gray-200 rounded-lg px-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white cursor-pointer"
                                        >
                                            <option value="days">Days</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {addSubtractError && (
                                    <p className="text-xs text-error-500 font-medium">
                                        {addSubtractError}
                                    </p>
                                )}

                                {/* Quick amounts */}
                                <div className="pt-4 border-t border-gray-100">
                                    <Label className="text-xs font-medium text-gray-500 mb-2 block">
                                        Quick Amounts
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[7, 14, 30, 60, 90, 365].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    setAmount(val);
                                                    setUnit('days');
                                                }}
                                                className={cn(
                                                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                                                    amount === val && unit === 'days'
                                                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                )}
                                            >
                                                {val}d
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Result */}
                        <div
                            className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col"
                            style={{ minHeight: '320px' }}
                        >
                            <AnimatePresence mode="wait">
                                {!isAddSubtractCalculated ? (
                                    <motion.div
                                        key="no-result"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full text-center opacity-60"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                            Configure Calculation
                                        </h3>
                                        <p
                                            className="text-xs text-gray-500"
                                            style={{ maxWidth: '220px' }}
                                        >
                                            Select a date and amount to add or subtract
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
                                        {addSubtractResult && (
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-gray-800">
                                                    Result
                                                </h3>

                                                {/* Result Date */}
                                                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                    <div className="text-center space-y-2">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                                            {operation === 'add'
                                                                ? `${amount} ${unit} after`
                                                                : `${amount} ${unit} before`}
                                                        </p>
                                                        <p className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                                            {addSubtractResult.formattedDate}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {addSubtractResult.dayOfWeek}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Additional info */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Week Number
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {addSubtractResult.weekNumber}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Day of Year
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {addSubtractResult.dayOfYear}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Leap Year
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {addSubtractResult.isLeapYear
                                                                ? 'Yes'
                                                                : 'No'}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Days in Month
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {addSubtractResult.daysInMonth}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------------------------------------------- */}
            {/*  STATS GRID (Difference mode)                            */}
            {/* -------------------------------------------------------- */}
            {mode === 'difference' && isDifferenceCalculated && dateDifference && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatCard
                            label="Total Weeks"
                            value={formatNumber(dateDifference.totalWeeks)}
                            sublabel="weeks"
                            icon={<CalendarDays className="w-4 h-4" />}
                            color="text-primary-600"
                            bgColor="bg-primary-50"
                        />
                        <StatCard
                            label="Total Hours"
                            value={formatNumber(dateDifference.totalHours)}
                            sublabel="hours"
                            icon={<Clock className="w-4 h-4" />}
                            color="text-emerald-600"
                            bgColor="bg-emerald-50"
                        />
                        <StatCard
                            label="Total Minutes"
                            value={formatNumber(dateDifference.totalMinutes)}
                            sublabel="minutes"
                            icon={<Clock className="w-4 h-4" />}
                            color="text-amber-600"
                            bgColor="bg-amber-50"
                        />
                        <StatCard
                            label="Weekdays"
                            value={formatNumber(dateDifference.weekdaysOnly)}
                            sublabel="Mon – Fri"
                            icon={<Briefcase className="w-4 h-4" />}
                            color="text-blue-600"
                            bgColor="bg-blue-50"
                        />
                        <StatCard
                            label="Weekends"
                            value={formatNumber(dateDifference.weekendsOnly)}
                            sublabel="Sat & Sun"
                            icon={<Sun className="w-4 h-4" />}
                            color="text-orange-600"
                            bgColor="bg-orange-50"
                        />
                        <StatCard
                            label="Total Months"
                            value={formatNumber(dateDifference.totalMonths)}
                            sublabel="months"
                            icon={<Calendar className="w-4 h-4" />}
                            color="text-violet-600"
                            bgColor="bg-violet-50"
                        />
                    </div>

                    {/* Detailed breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-soft">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-accent-500" />
                            Detailed Breakdown
                        </h3>
                        <div>
                            <DetailRow
                                icon={<Calendar className="w-4 h-4" />}
                                label="Total days"
                                value={formatNumber(dateDifference.totalDays)}
                                color="text-primary-500"
                            />
                            <DetailRow
                                icon={<CalendarDays className="w-4 h-4" />}
                                label="Total weeks"
                                value={`${formatNumber(dateDifference.totalWeeks)} weeks, ${dateDifference.totalDays % 7} days`}
                                color="text-emerald-500"
                            />
                            <DetailRow
                                icon={<Clock className="w-4 h-4" />}
                                label="Total seconds"
                                value={formatNumber(dateDifference.totalSeconds)}
                                color="text-amber-500"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
