'use client';

import { cn } from '@/lib/utils';
import { CollisionResult, RiskLevel } from '../types';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Zap } from 'lucide-react';

interface CollisionResultCardProps {
    result: CollisionResult;
}

const RISK_CONFIG: Record<RiskLevel, {
    label: string;
    color: string;
    bg: string;
    border: string;
    barColor: string;
    Icon: React.ComponentType<{ className?: string; size?: number }>;
}> = {
    negligible: {
        label: 'Negligible',
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        barColor: 'bg-green-500',
        Icon: CheckCircle2,
    },
    low: {
        label: 'Low',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        barColor: 'bg-blue-500',
        Icon: Info,
    },
    moderate: {
        label: 'Moderate',
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        barColor: 'bg-yellow-500',
        Icon: AlertTriangle,
    },
    high: {
        label: 'High',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        barColor: 'bg-orange-500',
        Icon: ShieldAlert,
    },
    critical: {
        label: 'Critical',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        barColor: 'bg-red-500',
        Icon: Zap,
    },
};

function riskBarWidth(p: number): number {
    // Logarithmic scale: 0 → 0%, 1e-15 → 5%, 1 → 100%
    if (p <= 0) return 0;
    if (p >= 1) return 100;
    // map log10(p) from [-15, 0] → [5, 100]
    const log = Math.log10(p);
    const clamped = Math.max(-15, Math.min(0, log));
    return 5 + ((clamped + 15) / 15) * 95;
}

export function CollisionResultCard({ result }: CollisionResultCardProps) {
    const risk = RISK_CONFIG[result.riskLevel];
    const { Icon } = risk;
    const barWidth = riskBarWidth(result.probability);

    return (
        <div className="space-y-6">
            {/* Main probability display */}
            <div className={cn('rounded-2xl border-2 p-6', risk.border, risk.bg)}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
                            Collision Probability
                        </p>
                        <p className={cn('text-3xl font-black tracking-tight', risk.color)}>
                            {result.probabilityPct}
                        </p>
                    </div>
                    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest', risk.bg, risk.color, 'border', risk.border)}>
                        <Icon size={13} />
                        {risk.label} Risk
                    </div>
                </div>

                {/* Risk bar */}
                <div className="mt-2 space-y-1.5">
                    <div className="h-2.5 w-full bg-white/60 rounded-full overflow-hidden border border-white/80">
                        <div
                            className={cn('h-full rounded-full transition-all duration-700', risk.barColor)}
                            style={{ width: `${barWidth}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span>Negligible</span>
                        <span>Critical</span>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                    label="1-in-a-million Risk"
                    sublabel="0.0001% chance"
                    value={result.safeCount0001pct}
                    accent="green"
                />
                <StatCard
                    label="1% Collision Risk"
                    sublabel="Caution zone"
                    value={result.safeCount1pct}
                    accent="yellow"
                />
                <StatCard
                    label="50% Collision Risk"
                    sublabel="Birthday paradox"
                    value={result.safeCount50}
                    accent="red"
                />
            </div>

            {/* Details row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        Bits of Entropy
                    </p>
                    <p className="text-xl font-black text-gray-800">{result.bitsOfEntropy}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        Total Space
                    </p>
                    <p className="text-sm font-black text-gray-800 font-mono">{result.spaceSize}</p>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    sublabel: string;
    value: string;
    accent: 'green' | 'yellow' | 'red';
}

const ACCENT = {
    green: { dot: 'bg-green-500', text: 'text-green-700' },
    yellow: { dot: 'bg-yellow-500', text: 'text-yellow-700' },
    red: { dot: 'bg-red-500', text: 'text-red-700' },
};

function StatCard({ label, sublabel, value, accent }: StatCardProps) {
    const a = ACCENT[accent];
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full shrink-0', a.dot)} />
                <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{label}</span>
            </div>
            <p className={cn('text-base font-black font-mono leading-tight', a.text)}>{value}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">{sublabel}</p>
        </div>
    );
}
