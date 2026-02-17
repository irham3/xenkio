'use client';

import { DiffChange } from '../types';
import { cn } from '@/lib/utils';

interface SplitDiffViewProps {
    changes: DiffChange[];
}

export function SplitDiffView({ changes }: SplitDiffViewProps) {
    // Build left (original) and right (modified) content
    const leftContent: { value: string; type: 'removed' | 'unchanged' }[] = [];
    const rightContent: { value: string; type: 'added' | 'unchanged' }[] = [];

    for (const change of changes) {
        if (change.removed) {
            leftContent.push({ value: change.value, type: 'removed' });
        } else if (change.added) {
            rightContent.push({ value: change.value, type: 'added' });
        } else {
            leftContent.push({ value: change.value, type: 'unchanged' });
            rightContent.push({ value: change.value, type: 'unchanged' });
        }
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Left (Original) */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-error-400"></span>
                    Original
                </div>
                <div className="font-mono text-[13px] leading-relaxed bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-x-auto min-h-[100px]">
                    <div className="whitespace-pre-wrap wrap-break-word">
                        {leftContent.map((item, index) => (
                            <span
                                key={index}
                                className={cn(
                                    item.type === 'removed' && "bg-error-100 text-error-800 px-0.5 rounded",
                                    item.type === 'unchanged' && "text-gray-700"
                                )}
                            >
                                {item.value}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right (Modified) */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-success-400"></span>
                    Modified
                </div>
                <div className="font-mono text-[13px] leading-relaxed bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-x-auto min-h-[100px]">
                    <div className="whitespace-pre-wrap wrap-break-word">
                        {rightContent.map((item, index) => (
                            <span
                                key={index}
                                className={cn(
                                    item.type === 'added' && "bg-success-100 text-success-800 px-0.5 rounded",
                                    item.type === 'unchanged' && "text-gray-700"
                                )}
                            >
                                {item.value}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
