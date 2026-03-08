'use client';

import { useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Download, FileCode2, Minimize2, Sparkles, Zap, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ClearButton, CopyButton } from '@/components/shared';
import { useSqlFormatter } from '../hooks/use-sql-formatter';
import { SAMPLE_SQL } from '../lib/sql-utils';
import { SqlFormatterOptions } from '../types';

type ActiveTab = 'format' | 'minify';

export function SqlFormatterTool() {
    const {
        options,
        result,
        stats,
        isProcessing,
        validationError,
        updateOption,
        format,
        minify,
        reset,
        loadSample,
    } = useSqlFormatter();

    const [activeTab, setActiveTab] = useTabState();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleProcess = () => {
        if (activeTab === 'format') format();
        else minify();
    };

    const handleDownload = () => {
        if (!result?.formatted) return;
        const blob = new Blob([result.formatted], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full space-y-4">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl border border-gray-200">
                <TabButton
                    active={activeTab === 'format'}
                    onClick={() => setActiveTab('format')}
                    icon={<Database className="w-4 h-4" />}
                    label="Format & Beautify"
                />
                <TabButton
                    active={activeTab === 'minify'}
                    onClick={() => setActiveTab('minify')}
                    icon={<Minimize2 className="w-4 h-4" />}
                    label="Minify / Compact"
                />
            </div>

            {/* Main Panel */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-2 gap-0">

                    {/* ── Input Panel ─────────────────────────────────── */}
                    <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                        <div className="space-y-5">
                            {/* Header */}
                            <div className="flex items-baseline justify-between">
                                <Label className="text-sm font-bold text-gray-900">SQL Input</Label>
                                <button
                                    onClick={() => loadSample(SAMPLE_SQL)}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Load Sample
                                </button>
                            </div>

                            {/* Textarea */}
                            <div className={cn(
                                'relative w-full h-[320px] bg-gray-50 border rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500 focus-within:bg-white transition-all',
                                validationError
                                    ? 'border-red-200 focus-within:border-red-400 focus-within:ring-red-500/10'
                                    : 'border-gray-200'
                            )}>
                                <textarea
                                    ref={textareaRef}
                                    id="sql-input"
                                    value={options.sql}
                                    onChange={e => updateOption('sql', e.target.value)}
                                    placeholder="Paste your SQL query here…"
                                    spellCheck={false}
                                    className="absolute inset-0 z-10 w-full h-full p-4 text-[13px] font-mono leading-relaxed bg-transparent border-0 outline-none resize-none text-gray-800 placeholder:text-gray-400 focus:ring-0 caret-gray-900"
                                />
                            </div>

                            {/* Validation error */}
                            <AnimatePresence>
                                {validationError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl border border-red-100"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-700 leading-normal font-medium">{validationError}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Options (only shown in format tab) */}
                            {activeTab === 'format' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField
                                        label="Keywords"
                                        value={options.keywordCase}
                                        onChange={v => updateOption('keywordCase', v as SqlFormatterOptions['keywordCase'])}
                                        options={[
                                            { value: 'upper', label: 'UPPERCASE' },
                                            { value: 'lower', label: 'lowercase' },
                                            { value: 'preserve', label: 'Preserve' },
                                        ]}
                                    />
                                    <SelectField
                                        label="Indent"
                                        value={`${options.indentType}_${options.indentSize}`}
                                        onChange={v => {
                                            if (v === 'TAB_1') {
                                                updateOption('indentType', 'TAB');
                                            } else {
                                                updateOption('indentType', 'SPACE');
                                                updateOption('indentSize', parseInt(v.split('_')[1]) as SqlFormatterOptions['indentSize']);
                                            }
                                        }}
                                        options={[
                                            { value: 'SPACE_2', label: '2 Spaces' },
                                            { value: 'SPACE_4', label: '4 Spaces' },
                                            { value: 'SPACE_8', label: '8 Spaces' },
                                            { value: 'TAB_1', label: 'Tab' },
                                        ]}
                                    />
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <ClearButton
                                    onClick={reset}
                                    className="px-6 h-12 border-gray-200"
                                    variant="outline"
                                />
                                <Button
                                    onClick={handleProcess}
                                    disabled={!options.sql.trim() || isProcessing}
                                    className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/20 cursor-pointer"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    {activeTab === 'format' ? 'Format SQL' : 'Minify SQL'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ── Output Panel ─────────────────────────────────── */}
                    <div className="p-6 bg-gray-50/30 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                Output Result
                                {stats && options.sql.trim() && (
                                    <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                                        {(stats.formattedSize / 1024).toFixed(2)} KB
                                    </span>
                                )}
                            </h3>
                            {result?.executionTime !== undefined && result.isValid && result.formatted && (
                                <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                                    {result.executionTime.toFixed(2)}ms
                                </span>
                            )}
                        </div>

                        <div className="flex-1 relative min-h-[360px]">
                            <div className={cn(
                                'w-full h-full p-4 rounded-xl border font-mono text-[13px] leading-relaxed overflow-auto transition-all duration-300',
                                result?.isValid && result?.formatted
                                    ? 'bg-white border-gray-200 text-gray-800 shadow-inner'
                                    : 'bg-gray-100/50 border-dashed border-gray-300 text-gray-400 flex flex-col items-center justify-center gap-4'
                            )}>
                                {isProcessing ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500" />
                                        </span>
                                    </div>
                                ) : result?.isValid && result?.formatted ? (
                                    <pre className="w-full whitespace-pre-wrap break-all text-gray-800">
                                        {result.formatted}
                                    </pre>
                                ) : (
                                    <>
                                        <FileCode2 className="w-12 h-12 text-gray-200" />
                                        <p className="text-sm font-medium">
                                            {validationError
                                                ? 'Fix the error in your SQL first'
                                                : 'Formatted SQL will appear here…'}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Copy & Download overlay */}
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

                        {/* Stats */}
                        {stats && options.sql.trim() && result?.isValid && (
                            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-soft grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Original</p>
                                    <p className="text-sm font-bold text-gray-900">{stats.originalSize.toLocaleString()} B</p>
                                </div>
                                <div className="text-center border-x border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Result</p>
                                    <p className="text-sm font-bold text-gray-700">{stats.formattedSize.toLocaleString()} B</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Diff</p>
                                    <p className={cn(
                                        'text-sm font-bold',
                                        stats.formattedSize > stats.originalSize ? 'text-amber-600' : 'text-green-600'
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

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

function useTabState(): [ActiveTab, (t: ActiveTab) => void] {
    const [tab, setTab] = useState<ActiveTab>('format');
    return [tab, setTab];
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer',
                active
                    ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            )}
        >
            {icon}
            {label}
        </button>
    );
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</Label>
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}
