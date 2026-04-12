'use client';

import { Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TotpAccount } from '../types';
import type { TotpCodeEntry } from '../hooks/use-totp-authenticator';

interface AccountCardProps {
    account: TotpAccount;
    codeEntry: TotpCodeEntry | undefined;
    onCopy: (code: string) => void;
    onRemove: (id: string) => void;
}

export function AccountCard({ account, codeEntry, onCopy, onRemove }: AccountCardProps) {
    const code = codeEntry?.code ?? '------';
    const remaining = codeEntry?.remainingSeconds ?? 30;
    const progress = codeEntry?.progress ?? 0;

    const firstHalf = code.slice(0, Math.ceil(code.length / 2));
    const secondHalf = code.slice(Math.ceil(code.length / 2));

    const isUrgent = remaining <= 5;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    {account.issuer && (
                        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider truncate">
                            {account.issuer}
                        </p>
                    )}
                    <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{account.name}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-gray-400 font-mono">{account.algorithm}</span>
                    <span className="text-xs text-gray-300 mx-1">·</span>
                    <span className="text-xs text-gray-400 font-mono">{account.digits}d</span>
                </div>
            </div>

            {/* OTP Code */}
            <div className="flex items-center justify-between gap-3">
                <span
                    className={cn(
                        'font-mono text-3xl font-bold tracking-widest select-all transition-colors',
                        isUrgent ? 'text-error-600' : 'text-gray-900'
                    )}
                >
                    {firstHalf} {secondHalf}
                </span>
                <button
                    onClick={() => onCopy(code.replace(' ', ''))}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                    title="Copy code"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>

            {/* Countdown bar */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className={cn(
                        'text-xs font-semibold tabular-nums',
                        isUrgent ? 'text-error-600' : 'text-gray-500'
                    )}>
                        {remaining}s
                    </span>
                    <button
                        onClick={() => onRemove(account.id)}
                        className="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors cursor-pointer"
                        title="Remove account"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            isUrgent ? 'bg-error-500' : 'bg-primary-500'
                        )}
                        style={{ width: `${(1 - progress) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
