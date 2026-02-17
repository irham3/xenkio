'use client';

import { useState, useEffect } from 'react';
import { useJsonFormatter } from '@/features/json-formatter/hooks/use-json-formatter';
import {
    Braces,
    Minimize2,
    Network,
    Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JsonInputPanel } from '@/features/json-formatter/components/json-input-panel';
import { JsonOutputPanel } from '@/features/json-formatter/components/json-output-panel';

export default function JsonFormatterClient() {
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

    const [activeTab, setActiveTab] = useState<'format' | 'minify' | 'graph' | 'typescript'>('format');

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
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer",
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
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer",
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
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer",
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
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer",
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
                    <JsonInputPanel
                        options={options}
                        updateOption={updateOption}
                        validationError={validationError}
                        activeTab={activeTab}
                        onFormat={format}
                        onMinify={minify}
                        onReset={reset}
                        onLoadSample={loadSample}
                    />
                    <JsonOutputPanel
                        options={options}
                        result={result}
                        stats={stats}
                        isFormatting={isFormatting}
                        activeTab={activeTab}
                        onDownload={handleDownload}
                    />
                </div>
            </div>
        </div>
    );
}
