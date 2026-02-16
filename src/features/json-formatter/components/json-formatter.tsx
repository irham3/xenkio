'use client';

import { useState, useEffect } from 'react';
import { useJsonFormatter } from '../hooks/use-json-formatter';
import { INDENT_SIZES, INDENT_TYPES, SAMPLE_JSON } from '../constants';
import { IndentType, IndentSize } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Copy,
    Check,
    ChevronDown,
    Zap,
    Braces,
    Minimize2,
    RotateCcw,
    FileCode,
    Download,
    AlertCircle,
    Sparkles,
    ArrowDownWideNarrow,
    Network,
    Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { JsonGraphView } from './json-graph-view';
import { jsonToTypeScript } from '../lib/json-utils';

export function JsonFormatter() {
    const {
        options,
        result,
        stats,
        isFormatting,
        validationError,
        updateOption,
        format,
        minify,
        reset,
        loadSample,
    } = useJsonFormatter();

    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'format' | 'minify' | 'graph' | 'typescript'>('format');

    // Parse JSON for graph view
    const getParsedJson = () => {
        try {
            return options.json ? JSON.parse(options.json) : null;
        } catch {
            return null;
        }
    };

    // Instant gratification: Auto-format on option change if not empty
    useEffect(() => {
        if (options.json.trim()) {
            const timer = setTimeout(() => {
                if (activeTab === 'format') {
                    format();
                } else if (activeTab === 'minify') {
                    minify();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [options.json, options.indentSize, options.indentType, options.sortKeys, activeTab, format, minify]);

    const handleCopy = () => {
        if (result?.formatted) {
            navigator.clipboard.writeText(result.formatted);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!result?.formatted) return;

        const blob = new Blob([result.formatted], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200">
                <button
                    onClick={() => setActiveTab('format')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
                        activeTab === 'format'
                            ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    <Braces className="w-4 h-4" />
                    Format & Beautify
                </button>
                <button
                    onClick={() => setActiveTab('minify')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
                        activeTab === 'minify'
                            ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    <Minimize2 className="w-4 h-4" />
                    Minify / Compact
                </button>
                <button
                    onClick={() => setActiveTab('graph')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
                        activeTab === 'graph'
                            ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    <Network className="w-4 h-4" />
                    Tree View
                </button>
                <button
                    onClick={() => setActiveTab('typescript')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
                        activeTab === 'typescript'
                            ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    <Code2 className="w-4 h-4" />
                    TypeScript
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-2 gap-0">
                    {/* Input Panel */}
                    <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <Label htmlFor="json-input" className="text-sm font-bold text-gray-900">
                                        JSON Input
                                    </Label>
                                    <button
                                        onClick={() => loadSample(SAMPLE_JSON)}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 transition-colors"
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
                                    {!options.json && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                            <Braces className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {validationError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl border border-red-100"
                                        >
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
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
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
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
                                <Button
                                    onClick={reset}
                                    variant="outline"
                                    className="px-6 h-12 border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                                {activeTab !== 'graph' && activeTab !== 'typescript' && (
                                    <Button
                                        onClick={activeTab === 'format' ? format : minify}
                                        disabled={!options.json.trim()}
                                        className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/20"
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        {activeTab === 'format' ? 'Apply Formatting' : 'Apply Minification'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="p-6 bg-gray-50/30 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                Output Result
                                {stats && options.json.trim() && (
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
                                        <span className="text-xs font-bold text-gray-400">Processing JSON...</span>
                                    </div>
                                ) : result?.isValid && result?.formatted ? (
                                    <pre className="whitespace-pre">{result.formatted}</pre>
                                ) : (
                                    <>
                                        <FileCode className="w-12 h-12 text-gray-200" />
                                        <p className="text-sm font-medium">Results will appear here...</p>
                                    </>
                                )}
                            </div>

                            {activeTab === 'graph' && (
                                <div className="absolute inset-0 bg-white z-20 overflow-hidden rounded-xl border border-gray-200">
                                    {getParsedJson() ? (
                                        <JsonGraphView data={getParsedJson()} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                            <Network className="w-12 h-12 opacity-20" />
                                            <p className="text-sm font-medium">Please parse valid JSON to see the tree view</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'typescript' && (
                                <div className="absolute inset-0 bg-white z-20 flex flex-col rounded-xl border border-gray-200">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generated TypeScript Interfaces</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                const code = jsonToTypeScript(options.json);
                                                navigator.clipboard.writeText(code);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="h-8 px-3 text-xs font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                        >
                                            {copied ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                                            {copied ? 'Copied' : 'Copy Code'}
                                        </Button>
                                    </div>
                                    <pre className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed text-blue-800 bg-white select-all italic-comments">
                                        <code>{jsonToTypeScript(options.json)}</code>
                                    </pre>
                                </div>
                            )}

                            {result?.isValid && result?.formatted && activeTab !== 'graph' && activeTab !== 'typescript' && (
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDownload}
                                        className="h-9 bg-white/90 backdrop-blur-sm border-gray-200 font-bold hover:bg-white"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleCopy}
                                        className={cn(
                                            "h-9 font-bold px-4 transition-all",
                                            copied ? "bg-green-600 hover:bg-green-700" : "bg-gray-900 hover:bg-black"
                                        )}
                                    >
                                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {stats && options.json.trim() && result?.isValid && (
                            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-soft grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Original Size</p>
                                    <p className="text-sm font-bold text-gray-900">{stats.originalSize.toLocaleString()} bytes</p>
                                </div>
                                <div className="text-center border-x border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">New Size</p>
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
