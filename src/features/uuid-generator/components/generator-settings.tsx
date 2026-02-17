'use client';

import { Cpu, Hash, Info, Settings2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { NAMESPACES } from '../lib/uuid-utils';
import { type UUIDConfig } from '../types';
import { CopyButton } from '@/components/shared';

interface GeneratorSettingsProps {
    config: UUIDConfig;
    updateConfig: (updates: Partial<UUIDConfig>) => void;
    onGenerate: () => void;
    uuids: string[];
}

export function GeneratorSettings({ config, updateConfig, onGenerate, uuids }: GeneratorSettingsProps) {
    const handleCopyAll = () => {
        return uuids.join('\n');
    };

    return (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary-500" />
                    Generator Settings
                </h3>
                <div className="flex items-center gap-3">
                    {uuids.length > 1 && (
                        <CopyButton
                            value={handleCopyAll()}
                            label="Copy All"
                            className="rounded-xl h-11 border border-gray-200 hover:bg-gray-50 flex-1 sm:flex-none transition-all font-medium text-gray-700 hover:text-primary-600"
                        />
                    )}
                    <Button
                        onClick={onGenerate}
                        className="rounded-xl px-8 h-11 bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-primary transition-all active:scale-[0.98] group font-semibold flex-1 sm:flex-none cursor-pointer"
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
                                        "py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer",
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
                                    "flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all text-left group cursor-pointer",
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
                                    "flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all text-left group cursor-pointer",
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
    );
}
