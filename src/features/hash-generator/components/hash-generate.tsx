'use client';

import { useState } from 'react';
import { useHashGenerator } from '../hooks/use-hash-generator';
import { HASH_ALGORITHMS } from '../constants';
import { HashAlgorithm } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, ChevronDown, ShieldX, Zap, Hash, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HashGenerate() {
    const { options, result, isGenerating, updateOption, generate, reset } = useHashGenerator();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (result?.hash) {
            navigator.clipboard.writeText(result.hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        reset();
        setCopied(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
            <div className="grid lg:grid-cols-5 gap-0">

                {/* LEFT PANEL: Inputs & Options */}
                <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                    <div className="space-y-5">
                        {/* Text Input */}
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <Label htmlFor="input-text" className="text-sm font-semibold text-gray-800">
                                    Input Text
                                </Label>
                                <span className="text-xs text-gray-400 font-medium tabular-nums">
                                    {options.text.length} chars
                                </span>
                            </div>
                            <textarea
                                id="input-text"
                                value={options.text}
                                onChange={(e) => updateOption('text', e.target.value)}
                                placeholder="Type something to hash..."
                                className="w-full min-h-[120px] p-3 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                            />
                        </div>

                        {/* Algorithm Select Dropdown */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Algorithm</Label>
                            <div className="relative">
                                <select
                                    value={options.algorithm}
                                    onChange={(e) => updateOption('algorithm', e.target.value as HashAlgorithm)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                                >
                                    {HASH_ALGORITHMS.map((algo) => (
                                        <option key={algo.id} value={algo.id}>
                                            {algo.name} {algo.isAsync ? '(Slow/Secure)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Dynamic Options based on Algorithm */}
                        <div className="pt-4 border-t border-gray-100 space-y-4">

                            {/* BCRYPT OPTIONS */}
                            {options.algorithm === 'BCRYPT' && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-sm font-medium text-gray-700">Cost Factor</Label>
                                            <span className="text-xs font-mono font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                                                {options.cost ?? 10}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="4"
                                            max="30"
                                            step="1"
                                            value={options.cost ?? 10}
                                            onChange={(e) => updateOption('cost', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                        />
                                        <div className="flex justify-between mt-1 text-[12px] text-gray-400">
                                            <span>4 (Fast)</span>
                                            <span className={(options.cost ?? 10) > 12 ? "text-amber-500 font-medium" : ""}>
                                                {options.cost && options.cost > 14 ? "Very Slow!" : "12 (Standard)"}
                                            </span>
                                            <span>30 (Max)</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ARGON2 OPTIONS */}
                            {options.algorithm === 'ARGON2' && (
                                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                                    <div className="space-y-1">
                                        <Label className="text-[12px] font-medium text-gray-500 uppercase">Memory (KB)</Label>
                                        <Input
                                            type="number"
                                            value={options.memory}
                                            onChange={(e) => updateOption('memory', parseInt(e.target.value))}
                                            className="h-9 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[12px] font-medium text-gray-500 uppercase">Iterations</Label>
                                        <Input
                                            type="number"
                                            value={options.iterations}
                                            onChange={(e) => updateOption('iterations', parseInt(e.target.value))}
                                            className="h-9 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SALT INPUT (Hidden for Bcrypt) */}
                            {options.algorithm !== 'BCRYPT' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                    <Label htmlFor="salt" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        Salt <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="salt"
                                        value={options.salt}
                                        onChange={(e) => updateOption('salt', e.target.value)}
                                        placeholder={options.algorithm === 'ARGON2' ? "Optional random salt..." : "Append custom salt..."}
                                        className="bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex gap-2">
                            <Button
                                onClick={generate}
                                disabled={isGenerating || !options.text}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                            >
                                {isGenerating ? (
                                    <>
                                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Generate Hash
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                className="px-3 border-gray-200 hover:bg-gray-100"
                                title="Reset"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Output & Results */}
                <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[300px] border-l border-gray-100">
                    <div className="flex flex-col h-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-800">Generated Hash</h3>
                            {result?.executionTime !== undefined && !result.error && (
                                <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                    <Zap className="w-3 h-3" />
                                    {result.executionTime.toFixed(1)}ms
                                </span>
                            )}
                        </div>

                        <div className="flex-1 relative group">
                            <div className={cn(
                                "w-full min-h-[120px] p-5 rounded-xl border font-mono text-[13px] leading-relaxed break-all transition-all duration-300",
                                isGenerating
                                    ? "bg-white border-primary-200 text-gray-400"
                                    : result?.error
                                        ? "bg-error-50 border-error-200 text-error-600"
                                        : result?.hash
                                            ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                                            : "bg-white/50 border-dashed border-gray-200 text-gray-400"
                            )}>
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                                        </span>
                                        <span className="text-xs font-medium">Computing hash...</span>
                                    </div>
                                ) : result?.error ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-2">
                                        <ShieldX className="w-8 h-8 text-error-400 mb-2" />
                                        <p className="font-semibold">Error Generation Failed</p>
                                        <p className="text-xs opacity-80">{result.error}</p>
                                    </div>
                                ) : result?.hash ? (
                                    result.hash
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                                        <Hash className="w-8 h-8 text-gray-300" />
                                        <p>Waiting for input...</p>
                                    </div>
                                )}
                            </div>

                            {/* Copy Button */}
                            {result?.hash && !result.error && (
                                <div className="absolute top-3 right-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCopy}
                                        className={cn(
                                            "h-8 gap-1.5 text-xs font-medium border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all",
                                            copied && "text-success-600 border-success-500 bg-success-50"
                                        )}
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
