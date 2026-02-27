'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Cake,
    Clock,
    CalendarDays,
    PartyPopper,
    Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAgeCalculator } from '../hooks/use-age-calculator';
import { formatNumber, formatDate } from '../lib/age-utils';
import { cn } from '@/lib/utils';

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
                <div className={cn('w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center', color)}>
                    {icon}
                </div>
                <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
    );
}

export function AgeCalculator() {
    const {
        birthDateStr,
        setBirthDateStr,
        ageDetails,
        error,
        isCalculated,
        reset,
    } = useAgeCalculator();

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="w-full space-y-6">
            {/* Input Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-5 gap-0">
                    {/* Left Panel: Input */}
                    <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="birth-date"
                                    className="text-sm font-semibold text-gray-800"
                                >
                                    Date of Birth
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="birth-date"
                                        type="date"
                                        value={birthDateStr}
                                        onChange={(e) => setBirthDateStr(e.target.value)}
                                        max={today}
                                        min="1900-01-01"
                                        className="h-14 text-lg font-semibold bg-gray-50 focus:bg-white border-gray-200 cursor-pointer"
                                    />
                                </div>
                                {error && (
                                    <p className="text-xs text-error-500 font-medium mt-1">
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Quick Presets */}
                            <div className="pt-4 border-t border-gray-100">
                                <Label className="text-xs font-medium text-gray-500 mb-2 block">
                                    Quick Test
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: '25 yrs ago', years: 25 },
                                        { label: '30 yrs ago', years: 30 },
                                        { label: '18 yrs ago', years: 18 },
                                        { label: '50 yrs ago', years: 50 },
                                    ].map((preset) => {
                                        const d = new Date();
                                        d.setFullYear(d.getFullYear() - preset.years);
                                        const val = d.toISOString().split('T')[0];
                                        return (
                                            <button
                                                key={preset.label}
                                                onClick={() => setBirthDateStr(val)}
                                                className={cn(
                                                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                                                    birthDateStr === val
                                                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                )}
                                            >
                                                {preset.label}
                                            </button>
                                        );
                                    })}
                                    {isCalculated && (
                                        <button
                                            onClick={reset}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Today's Date Info */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    <span>Today: {formatDate(new Date())}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Main Result */}
                    <div
                        className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col"
                        style={{ minHeight: '300px' }}
                    >
                        <AnimatePresence mode="wait">
                            {!isCalculated ? (
                                <motion.div
                                    key="no-result"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center opacity-60"
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Cake className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                        Enter Your Birth Date
                                    </h3>
                                    <p
                                        className="text-xs text-gray-500"
                                        style={{ maxWidth: '220px' }}
                                    >
                                        Pick your date of birth to see your exact age and fun facts
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
                                    {ageDetails && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                Your Age
                                            </h3>

                                            {/* Main Age Display */}
                                            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-3 mb-3">
                                                        {ageDetails.age.years > 0 && (
                                                            <div className="text-center">
                                                                <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                                                    {ageDetails.age.years}
                                                                </p>
                                                                <p className="text-sm text-gray-500 font-medium">
                                                                    {ageDetails.age.years === 1
                                                                        ? 'Year'
                                                                        : 'Years'}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {ageDetails.age.years > 0 && (
                                                            <span className="text-2xl text-gray-300 font-light self-start mt-2">
                                                                ·
                                                            </span>
                                                        )}
                                                        <div className="text-center">
                                                            <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                                                {ageDetails.age.months}
                                                            </p>
                                                            <p className="text-sm text-gray-500 font-medium">
                                                                {ageDetails.age.months === 1
                                                                    ? 'Month'
                                                                    : 'Months'}
                                                            </p>
                                                        </div>
                                                        <span className="text-2xl text-gray-300 font-light self-start mt-2">
                                                            ·
                                                        </span>
                                                        <div className="text-center">
                                                            <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                                                {ageDetails.age.days}
                                                            </p>
                                                            <p className="text-sm text-gray-500 font-medium">
                                                                {ageDetails.age.days === 1
                                                                    ? 'Day'
                                                                    : 'Days'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Next Birthday */}
                                            {ageDetails.daysUntilBirthday > 0 && (
                                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                                                            <PartyPopper className="w-4 h-4 text-accent-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-gray-500">
                                                                Next birthday in
                                                            </p>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {ageDetails.daysUntilBirthday}{' '}
                                                                {ageDetails.daysUntilBirthday === 1
                                                                    ? 'day'
                                                                    : 'days'}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(ageDetails.nextBirthday)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Stats Grid (only shown when calculated) */}
            {isCalculated && ageDetails && (
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        label="Total Months"
                        value={formatNumber(ageDetails.totalMonths)}
                        sublabel="months lived"
                        icon={<Calendar className="w-4 h-4" />}
                        color="text-primary-600"
                        bgColor="bg-primary-50"
                    />
                    <StatCard
                        label="Total Weeks"
                        value={formatNumber(ageDetails.totalWeeks)}
                        sublabel="weeks lived"
                        icon={<CalendarDays className="w-4 h-4" />}
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                    <StatCard
                        label="Total Days"
                        value={formatNumber(ageDetails.totalDays)}
                        sublabel="days lived"
                        icon={<Clock className="w-4 h-4" />}
                        color="text-amber-600"
                        bgColor="bg-amber-50"
                    />
                </div>
            )}

            {/* Fun Facts Section */}
            {isCalculated && ageDetails && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-soft">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-accent-500" />
                        Birth Details
                    </h3>
                    <div>
                        <DetailRow
                            icon={<Calendar className="w-4 h-4" />}
                            label="Born on"
                            value={ageDetails.dayOfBirth}
                            color="text-primary-500"
                        />
                        <DetailRow
                            icon={<Star className="w-4 h-4" />}
                            label="Leap Year Birth"
                            value={ageDetails.leapYearBorn ? 'Yes' : 'No'}
                            color="text-amber-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
