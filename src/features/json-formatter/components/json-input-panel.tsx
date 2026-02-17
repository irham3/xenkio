'use client';

import { Sparkles, AlertCircle, ChevronDown, ArrowDownWideNarrow, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { INDENT_SIZES, INDENT_TYPES, SAMPLE_JSON } from '../constants';
import { type IndentType, type IndentSize, type JsonFormatterOptions } from '../types';
import { ClearButton } from '@/components/shared';

interface JsonInputPanelProps {
    options: JsonFormatterOptions;
    updateOption: <K extends keyof JsonFormatterOptions>(key: K, value: JsonFormatterOptions[K]) => void;
    validationError: string | null;
    activeTab: 'format' | 'minify' | 'graph' | 'typescript';
    onFormat: () => void;
    onMinify: () => void;
    onReset: () => void;
    onLoadSample: (json: string) => void;
}

export function JsonInputPanel({
    options,
    updateOption,
    validationError,
    activeTab,
    onFormat,
    onMinify,
    onReset,
    onLoadSample
}: JsonInputPanelProps) {
    return (
        <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-5">
                <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                        <Label htmlFor="json-input" className="text-sm font-bold text-gray-900">
                            JSON Input
                        </Label>
                        <button
                            onClick={() => onLoadSample(SAMPLE_JSON)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Load Sample Data
                        </button>
                    </div>
                    <div className="relative">
                        <textarea
                            id="json-input"
                            value={options.json}
                            onChange={(e) => updateOption('json', e.target.value)}
                            placeholder='Paste your JSON content here... (e.g. {"name": "Xenkio"})'
                            spellCheck={false}
                            className={cn(
                                "w-full min-h-[350px] p-4 text-[13px] font-mono leading-relaxed bg-gray-50 border rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400",
                                validationError ? "border-red-200 focus:border-red-400 focus:ring-red-500/10" : "border-gray-200"
                            )}
                        />
                    </div>

                    <AnimatePresence>
                        {validationError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl border border-red-100"
                            >
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 leading-normal font-medium">{validationError}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {activeTab === 'format' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Indent Type</Label>
                            <div className="relative">
                                <select
                                    value={options.indentType}
                                    onChange={(e) => updateOption('indentType', e.target.value as IndentType)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    {INDENT_TYPES.map((type) => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Indent Size</Label>
                            <div className="relative">
                                <select
                                    value={options.indentSize}
                                    onChange={(e) => updateOption('indentSize', parseInt(e.target.value) as IndentSize)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    {INDENT_SIZES.map((size) => (
                                        <option key={size.id} value={size.id}>{size.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <ArrowDownWideNarrow className="w-5 h-5 text-gray-400" />
                        <div>
                            <Label htmlFor="sort-keys" className="text-sm font-bold text-gray-800 cursor-pointer">Sort Alphabetically</Label>
                            <p className="text-[11px] text-gray-500 font-medium">Reorder keys in A-Z order</p>
                        </div>
                    </div>
                    <button
                        id="sort-keys"
                        role="switch"
                        aria-checked={options.sortKeys}
                        onClick={() => updateOption('sortKeys', !options.sortKeys)}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                            options.sortKeys ? "bg-primary-600" : "bg-gray-300"
                        )}
                    >
                        <span
                            className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                                options.sortKeys ? "translate-x-6" : "translate-x-1"
                            )}
                        />
                    </button>
                </div>

                <div className="flex gap-3">
                    <ClearButton onClick={onReset} className="px-6 h-12 border-gray-200" variant="outline" />
                    {activeTab !== 'graph' && activeTab !== 'typescript' && (
                        <Button
                            onClick={activeTab === 'format' ? onFormat : onMinify}
                            disabled={!options.json.trim()}
                            className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/20 cursor-pointer"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            {activeTab === 'format' ? 'Apply Formatting' : 'Apply Minification'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
