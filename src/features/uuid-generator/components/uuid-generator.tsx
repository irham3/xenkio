
'use client';

import { useState } from 'react';
import { useUUIDGenerator } from '../hooks/use-uuid-generator';
import { Button } from '@/components/ui/button';
import {
    Copy,
    RefreshCw,
    Check,
    History,
    Settings2,
    Cpu,
    Hash,
    Trash2,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { NAMESPACES } from '../lib/uuid-utils';

export function UUIDGenerator() {
    const { config, uuids, history, generate, updateConfig, clearHistory } = useUUIDGenerator();
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleCopyAll = async () => {
        const text = uuids.join('\n');
        await navigator.clipboard.writeText(text);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-primary-500" />
                            Generator Settings
                        </h3>
                        <div className="flex items-center gap-3">
                            {uuids.length > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={handleCopyAll}
                                    className="rounded-xl h-11 border border-gray-200 hover:bg-gray-50 flex-1 sm:flex-none transition-all font-medium text-gray-700"
                                >
                                    {copied === 'all' ? (
                                        <><Check className="mr-2 h-4 w-4 text-emerald-600" /> Copied</>
                                    ) : (
                                        <><Copy className="mr-2 h-4 w-4" /> Copy All</>
                                    )}
                                </Button>
                            )}
                            <Button
                                onClick={generate}
                                className="rounded-xl px-8 h-11 bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-primary transition-all active:scale-[0.98] group font-semibold flex-1 sm:flex-none"
                            >
                                <RefreshCw className={cn("mr-2 h-4 w-4", "group-active:rotate-180 transition-transform duration-500")} />
                                Generate
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-tight">
                                    <Cpu className="h-4 w-4 text-primary-400" />
                                    UUID Version
                                </label>
                                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                    {(['v1', 'v3', 'v4', 'v5', 'v6', 'v7'] as const).map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => updateConfig({ version: v })}
                                            className={cn(
                                                "py-2.5 text-xs font-black rounded-lg transition-all",
                                                config.version === v
                                                    ? "bg-white text-primary-600 border border-gray-100 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                                            )}
                                        >
                                            {v.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Quantity</label>
                                    <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{config.count}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    step="1"
                                    value={config.count}
                                    onChange={(e) => updateConfig({ count: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-tight">
                                    <Hash className="h-4 w-4 text-primary-400" />
                                    Format Options
                                </label>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => updateConfig({ uppercase: !config.uppercase })}
                                        className={cn(
                                            "flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all text-left group",
                                            config.uppercase
                                                ? "border-primary-500 bg-primary-50/30 text-primary-900"
                                                : "border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">Uppercase</span>
                                            <span className="text-[10px] uppercase font-black opacity-40 tracking-wider">ABC-123</span>
                                        </div>
                                        <div className={cn(
                                            "w-10 h-6 flex items-center rounded-full p-1 transition-colors",
                                            config.uppercase ? "bg-primary-500" : "bg-gray-200"
                                        )}>
                                            <div className={cn(
                                                "bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform",
                                                config.uppercase ? "translate-x-4" : "translate-x-0"
                                            )} />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => updateConfig({ hyphens: !config.hyphens })}
                                        className={cn(
                                            "flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all text-left group",
                                            config.hyphens
                                                ? "border-primary-500 bg-primary-50/30 text-primary-900"
                                                : "border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">Hyphens</span>
                                            <span className="text-[10px] uppercase font-black opacity-40 tracking-wider">With Dashes</span>
                                        </div>
                                        <div className={cn(
                                            "w-10 h-6 flex items-center rounded-full p-1 transition-colors",
                                            config.hyphens ? "bg-primary-500" : "bg-gray-200"
                                        )}>
                                            <div className={cn(
                                                "bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform",
                                                config.hyphens ? "translate-x-4" : "translate-x-0"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(config.version === 'v3' || config.version === 'v5') && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-5"
                        >
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                                <Info className="h-4 w-4 text-primary-500" />
                                Namespace Source for {config.version.toUpperCase()}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Namespace</label>
                                    <select
                                        value={config.namespace}
                                        onChange={(e) => updateConfig({ namespace: e.target.value })}
                                        className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-mono"
                                    >
                                        <option value={NAMESPACES.DNS}>DNS (Default)</option>
                                        <option value={NAMESPACES.URL}>URL</option>
                                        <option value={NAMESPACES.OID}>OID</option>
                                        <option value={NAMESPACES.X500}>X.500</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Source Name</label>
                                    <input
                                        type="text"
                                        value={config.name}
                                        onChange={(e) => updateConfig({ name: e.target.value })}
                                        placeholder="e.g. xenkio.pages.dev"
                                        className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* HERO: UUID Display - NOW AT BOTTOM */}
                <AnimatePresence>
                    {uuids.length > 0 && (
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
                                                    onClick={() => handleCopy(uuid)}
                                                    className="w-full p-6 md:p-10 bg-gray-50/30 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="font-mono text-xl md:text-3xl font-black tracking-tighter text-gray-900 break-all select-all leading-tight">
                                                        {uuid}
                                                    </span>

                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-medium">
                                                            {copied === uuid ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5 text-primary-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[750px] sticky top-8 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <History className="h-5 w-5 text-primary-500" />
                            History
                        </h3>
                        {history.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                title="Clear history"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
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
                                        onClick={() => handleCopy(item.value)}
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
                                        <div className="absolute right-4 bottom-5 bg-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 shadow-sm">
                                            {copied === item.value ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-primary-500" />}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
