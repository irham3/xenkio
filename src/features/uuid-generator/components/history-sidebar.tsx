'use client';

import { History, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type UUIDItem } from '../types';
import { CopyButton, ClearButton } from '@/components/shared';

interface HistorySidebarProps {
    history: UUIDItem[];
    onClear: () => void;
}

export function HistorySidebar({ history, onClear }: HistorySidebarProps) {
    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[750px] sticky top-8 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <History className="h-5 w-5 text-primary-500" />
                        History
                    </h3>
                    {history.length > 0 && (
                        <ClearButton onClick={onClear} size="icon" />
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-themed bg-gray-50/50">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                            <Cpu className="h-12 w-12 mb-4 opacity-10" />
                            <p className="text-sm font-bold">History is empty</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {history.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary-100 transition-all group relative cursor-pointer shadow-sm hover:shadow-md"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black px-2.5 py-1 rounded bg-primary-50 text-primary-700 uppercase tracking-widest">
                                            {item.version}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="font-mono text-xs text-gray-900 break-all leading-relaxed font-bold">
                                        {item.value}
                                    </div>
                                    <div className="absolute right-4 bottom-5 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CopyButton
                                            value={item.value}
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 rounded-lg border border-gray-100 shadow-sm bg-white"
                                            showText={false}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
