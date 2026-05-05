'use client';

import { Stack, MagnifyingGlass, Columns, CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CompareViewMode } from '../types';

interface CompareControlsProps {
    viewMode: CompareViewMode;
    onViewModeChange: (mode: CompareViewMode) => void;
    opacity: number;
    onOpacityChange: (value: number) => void;
    currentPage: number;
    maxPages: number;
    onPageChange: (page: number) => void;
    diffPercentage?: number;
    onReset: () => void;
}

const MODES: { id: CompareViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ghost', label: 'Ghost Overlay', icon: Stack },
    { id: 'diff', label: 'Pixel Diff', icon: MagnifyingGlass },
    { id: 'sidebyside', label: 'Side by Side', icon: Columns },
];

export function CompareControls({
    viewMode,
    onViewModeChange,
    opacity,
    onOpacityChange,
    currentPage,
    maxPages,
    onPageChange,
    diffPercentage,
    onReset,
}: CompareControlsProps) {
    return (
        <div className="space-y-5">
            {/* View Mode */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    View Mode
                </p>
                <div className="flex flex-col gap-1.5">
                    {MODES.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onViewModeChange(id)}
                            className={cn(
                                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                                viewMode === id
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0"/>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Opacity slider — only relevant in ghost mode */}
            {viewMode === 'ghost' && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Overlay Opacity
                        </p>
                        <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                            {Math.round(opacity * 100)}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(opacity * 100)}
                        onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
                        className="w-full accent-gray-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>A only</span>
                        <span>50/50</span>
                        <span>B only</span>
                    </div>
                </div>
            )}

            {/* Diff summary */}
            {diffPercentage !== undefined && (
                <div
                    className={cn(
                        'rounded-xl p-3 text-sm font-medium',
                        diffPercentage > 5
                            ? 'bg-error-50 text-error-700 border border-error-100'
                            : diffPercentage > 0
                            ? 'bg-warning-50 text-warning-700 border border-warning-100'
                            : 'bg-success-50 text-success-700 border border-success-100'
                    )}
                >
                    {diffPercentage === 0
                        ? '✓ Pages are identical'
                        : `⚠ ${diffPercentage.toFixed(2)}% pixels differ`}
                </div>
            )}

            {/* Page Navigation */}
            {maxPages > 1 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Page
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-9 h-9 p-0 rounded-lg"
                            disabled={currentPage <= 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            <CaretLeft className="w-4 h-4"  weight="duotone"/>
                        </Button>
                        <span className="flex-1 text-center text-sm font-medium text-gray-900">
                            {currentPage} / {maxPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-9 h-9 p-0 rounded-lg"
                            disabled={currentPage >= maxPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            <CaretRight className="w-4 h-4"  weight="duotone"/>
                        </Button>
                    </div>
                </div>
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="w-full text-gray-500 hover:text-error-600 hover:bg-error-50 hover:border-error-200 rounded-xl"
            >
                Start Over
            </Button>
        </div>
    );
}
