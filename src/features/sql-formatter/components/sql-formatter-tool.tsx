
'use client';

import { Sparkles, AlertCircle, ChevronDown, Zap, FileCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_SQL, SQL_LANGUAGES, KEYWORD_CASES, INDENT_STYLES, TAB_WIDTHS } from '../constants';
import type { SqlFormatterOptions, SqlFormatterResult, SqlFormatterStats, SqlLanguage, KeywordCase, IndentStyle } from '../types';
import { CopyButton, ClearButton } from '@/components/shared';
import { toast } from 'sonner';

interface SqlFormatterToolProps {
    options: SqlFormatterOptions;
    updateOption: <K extends keyof SqlFormatterOptions>(key: K, value: SqlFormatterOptions[K]) => void;
    result: SqlFormatterResult | null;
    stats: SqlFormatterStats | null;
    isFormatting: boolean;
    validationError: string | null;
    onFormat: () => void;
    onReset: () => void;
    onLoadSample: (sql: string) => void;
}

export function SqlFormatterTool({
    options,
    updateOption,
    result,
    stats,
    isFormatting,
    validationError,
    onFormat,
    onReset,
    onLoadSample,
}: SqlFormatterToolProps) {
    const handleDownload = () => {
        const content = result?.formatted;
        if (!content) return;
        const blob = new Blob([content], { type: 'text/sql' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `formatted-${Date.now()}.sql`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('SQL file downloaded');
    };

    const sharedClass = "w-full min-h-[350px] p-4 text-[13px] font-mono leading-relaxed bg-transparent border-0 outline-none resize-none whitespace-pre-wrap break-all";

    return (
        <div className="w-full">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-2 gap-0">
                    {/* Input Panel */}
                    <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <Label htmlFor="sql-input" className="text-sm font-bold text-gray-900">
                                        SQL Input
                                    </Label>
                                    <button
                                        onClick={() => onLoadSample(SAMPLE_SQL)}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Load Sample Query
                                    </button>
                                </div>
                                <div className={cn(
                                    "relative w-full h-[350px] bg-gray-50 border rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500 focus-within:bg-white transition-all",
                                    validationError ? "border-red-200 focus-within:border-red-400 focus-within:ring-red-500/10" : "border-gray-200"
                                )}>
                                    <textarea
                                        id="sql-input"
                                        value={options.sql}
                                        onChange={(e) => updateOption('sql', e.target.value)}
                                        placeholder='Paste your SQL query here... (e.g. SELECT * FROM users WHERE id = 1)'
                                        spellCheck={false}
                                        className={cn(
                                            sharedClass,
                                            "absolute inset-0 z-10 caret-gray-900 focus:ring-0 text-gray-900 placeholder:text-gray-400"
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

                            {/* Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">SQL Dialect</Label>
                                    <div className="relative">
                                        <select
                                            value={options.language}
                                            onChange={(e) => updateOption('language', e.target.value as SqlLanguage)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                                        >
                                            {SQL_LANGUAGES.map((lang) => (
                                                <option key={lang.id} value={lang.id}>{lang.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Keyword Case</Label>
                                    <div className="relative">
                                        <select
                                            value={options.keywordCase}
                                            onChange={(e) => updateOption('keywordCase', e.target.value as KeywordCase)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                                        >
                                            {KEYWORD_CASES.map((kc) => (
                                                <option key={kc.id} value={kc.id}>{kc.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Indent Style</Label>
                                    <div className="relative">
                                        <select
                                            value={options.indentStyle}
                                            onChange={(e) => updateOption('indentStyle', e.target.value as IndentStyle)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                                        >
                                            {INDENT_STYLES.map((style) => (
                                                <option key={style.id} value={style.id}>{style.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tab Width</Label>
                                    <div className="relative">
                                        <select
                                            value={options.tabWidth}
                                            onChange={(e) => updateOption('tabWidth', parseInt(e.target.value))}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                                        >
                                            {TAB_WIDTHS.map((tw) => (
                                                <option key={tw.id} value={tw.id}>{tw.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <ClearButton onClick={onReset} className="px-6 h-12 border-gray-200" variant="outline" />
                                <Button
                                    onClick={onFormat}
                                    disabled={!options.sql.trim() || isFormatting}
                                    className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/20 cursor-pointer"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Format SQL
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="p-6 bg-gray-50/30 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                Formatted Output
                                {stats && result?.isValid && (
                                    <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                                        {(stats.formattedSize / 1024).toFixed(2)} KB
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {result?.executionTime !== undefined && result.isValid && result.formatted && (
                                    <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                                        {result.executionTime.toFixed(2)}ms
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 relative min-h-[400px]">
                            <div className={cn(
                                "w-full h-full p-4 rounded-xl border font-mono text-[13px] leading-relaxed overflow-auto transition-all duration-300",
                                result?.isValid && result?.formatted
                                    ? "bg-white border-gray-200 text-gray-800 shadow-inner"
                                    : "bg-gray-100/50 border-dashed border-gray-300 text-gray-400 flex flex-col items-center justify-center gap-4"
                            )}>
                                {isFormatting ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                                        </span>
                                    </div>
                                ) : result?.isValid && result?.formatted ? (
                                    <pre className="w-full whitespace-pre-wrap break-all">{result.formatted}</pre>
                                ) : (
                                    <>
                                        <FileCode className="w-12 h-12 text-gray-200" />
                                        <p className="text-sm font-medium">Formatted SQL will appear here...</p>
                                    </>
                                )}
                            </div>

                            {result?.isValid && result?.formatted && (
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDownload}
                                        className="h-9 bg-white/90 backdrop-blur-sm border-gray-200 font-bold hover:bg-white cursor-pointer"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                    <CopyButton
                                        value={result.formatted}
                                        size="sm"
                                        className="h-9 font-bold px-4 transition-all"
                                        variant="default"
                                    />
                                </div>
                            )}
                        </div>

                        {stats && result?.isValid && options.sql.trim() && (
                            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-soft grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Original Size</p>
                                    <p className="text-sm font-bold text-gray-900">{stats.originalSize.toLocaleString()} bytes</p>
                                </div>
                                <div className="text-center border-x border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Formatted Size</p>
                                    <p className="text-sm font-bold text-gray-700">{stats.formattedSize.toLocaleString()} bytes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Diff</p>
                                    <p className={cn(
                                        "text-sm font-bold",
                                        stats.formattedSize > stats.originalSize ? "text-amber-600" : "text-green-600"
                                    )}>
                                        {stats.formattedSize > stats.originalSize ? '+' : ''}
                                        {((stats.formattedSize / stats.originalSize - 1) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
