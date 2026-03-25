'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, BookOpen, Zap, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useHttpStatusCodes } from '../hooks/use-http-status-codes';
import { HttpStatusCode, StatusClass } from '../types';

const CLASS_STYLES: Record<
    StatusClass,
    { bg: string; border: string; text: string; badge: string; dot: string; tab: string; tabActive: string }
> = {
    '1xx': {
        bg: 'bg-primary-50',
        border: 'border-primary-200',
        text: 'text-primary-700',
        badge: 'bg-primary-100 text-primary-700',
        dot: 'bg-primary-400',
        tab: 'text-primary-600 hover:bg-primary-50',
        tabActive: 'bg-primary-600 text-white border-primary-600',
    },
    '2xx': {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700',
        dot: 'bg-green-500',
        tab: 'text-green-700 hover:bg-green-50',
        tabActive: 'bg-green-600 text-white border-green-600',
    },
    '3xx': {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-400',
        tab: 'text-amber-700 hover:bg-amber-50',
        tabActive: 'bg-amber-500 text-white border-amber-500',
    },
    '4xx': {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700',
        dot: 'bg-red-500',
        tab: 'text-red-700 hover:bg-red-50',
        tabActive: 'bg-red-600 text-white border-red-600',
    },
    '5xx': {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-700',
        dot: 'bg-purple-500',
        tab: 'text-purple-700 hover:bg-purple-50',
        tabActive: 'bg-purple-600 text-white border-purple-600',
    },
};

const CLASS_LABELS: Record<StatusClass, string> = {
    '1xx': 'Informational',
    '2xx': 'Success',
    '3xx': 'Redirection',
    '4xx': 'Client Error',
    '5xx': 'Server Error',
};

interface StatusCardProps {
    code: HttpStatusCode;
    isExpanded: boolean;
    onToggle: () => void;
}

function StatusCard({ code, isExpanded, onToggle }: StatusCardProps) {
    const styles = CLASS_STYLES[code.class];

    return (
        <div
            className={cn(
                'rounded-xl border transition-all duration-200 overflow-hidden',
                isExpanded ? styles.border : 'border-gray-200 hover:border-gray-300',
                isExpanded ? styles.bg : 'bg-white hover:bg-gray-50/50'
            )}
        >
            <button
                type="button"
                className="w-full text-left p-4 flex items-start gap-4 cursor-pointer"
                onClick={onToggle}
            >
                {/* Code number */}
                <div
                    className={cn(
                        'flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl font-mono',
                        styles.bg,
                        styles.text,
                        styles.border,
                        'border'
                    )}
                >
                    {code.code}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{code.name}</span>
                        {code.isDeprecated && (
                            <Badge variant="warning" className="text-xs">
                                Deprecated
                            </Badge>
                        )}
                        {code.spec && (
                            <span className="text-xs text-gray-400 font-mono">{code.spec}</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {code.description}
                    </p>
                </div>

                {/* Expand icon */}
                <div className={cn('flex-shrink-0 mt-1 transition-colors', styles.text)}>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
                <div className={cn('px-4 pb-4 pt-0 border-t', styles.border)}>
                    <div className="mt-3 space-y-4">
                        <div className="flex items-start gap-2.5">
                            <BookOpen className={cn('w-4 h-4 mt-0.5 flex-shrink-0', styles.text)} />
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {code.longDescription}
                            </p>
                        </div>
                        {code.useCase && (
                            <div className="flex items-start gap-2.5">
                                <Zap className={cn('w-4 h-4 mt-0.5 flex-shrink-0', styles.text)} />
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Use Case
                                    </span>
                                    <p className="text-sm text-gray-700 mt-0.5">{code.useCase}</p>
                                </div>
                            </div>
                        )}
                        {code.spec && (
                            <div className="flex items-start gap-2.5">
                                <FileText className={cn('w-4 h-4 mt-0.5 flex-shrink-0', styles.text)} />
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Specification
                                    </span>
                                    <p className="text-sm text-gray-700 mt-0.5 font-mono">{code.spec}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const ALL_CLASSES: StatusClass[] = ['1xx', '2xx', '3xx', '4xx', '5xx'];

export function HttpStatusCodesTool() {
    const { filter, setFilter, filtered, grouped, counts } = useHttpStatusCodes();
    const [expandedCode, setExpandedCode] = useState<number | null>(null);

    const handleToggle = (code: number) => {
        setExpandedCode((prev) => (prev === code ? null : code));
    };

    const activeClasses =
        filter.selectedClass === 'all'
            ? ALL_CLASSES.filter((cls) => grouped[cls].length > 0)
            : grouped[filter.selectedClass].length > 0
              ? [filter.selectedClass]
              : [];

    return (
        <div className="space-y-6">
            {/* Search + Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search by code number or name…"
                        value={filter.search}
                        onChange={(e) =>
                            setFilter((prev) => ({ ...prev, search: e.target.value }))
                        }
                        className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white"
                    />
                </div>

                {/* Class filter tabs */}
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setFilter((prev) => ({ ...prev, selectedClass: 'all' }))
                        }
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                            filter.selectedClass === 'all'
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                        )}
                    >
                        All
                        <span
                            className={cn(
                                'ml-1.5 text-xs',
                                filter.selectedClass === 'all'
                                    ? 'text-gray-300'
                                    : 'text-gray-400'
                            )}
                        >
                            {filtered.length}
                        </span>
                    </button>
                    {ALL_CLASSES.map((cls) => {
                        const styles = CLASS_STYLES[cls];
                        const isActive = filter.selectedClass === cls;
                        return (
                            <button
                                key={cls}
                                type="button"
                                onClick={() =>
                                    setFilter((prev) => ({ ...prev, selectedClass: cls }))
                                }
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                                    isActive
                                        ? cn(styles.tabActive, 'border')
                                        : cn('border-gray-200', styles.tab)
                                )}
                            >
                                {cls}
                                <span
                                    className={cn(
                                        'ml-1.5 text-xs',
                                        isActive ? 'opacity-75' : 'text-gray-400'
                                    )}
                                >
                                    {counts[cls]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results count */}
            {filter.search && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-3.5 h-3.5" />
                    <span>
                        {filtered.length === 0
                            ? 'No results found'
                            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${filter.search}"`}
                    </span>
                </div>
            )}

            {/* Status code groups */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-gray-500">No status codes found</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {activeClasses.map((cls) => {
                        const styles = CLASS_STYLES[cls];
                        const codes = grouped[cls];
                        return (
                            <section key={cls}>
                                {/* Section header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className={cn(
                                            'w-2 h-2 rounded-full flex-shrink-0',
                                            styles.dot
                                        )}
                                    />
                                    <h2 className="text-base font-bold text-gray-900">
                                        {cls}{' '}
                                        <span className="font-normal text-gray-500">
                                            — {CLASS_LABELS[cls]}
                                        </span>
                                    </h2>
                                    <span
                                        className={cn(
                                            'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full',
                                            styles.badge
                                        )}
                                    >
                                        {codes.length}
                                    </span>
                                </div>

                                {/* Cards grid */}
                                <div className="grid grid-cols-1 gap-2">
                                    {codes.map((code) => (
                                        <StatusCard
                                            key={code.code}
                                            code={code}
                                            isExpanded={expandedCode === code.code}
                                            onToggle={() => handleToggle(code.code)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
