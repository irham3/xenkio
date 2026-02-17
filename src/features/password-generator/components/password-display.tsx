'use client';

import { useState } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CopyButton } from '@/components/shared';

interface PasswordDisplayProps {
    password: string;
    strength: {
        level: string;
        score: number;
        feedback: string[];
    };
    onGenerate: () => void;
}

export function PasswordDisplay({ password, strength, onGenerate }: PasswordDisplayProps) {
    const getStrengthColor = (level: string) => {
        switch (level) {
            case 'strong': return 'bg-success-500';
            case 'good': return 'bg-primary-500';
            case 'fair': return 'bg-accent-400';
            case 'weak': return 'bg-error-500';
            default: return 'bg-gray-200';
        }
    };

    const getStrengthTextColor = (level: string) => {
        switch (level) {
            case 'strong': return 'text-success-600';
            case 'good': return 'text-primary-600';
            case 'fair': return 'text-accent-500';
            case 'weak': return 'text-error-600';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Progress bar top accent */}
            <div className="h-1.5 w-full bg-gray-50">
                <motion.div
                    className={cn("h-full", getStrengthColor(strength.level))}
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength.score + 1) * 20}%` }}
                    transition={{ duration: 0.5, type: "spring" }}
                />
            </div>

            <div className="p-8 md:p-10 text-center relative group">
                <motion.div
                    key={password}
                    initial={{ opacity: 0.5, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-3xl md:text-5xl font-bold tracking-wider text-gray-800 break-all cursor-pointer selection:bg-primary-100 selection:text-primary-900 leading-tight"
                    title="Password"
                >
                    {password}
                </motion.div>

                <div className="mt-8 flex justify-center gap-4">
                    <Button
                        size="lg"
                        onClick={onGenerate}
                        className="rounded-xl px-6 h-12 bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                        <RefreshCw className={cn("mr-2 h-5 w-5", "group-hover:rotate-180 transition-transform duration-500")} />
                        Regenerate
                    </Button>

                    <CopyButton
                        value={password}
                        size="lg"
                        className="rounded-xl px-8 h-12 font-semibold shadow-sm hover:shadow-md min-w-[140px]"
                        variant="default"
                    />
                </div>

                {/* Strength Text */}
                <div className="mt-6 flex flex-col items-center">
                    <span className={cn("text-sm font-bold uppercase tracking-widest mb-1", getStrengthTextColor(strength.level))}>
                        {strength.level} Password
                    </span>
                    {strength.feedback.length > 0 && (
                        <span className="text-xs text-error-500 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            {strength.feedback[0]}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
