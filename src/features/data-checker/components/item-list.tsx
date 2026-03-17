'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { DataRow, RowStatus } from '../types';
import {
    CheckCircle2,
    XCircle,
    CircleDashed,
    Search,
    Clock,
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface ItemListProps {
    rows: DataRow[];
    currentIndex: number;
    onGoToIndex: (index: number) => void;
    onSetRowStatus: (rowId: string, status: RowStatus, comment?: string) => void;
}

function StatusDot({ status }: { status: RowStatus }) {
    switch (status) {
        case 'valid':
            return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
        case 'invalid':
            return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
        default:
            return <CircleDashed className="w-4 h-4 text-gray-300 shrink-0" />;
    }
}

export function ItemList({ rows, currentIndex, onGoToIndex, onSetRowStatus }: ItemListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<RowStatus | 'all'>('all');
    const listRef = useRef<HTMLDivElement>(null);

    const filteredRows = useMemo(() => {
        return rows.map((row, index) => ({ ...row, originalIndex: index }))
            .filter(row => {
                const matchesSearch = row.value.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
                return matchesSearch && matchesStatus;
            });
    }, [rows, searchQuery, statusFilter]);

    // Auto-scroll current item into view
    useEffect(() => {
        if (statusFilter !== 'all' || searchQuery) return; // Don't auto-scroll if filtered

        const item = listRef.current?.children[currentIndex] as HTMLElement;
        if (item) {
            item.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [currentIndex, statusFilter, searchQuery]);

    if (rows.length === 0) return null;

    return (
        <div className="flex flex-col h-full space-y-3">
            {/* Search and Filter */}
            <div className="space-y-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {(['all', 'unchecked', 'valid', 'invalid'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "whitespace-nowrap px-2 py-1 text-[10px] font-medium rounded-md border transition-all",
                                statusFilter === s
                                    ? "bg-primary-50 text-primary-700 border-primary-200"
                                    : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                            )}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={listRef} className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-themed pr-1 scroll-smooth">
                {filteredRows.length > 0 ? (
                    filteredRows.map((row) => (
                        <button
                            key={row.id}
                            onClick={() => onGoToIndex(row.originalIndex)}
                            className={cn(
                                "group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200 border relative",
                                row.originalIndex === currentIndex
                                    ? "bg-primary-50 border-primary-200 shadow-sm ring-1 ring-primary-100"
                                    : "bg-white/50 border-transparent hover:border-gray-200 hover:bg-white",
                                row.status === 'valid' && row.originalIndex !== currentIndex && "bg-emerald-50/20 border-emerald-100/50",
                                row.status === 'invalid' && row.originalIndex !== currentIndex && "bg-red-50/20 border-red-100/50",
                            )}
                        >
                            {/* Active Indicator */}
                            {row.originalIndex === currentIndex && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                            )}

                            <div className="flex items-center justify-center w-6 h-6 rounded-full group-hover:bg-white/80 transition-all shrink-0">
                                <StatusDot status={row.status} />
                            </div>

                            <span className="text-[10px] font-mono text-gray-400 min-w-[18px] tabular-nums">{row.originalIndex + 1}</span>
                            <span className={cn(
                                "text-sm truncate flex-1",
                                row.originalIndex === currentIndex ? "font-bold text-gray-900" : "text-gray-600",
                            )}>
                                {row.value}
                            </span>

                            {/* Time indicator subtle dot */}
                            {(row.timeSpentMs || 0) > 15000 && (
                                <span title="Took a long time" className="flex items-center shrink-0">
                                    <Clock className="w-3 h-3 text-red-300" />
                                </span>
                            )}

                            {row.comment && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-bold shrink-0 shadow-sm border border-red-200">
                                    !
                                </span>
                            )}

                            {/* Hover Quick Actions */}
                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1 py-1 rounded-md shadow-sm border border-gray-100 transition-all">
                                <span
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetRowStatus(row.id, 'valid');
                                    }}
                                    className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                                    title="Mark Valid"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                </span>
                                <span
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetRowStatus(row.id, 'invalid', 'Quick Reject');
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    title="Mark Invalid"
                                >
                                    <XCircle className="w-4 h-4" />
                                </span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400">No items found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
