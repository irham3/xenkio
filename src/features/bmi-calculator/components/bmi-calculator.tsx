'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Activity, TrendingDown, TrendingUp, Minus, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBmiCalculator } from '../hooks/use-bmi-calculator';
import { cn } from '@/lib/utils';
import type { BmiUnit } from '../types';

const GAUGE_SEGMENTS = [
    { label: 'Underweight', color: 'bg-blue-400', widthPct: 46.25 },
    { label: 'Normal', color: 'bg-green-400', widthPct: 16.25 },
    { label: 'Overweight', color: 'bg-amber-400', widthPct: 12.5 },
    { label: 'Obese', color: 'bg-red-500', widthPct: 25 },
];

function BmiGauge({ bmi }: { bmi: number }) {
    const clamped = Math.min(Math.max(bmi, 0), 40);
    const markerPct = (clamped / 40) * 100;

    return (
        <div className="space-y-2">
            <div className="relative h-5 rounded-full overflow-visible">
                <div className="flex h-full rounded-full overflow-hidden">
                    {GAUGE_SEGMENTS.map((seg) => (
                        <div
                            key={seg.label}
                            className={cn('h-full', seg.color)}
                            style={{ width: `${seg.widthPct}%` }}
                        />
                    ))}
                </div>
                {/* Marker */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${markerPct}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-800 shadow-md" />
                </motion.div>
            </div>
            {/* Labels */}
            <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                <span>0</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40+</span>
            </div>
            <div className="flex gap-1 flex-wrap mt-1">
                {[
                    { label: 'Underweight', color: 'bg-blue-400' },
                    { label: 'Normal', color: 'bg-green-400' },
                    { label: 'Overweight', color: 'bg-amber-400' },
                    { label: 'Obese', color: 'bg-red-500' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1">
                        <div className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
                        <span className="text-[10px] text-gray-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

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
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                    {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
                </div>
                <div className={cn('p-2 rounded-lg', bgColor)}>
                    <div className={color}>{icon}</div>
                </div>
            </div>
        </motion.div>
    );
}

function UnitToggle({
    unit,
    onChange,
}: {
    unit: BmiUnit;
    onChange: (u: BmiUnit) => void;
}) {
    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            {(['metric', 'imperial'] as BmiUnit[]).map((u) => (
                <button
                    key={u}
                    onClick={() => onChange(u)}
                    className={cn(
                        'px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize',
                        unit === u
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    {u === 'metric' ? 'Metric (kg / cm)' : 'Imperial (lbs / ft)'}
                </button>
            ))}
        </div>
    );
}

export function BmiCalculator() {
    const {
        unit,
        setUnit,
        heightCm,
        setHeightCm,
        heightFt,
        setHeightFt,
        heightIn,
        setHeightIn,
        weight,
        setWeight,
        result,
        healthyWeightRange,
        isCalculated,
        reset,
    } = useBmiCalculator();

    const weightToGoal = (() => {
        if (!result || !healthyWeightRange) return null;
        if (result.category === 'normal') return null;

        if (result.category === 'underweight') {
            const currentKg = unit === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;
            const diffKg = healthyWeightRange.min - currentKg;
            const amount = unit === 'metric' ? diffKg : diffKg / 0.453592;
            return {
                amount: Math.abs(amount).toFixed(1),
                direction: 'gain' as const,
                unit: unit === 'metric' ? 'kg' : 'lbs',
            };
        }

        const currentKg = unit === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;
        const diffKg = currentKg - healthyWeightRange.max;
        const amount = unit === 'metric' ? diffKg : diffKg / 0.453592;
        return {
            amount: Math.abs(amount).toFixed(1),
            direction: 'lose' as const,
            unit: unit === 'metric' ? 'kg' : 'lbs',
        };
    })();

    return (
        <div className="w-full space-y-6">
            {/* Unit Toggle */}
            <UnitToggle unit={unit} onChange={(u) => { setUnit(u); reset(); }} />

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-5 gap-0">
                    {/* Left Panel: Inputs */}
                    <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="space-y-5">
                            {/* Height */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-800">
                                    Height
                                </Label>
                                {unit === 'metric' ? (
                                    <div className="relative">
                                        <Input
                                            id="height-cm"
                                            type="number"
                                            min={1}
                                            max={300}
                                            placeholder="e.g. 175"
                                            value={heightCm}
                                            onChange={(e) => setHeightCm(e.target.value)}
                                            className="h-14 text-lg font-semibold bg-gray-50 focus:bg-white border-gray-200 pr-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                                            cm
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="height-ft"
                                                type="number"
                                                min={1}
                                                max={9}
                                                placeholder="5"
                                                value={heightFt}
                                                onChange={(e) => setHeightFt(e.target.value)}
                                                className="h-14 text-lg font-semibold bg-gray-50 focus:bg-white border-gray-200 pr-10"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                                                ft
                                            </span>
                                        </div>
                                        <div className="relative flex-1">
                                            <Input
                                                id="height-in"
                                                type="number"
                                                min={0}
                                                max={11}
                                                placeholder="11"
                                                value={heightIn}
                                                onChange={(e) => setHeightIn(e.target.value)}
                                                className="h-14 text-lg font-semibold bg-gray-50 focus:bg-white border-gray-200 pr-10"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                                                in
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-800">
                                    Weight
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="weight"
                                        type="number"
                                        min={1}
                                        max={unit === 'metric' ? 500 : 1100}
                                        placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'}
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="h-14 text-lg font-semibold bg-gray-50 focus:bg-white border-gray-200 pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                                        {unit === 'metric' ? 'kg' : 'lbs'}
                                    </span>
                                </div>
                            </div>

                            {/* Healthy range hint */}
                            {isCalculated && healthyWeightRange && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 border-t border-gray-100"
                                >
                                    <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                                        <p className="text-xs font-semibold text-primary-700 mb-0.5">
                                            Healthy weight for your height
                                        </p>
                                        <p className="text-sm font-bold text-primary-800">
                                            {unit === 'metric'
                                                ? `${healthyWeightRange.min} – ${healthyWeightRange.max} kg`
                                                : `${(healthyWeightRange.min / 0.453592).toFixed(1)} – ${(healthyWeightRange.max / 0.453592).toFixed(1)} lbs`}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {isCalculated && (
                                <div className="pt-2">
                                    <button
                                        onClick={reset}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Result */}
                    <div
                        className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col"
                        style={{ minHeight: '300px' }}
                    >
                        <AnimatePresence mode="wait">
                            {!isCalculated ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center opacity-60"
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Scale className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                        Enter Your Measurements
                                    </h3>
                                    <p className="text-xs text-gray-500" style={{ maxWidth: '220px' }}>
                                        Enter your height and weight to instantly calculate your BMI
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full space-y-4"
                                >
                                    {result && (
                                        <>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                Your BMI Result
                                            </h3>

                                            {/* BMI Score */}
                                            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                                                            Body Mass Index
                                                        </p>
                                                        <p className="text-5xl font-bold text-gray-900 tracking-tight">
                                                            {result.bmi.toFixed(1)}
                                                        </p>
                                                    </div>
                                                    <div className={cn('px-4 py-2 rounded-xl', result.bgColor)}>
                                                        <p className={cn('text-sm font-bold', result.color)}>
                                                            {result.label}
                                                        </p>
                                                        <p className={cn('text-xs', result.color)}>
                                                            BMI {result.range}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Gauge */}
                                                <BmiGauge bmi={result.bmi} />
                                            </div>

                                            {/* Health Risk */}
                                            <div className={cn('p-3 rounded-lg border', result.bgColor, 'border-opacity-50')}>
                                                <div className="flex items-start gap-2">
                                                    <Heart className={cn('w-4 h-4 mt-0.5 shrink-0', result.color)} />
                                                    <p className="text-xs text-gray-700 leading-relaxed">
                                                        {result.healthRisk}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Weight to goal */}
                                            {weightToGoal && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3"
                                                >
                                                    <div className={cn(
                                                        'p-2 rounded-lg',
                                                        weightToGoal.direction === 'lose'
                                                            ? 'bg-amber-50'
                                                            : 'bg-blue-50'
                                                    )}>
                                                        {weightToGoal.direction === 'lose' ? (
                                                            <TrendingDown className="w-4 h-4 text-amber-600" />
                                                        ) : (
                                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            To reach healthy weight
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {weightToGoal.direction === 'lose' ? 'Lose' : 'Gain'}{' '}
                                                            {weightToGoal.amount} {weightToGoal.unit}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {isCalculated && result && (
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        label="BMI Value"
                        value={result.bmi.toFixed(1)}
                        sublabel="kg/m²"
                        icon={<Activity className="w-4 h-4" />}
                        color={result.color}
                        bgColor={result.bgColor}
                    />
                    <StatCard
                        label="Category"
                        value={result.label}
                        sublabel={`BMI ${result.range}`}
                        icon={<Scale className="w-4 h-4" />}
                        color={result.color}
                        bgColor={result.bgColor}
                    />
                    <StatCard
                        label={
                            result.category === 'normal'
                                ? 'Status'
                                : result.category === 'underweight'
                                  ? 'Need to Gain'
                                  : 'To Lose'
                        }
                        value={
                            result.category === 'normal'
                                ? 'Healthy ✓'
                                : weightToGoal
                                  ? `${weightToGoal.amount} ${weightToGoal.unit}`
                                  : '—'
                        }
                        sublabel={
                            result.category === 'normal'
                                ? 'You are in range'
                                : 'to reach healthy BMI'
                        }
                        icon={
                            result.category === 'normal' ? (
                                <Minus className="w-4 h-4" />
                            ) : result.category === 'underweight' ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )
                        }
                        color={
                            result.category === 'normal'
                                ? 'text-primary-600'
                                : result.category === 'underweight'
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                        }
                        bgColor={
                            result.category === 'normal'
                                ? 'bg-primary-50'
                                : result.category === 'underweight'
                                  ? 'bg-blue-50'
                                  : 'bg-amber-50'
                        }
                    />
                </div>
            )}

            {/* BMI Reference Table */}
            {isCalculated && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-soft"
                >
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary-500" />
                        BMI Reference Chart
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-gray-100">
                        {[
                            {
                                label: 'Underweight',
                                range: '< 18.5',
                                color: 'text-blue-600',
                                bg: 'bg-blue-50',
                                active: result?.category === 'underweight',
                            },
                            {
                                label: 'Normal Weight',
                                range: '18.5 – 24.9',
                                color: 'text-green-700',
                                bg: 'bg-green-50',
                                active: result?.category === 'normal',
                            },
                            {
                                label: 'Overweight',
                                range: '25 – 29.9',
                                color: 'text-amber-700',
                                bg: 'bg-amber-50',
                                active: result?.category === 'overweight',
                            },
                            {
                                label: 'Obese',
                                range: '30 – 39.9',
                                color: 'text-red-600',
                                bg: 'bg-red-50',
                                active: result?.category === 'obese',
                            },
                            {
                                label: 'Severely Obese',
                                range: '≥ 40',
                                color: 'text-red-700',
                                bg: 'bg-red-100',
                                active: result?.category === 'severely-obese',
                            },
                        ].map((row) => (
                            <div
                                key={row.label}
                                className={cn(
                                    'flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0 text-sm transition-colors',
                                    row.active ? row.bg : 'hover:bg-gray-50/70'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {row.active && (
                                        <span className={cn('text-xs font-bold', row.color)}>▶</span>
                                    )}
                                    <span
                                        className={cn(
                                            'font-medium',
                                            row.active ? row.color : 'text-gray-700'
                                        )}
                                    >
                                        {row.label}
                                    </span>
                                </div>
                                <span
                                    className={cn(
                                        'font-semibold tabular-nums',
                                        row.active ? row.color : 'text-gray-500'
                                    )}
                                >
                                    {row.range}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
