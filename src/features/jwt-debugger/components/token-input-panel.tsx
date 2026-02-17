'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ClearButton } from '@/components/shared/clear-button';
import { CopyButton } from '@/components/shared/copy-button';
import { JwtOptions, JWT_ALGORITHMS } from '../types';
import { ChevronDown, Lock, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
    TooltipProvider,
} from '@/components/ui/tooltip';

interface TokenInputPanelProps {
    options: JwtOptions;
    updateOption: <K extends keyof JwtOptions>(key: K, value: JwtOptions[K]) => void;
    onTrigger: () => void;
}

import { JsonHighlighter } from './json-highlighter';

export function TokenInputPanel({ options, updateOption, onTrigger }: TokenInputPanelProps) {
    const isDecode = options.mode === 'decode';
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    const handleClear = () => {
        if (isDecode) {
            updateOption('token', '');
        } else {
            updateOption('payload', '{\n  \n}');
        }
    };

    const handleScroll = () => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const handleReSign = () => {
        try {
            // Force update iat to show change
            const currentPayload = JSON.parse(options.payload);
            const newPayload = {
                ...currentPayload,
                iat: Math.floor(Date.now() / 1000)
            };
            updateOption('payload', JSON.stringify(newPayload, null, 2));
            // Trigger will happen via useEffect when payload changes, but we call it explicitly just in case custom logic changes later
            setTimeout(onTrigger, 0);
        } catch {
            // If payload is invalid JSON, just trigger verify
            onTrigger();
        }
    };

    const sharedClass = "w-full h-full p-4 font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap border-0 outline-none resize-none bg-transparent";

    return (
        <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white space-y-6">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-900 uppercase tracking-tight">
                        {isDecode ? 'Encoded Token' : 'Payload (JSON)'}
                    </Label>
                    <div className="flex gap-2">
                        {((isDecode && options.token) || (!isDecode && options.payload)) && (
                            <CopyButton
                                value={isDecode ? options.token : options.payload}
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                            />
                        )}
                        <ClearButton onClick={handleClear} size="sm" variant="ghost" className="h-6 px-2 text-xs" />
                    </div>
                </div>

                <TooltipProvider delayDuration={0}>
                    <div className="relative w-full h-[300px] bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500 transition-all group">
                        {/* Highlight Layer (Visual) */}
                        <div
                            ref={highlightRef}
                            className={cn(sharedClass, "absolute inset-0 z-20 text-transparent overflow-hidden pointer-events-none select-none")}
                            aria-hidden="true"
                        >
                            {isDecode && options.token ? (
                                options.token.split('.').map((part, index, array) => (
                                    <span key={index}>
                                        <span className={cn(
                                            "font-medium",
                                            index === 0 && "text-red-500",
                                            index === 1 && "text-purple-500",
                                            index === 2 && "text-blue-500",
                                            index > 2 && "text-gray-500"
                                        )}>{part}</span>
                                        {index < array.length - 1 && <span className="text-gray-400 font-bold">.</span>}
                                    </span>
                                ))
                            ) : !isDecode && options.payload ? (
                                <JsonHighlighter json={options.payload} />
                            ) : null}
                        </div>

                        {/* Editor Layer (Input) */}
                        <textarea
                            ref={textareaRef}
                            onScroll={handleScroll}
                            value={isDecode ? options.token : options.payload}
                            onChange={(e) => updateOption(isDecode ? 'token' : 'payload', e.target.value)}
                            placeholder={isDecode ? 'Paste your JWT token here...' : 'Enter your payload JSON...'}
                            className={cn(
                                sharedClass,
                                "absolute inset-0 z-10 caret-gray-900 focus:ring-0",
                                // Hide text if content exists to show highlight layer
                                ((isDecode && options.token) || (!isDecode && options.payload))
                                    ? "text-transparent placeholder:text-gray-400"
                                    : "text-gray-900 placeholder:text-gray-400"
                            )}
                            spellCheck={false}
                        />

                        {/* Copy Button */}
                        {((isDecode && options.token) || (!isDecode && options.payload)) && (
                            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                {/* Add pointer-events handling to ensure button is clickable */}
                                <CopyButton
                                    value={isDecode ? options.token : options.payload}
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white shadow-sm"
                                />
                            </div>
                        )}
                    </div>
                </TooltipProvider>
            </div>

            {!isDecode && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Algorithm</Label>
                            <div className="relative">
                                <select
                                    value={options.algorithm}
                                    onChange={(e) => updateOption('algorithm', e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-50"
                                >
                                    {JWT_ALGORITHMS.map((alg) => (
                                        <option key={alg.id} value={alg.id}>{alg.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900 uppercase tracking-tight">
                    Secret / Private Key
                </Label>
                <div className="relative group">
                    <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center text-gray-400 pointer-events-none">
                        <Lock className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={options.secret}
                        onChange={(e) => updateOption('secret', e.target.value)}
                        placeholder="your-256-bit-secret"
                        className="w-full h-11 p-3 pl-10 pr-12 text-sm font-mono bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    />
                    {options.secret && (
                        <div className="absolute right-2 top-0 bottom-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <CopyButton
                                value={options.secret}
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg bg-transparent"
                            />
                        </div>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 italic font-medium">
                    {isDecode ? 'Used to verify the token signature' : 'Used to sign the generated token'}
                </p>
            </div>

            {!isDecode && (
                <div className="pt-2">
                    <Button
                        onClick={handleReSign}
                        className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-sm transition-all"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Re-Sign Token
                    </Button>
                </div>
            )}
        </div>
    );
}

