'use client';

import { useEffect } from 'react';
import { useYamlValidator } from '../hooks/use-yaml-validator';
import { YamlValidatorMode } from '../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Copy, Download, Trash2, FileCode2, ArrowRightLeft, Braces, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const TABS: { id: YamlValidatorMode; label: string; icon: React.ReactNode; inputLabel: string; outputLabel: string }[] = [
    {
        id: 'validate',
        label: 'Validate & Format',
        icon: <CheckCircle2 className="w-4 h-4" />,
        inputLabel: 'Input YAML',
        outputLabel: 'Formatted YAML',
    },
    {
        id: 'yaml-to-json',
        label: 'YAML → JSON',
        icon: <ArrowRightLeft className="w-4 h-4" />,
        inputLabel: 'Input YAML',
        outputLabel: 'Output JSON',
    },
    {
        id: 'json-to-yaml',
        label: 'JSON → YAML',
        icon: <Braces className="w-4 h-4" />,
        inputLabel: 'Input JSON',
        outputLabel: 'Output YAML',
    },
];

export function YamlValidatorTool() {
    const { state, result, setInput, setMode, process, reset, loadSample } = useYamlValidator();

    const activeTab = TABS.find((t) => t.id === state.mode) ?? TABS[0];

    // Auto-process on input change
    useEffect(() => {
        if (!state.input.trim()) return;
        const timer = setTimeout(() => process(), 150);
        return () => clearTimeout(timer);
    }, [state.input, state.mode, process]);

    const handleCopy = () => {
        if (!result?.output) return;
        navigator.clipboard.writeText(result.output);
        toast.success('Copied to clipboard');
    };

    const handleDownload = () => {
        if (!result?.output) return;
        const ext = state.mode === 'yaml-to-json' ? 'json' : 'yaml';
        const mimeType = state.mode === 'yaml-to-json' ? 'application/json' : 'text/yaml';
        const blob = new Blob([result.output], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `output-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const validationBadge = () => {
        if (!state.input.trim()) return null;
        if (!result) return null;
        if (result.isValid) {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-700 bg-success-50 border border-success-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid
                    {result.documentCount !== undefined && result.documentCount > 1 && (
                        <span className="text-success-600">· {result.documentCount} docs</span>
                    )}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" />
                Invalid
            </span>
        );
    };

    return (
        <div className="w-full space-y-4">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl border border-gray-200">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setMode(tab.id)}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer',
                            state.mode === tab.id
                                ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        )}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-2 gap-0">
                    {/* Input Panel */}
                    <div className="flex flex-col h-[480px] relative border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <FileCode2 className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {activeTab.inputLabel}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {validationBadge()}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadSample}
                                    className="text-xs text-gray-500 hover:text-gray-700 h-7 px-2"
                                >
                                    Sample
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={reset}
                                    title="Clear"
                                    className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            value={state.input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                state.mode === 'json-to-yaml'
                                    ? 'Paste your JSON here...'
                                    : 'Paste your YAML here...'
                            }
                            className="flex-1 w-full h-full resize-none border-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed text-gray-800 bg-transparent"
                            spellCheck={false}
                        />

                        {/* Error overlay */}
                        {result && !result.isValid && result.error && (
                            <div className="absolute bottom-3 left-3 right-3 bg-red-50 border border-red-100 rounded-xl p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-red-700">
                                            {result.error.line !== undefined
                                                ? `Error at line ${result.error.line}, col ${result.error.column ?? '?'}`
                                                : 'Parse Error'}
                                        </p>
                                        <p className="text-xs text-red-600 mt-0.5 leading-relaxed break-words">
                                            {result.error.message.replace(/^YAMLException:\s*/, '').replace(/\n[\s\S]*/g, '')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Output Panel */}
                    <div className="flex flex-col h-[480px] bg-gray-900">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/60 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary-600 to-primary-400 pointer-events-none" />
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {activeTab.outputLabel}
                                </span>
                                {result?.executionTime !== undefined && (
                                    <span className="text-xs text-gray-600 font-mono">
                                        {result.executionTime.toFixed(1)}ms
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleCopy}
                                    disabled={!result?.output}
                                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                    title="Copy output"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleDownload}
                                    disabled={!result?.output}
                                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                    title="Download output"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            value={result?.output ?? ''}
                            readOnly
                            placeholder="Result will appear here..."
                            className="flex-1 w-full h-full resize-none border-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed text-green-400 bg-transparent placeholder-gray-600 selection:bg-primary-900 selection:text-white"
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
