'use client';

import { cn } from '@/lib/utils';
import type { DataCheckerStats } from '../types';
import { CheckCircle2, XCircle, CircleDashed } from 'lucide-react';

interface ProgressOverviewProps {
    stats: DataCheckerStats;
}

export function ProgressOverview({ stats }: ProgressOverviewProps) {
    if (stats.total === 0) return null;

    return (
        <div className="space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full flex transition-all duration-500 ease-out">
                        <div
                            className="bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${stats.total > 0 ? (stats.valid / stats.total) * 100 : 0}%` }}
                        />
                        <div
                            className="bg-red-400 transition-all duration-500 ease-out"
                            style={{ width: `${stats.total > 0 ? (stats.invalid / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 tabular-nums min-w-[48px] text-right">
                    {stats.progress}%
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                    stats.valid > 0
                        ? "bg-emerald-50/80 border-emerald-200/60 text-emerald-700"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                )}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs font-medium opacity-70">Valid</p>
                        <p className="text-lg font-bold tabular-nums leading-tight">{stats.valid}</p>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                    stats.invalid > 0
                        ? "bg-red-50/80 border-red-200/60 text-red-600"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                )}>
                    <XCircle className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs font-medium opacity-70">Invalid</p>
                        <p className="text-lg font-bold tabular-nums leading-tight">{stats.invalid}</p>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                    stats.unchecked > 0
                        ? "bg-amber-50/80 border-amber-200/60 text-amber-600"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                )}>
                    <CircleDashed className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs font-medium opacity-70">Unchecked</p>
                        <p className="text-lg font-bold tabular-nums leading-tight">{stats.unchecked}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
