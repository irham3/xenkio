'use client';

import { Shield, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateStrength } from '../lib/password-utils';
import { CopyButton } from '@/components/shared';

interface HistorySidebarProps {
    history: Array<{ id: string; password: string }>;
}

export function HistorySidebar({ history }: HistorySidebarProps) {
    const getStrengthColor = (level: string) => {
        switch (level) {
            case 'strong': return 'bg-success-500';
            case 'good': return 'bg-primary-500';
            case 'fair': return 'bg-accent-400';
            case 'weak': return 'bg-error-500';
            default: return 'bg-gray-200';
        }
    };

    return (
        <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px] md:h-auto md:min-h-[600px] sticky top-8">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Recent
                    </h3>
                    <span className="text-xs font-mono text-gray-400">{history.length}/10</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                            <Shield className="h-12 w-12 mb-4 opacity-10" />
                            <p className="text-sm font-medium">No history yet</p>
                            <p className="text-xs opacity-70 mt-1">Generated passwords will live here</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {history.map((item, index) => {
                                const strength = calculateStrength(item.password);
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group relative"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-mono text-xs text-gray-600 break-all line-clamp-2 font-medium bg-gray-50 px-2 py-1 rounded w-full mr-2">
                                                {item.password}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "w-1.5 h-1.5 rounded-full transition-colors",
                                                            i <= strength.score
                                                                ? getStrengthColor(strength.level)
                                                                : "bg-gray-100"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <CopyButton
                                                value={item.password}
                                                size="sm"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 hover:text-primary-700 h-7"
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
