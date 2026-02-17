'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/shared';

interface GeneratedListProps {
    uuids: string[];
}

export function GeneratedList({ uuids }: GeneratedListProps) {
    if (uuids.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden"
        >
            <div className="p-8 md:p-12">
                <div className="space-y-5">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {uuids.map((uuid, idx) => (
                            <motion.div
                                key={`${uuid}-${idx}`}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                                className="group relative"
                            >
                                <div
                                    className="w-full p-6 md:p-10 bg-gray-50/30 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/10 transition-all group flex flex-col items-center justify-center text-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-mono text-xl md:text-3xl font-black tracking-tighter text-gray-900 break-all select-all leading-tight">
                                        {uuid}
                                    </span>

                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <CopyButton
                                            value={uuid}
                                            size="icon"
                                            variant="outline"
                                            className="h-12 w-12 rounded-xl bg-white border-gray-200 shadow-medium hover:border-primary-500 hover:text-primary-600"
                                            showText={false}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
