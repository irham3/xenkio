'use client';

import { cn } from '@/lib/utils';
import type { DataRow, RowStatus } from '../types';
import {
    CheckCircle2,
    XCircle,
    CircleDashed,
} from 'lucide-react';

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

export function ItemList({ rows, currentIndex, onGoToIndex }: ItemListProps) {
    if (rows.length === 0) return null;

    return (
        <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-themed pr-1">
            {rows.map((row, idx) => (
                <button
                    key={row.id}
                    onClick={() => onGoToIndex(idx)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-100",
                        idx === currentIndex
                            ? "bg-primary-50 border border-primary-200 shadow-sm"
                            : "hover:bg-gray-50 border border-transparent",
                        row.status === 'valid' && idx !== currentIndex && "bg-emerald-50/40",
                        row.status === 'invalid' && idx !== currentIndex && "bg-red-50/40",
                    )}
                >
                    <StatusDot status={row.status} />
                    <span className="text-xs font-mono text-gray-400 min-w-[20px]">{idx + 1}</span>
                    <span className={cn(
                        "text-sm truncate flex-1",
                        idx === currentIndex ? "font-medium text-gray-900" : "text-gray-600",
                    )}>
                        {row.value}
                    </span>
                    {row.comment && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-500 rounded font-medium shrink-0">
                            !
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
