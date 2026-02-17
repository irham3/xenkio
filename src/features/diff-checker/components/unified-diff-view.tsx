'use client';

import { DiffChange } from '../types';
import { cn } from '@/lib/utils';

interface UnifiedDiffViewProps {
    changes: DiffChange[];
}

export function UnifiedDiffView({ changes }: UnifiedDiffViewProps) {
    return (
        <div className="font-mono text-[13px] leading-relaxed bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-x-auto">
            <div className="whitespace-pre-wrap wrap-break-word">
                {changes.map((change, index) => (
                    <span
                        key={index}
                        className={cn(
                            change.added && "bg-success-100 text-success-800 px-0.5 rounded",
                            change.removed && "bg-error-100 text-error-800 line-through px-0.5 rounded",
                            !change.added && !change.removed && "text-gray-700"
                        )}
                    >
                        {change.value}
                    </span>
                ))}
            </div>
        </div>
    );
}
