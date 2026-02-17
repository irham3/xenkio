'use client';

import { FileCode, Download, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { JsonGraphView } from './json-graph-view';
import { jsonToTypeScript } from '../lib/json-utils';
import { CopyButton } from '@/components/shared';

interface JsonOutputPanelProps {
    options: { json: string };
    result: { formatted: string; isValid: boolean; executionTime?: number } | null;
    stats: { originalSize: number; formattedSize: number } | null;
    isFormatting: boolean;
    activeTab: 'format' | 'minify' | 'graph' | 'typescript';
    onDownload: () => void;
}

export function JsonOutputPanel({
    options,
    result,
    stats,
    isFormatting,
    activeTab,
    onDownload
}: JsonOutputPanelProps) {
    const getParsedJson = () => {
        try {
            return options.json ? JSON.parse(options.json) : null;
        } catch {
            return null;
        }
    };

    return (
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
                        </div>
                    ) : result?.isValid && result?.formatted ? (
                        <pre className="whitespace-pre font-mono">{result.formatted}</pre>
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
                            <CopyButton
                                value={jsonToTypeScript(options.json)}
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-xs font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                label="Copy Code"
                            />
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
                            onClick={onDownload}
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
    );
}
