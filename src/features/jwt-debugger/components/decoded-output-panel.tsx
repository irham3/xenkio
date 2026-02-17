'use client';

import { FileCode, AlertCircle, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JwtResult } from '../types';
import { CopyButton } from '@/components/shared';
import { VerificationBadge } from './verification-badge';

import { TooltipProvider } from '@/components/ui/tooltip';
import { JsonHighlighter } from './json-highlighter';

interface DecodedOutputPanelProps {
    mode: 'decode' | 'encode';
    result: JwtResult;
    hasToken: boolean;
}

export function DecodedOutputPanel({ mode, result, hasToken }: DecodedOutputPanelProps) {
    const isDecode = mode === 'decode';

    return (
        <div className="p-5 lg:p-6 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {isDecode ? 'Decoded Result' : 'Generated Token'}
                    {isDecode && <VerificationBadge isVerified={result.isVerified} hasToken={hasToken} verificationError={result.verificationError} />}
                </h3>
            </div>

            <div className="flex-1 space-y-6">
                {isDecode ? (
                    <>
                        {/* Header */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <LabelSm text="Header" color="text-gray-900" />
                                {result.decodedHeader && (
                                    <CopyButton
                                        value={JSON.stringify(result.decodedHeader, null, 2)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6"
                                    />
                                )}
                            </div>
                            <CodeBlock
                                content={result.decodedHeader}
                                colorClass="text-gray-600 border-gray-200 bg-gray-50"
                                placeholder="Header data will appear here"
                            />
                        </div>

                        {/* Payload */}
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                                <LabelSm text="Payload" color="text-gray-900" />
                                {result.decodedPayload && (
                                    <CopyButton
                                        value={JSON.stringify(result.decodedPayload, null, 2)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6"
                                    />
                                )}
                            </div>
                            <CodeBlock
                                content={result.decodedPayload}
                                colorClass="text-gray-600 border-gray-200 bg-gray-50"
                                placeholder="Payload claims will appear here"
                                className="min-h-[250px]"
                            />
                        </div>
                    </>
                ) : (
                    <div className="space-y-3 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                            <LabelSm text="Signed JWT" color="text-primary-600" />
                            {result.encodedToken && (
                                <CopyButton
                                    value={result.encodedToken}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6"
                                />
                            )}
                        </div>
                        <div className={cn(
                            "w-full flex-1 p-5 rounded-xl border font-mono text-sm leading-relaxed break-all transition-all duration-300 overflow-auto",
                            result.error ? "border-red-200 bg-red-50 text-red-600" : "bg-gray-50 border-gray-200 text-gray-700"
                        )}>
                            {result.error ? (
                                <div className="h-full flex flex-col items-center justify-center gap-2">
                                    <AlertCircle className="w-8 h-8 opacity-20" />
                                    <p className="text-xs font-semibold">{result.error}</p>
                                </div>
                            ) : result.encodedToken ? (
                                <div className="space-y-1 break-all">
                                    <span className="text-red-500 font-medium">{result.encodedToken.split('.')[0]}</span>
                                    <span className="text-gray-400 font-bold mx-px">.</span>
                                    <span className="text-purple-500 font-medium">{result.encodedToken.split('.')[1]}</span>
                                    <span className="text-gray-400 font-bold mx-px">.</span>
                                    <span className="text-blue-500 font-medium">{result.encodedToken.split('.')[2] || ''}</span>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                                    <FileCode className="w-10 h-10 opacity-20" />
                                    <p className="text-xs font-medium italic">Resulting token will appear here...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LabelSm({ text, color }: { text: string, color: string }) {
    return (
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", color)}>
            {text}
        </span>
    );
}

function CodeBlock({ content, colorClass, placeholder, className }: { content: Record<string, unknown> | null, colorClass: string, placeholder: string, className?: string }) {
    return (
        <div className={cn(
            "w-full p-4 rounded-xl border font-mono text-[13px] leading-relaxed transition-all duration-300 overflow-auto min-h-[120px] shadow-sm whitespace-pre-wrap",
            content ? colorClass : "bg-gray-50 border-gray-200 text-gray-300 flex items-center justify-center italic",
            className
        )}>
            {content ? (
                <TooltipProvider delayDuration={0}>
                    <JsonHighlighter json={JSON.stringify(content, null, 2)} />
                </TooltipProvider>
            ) : (
                <div className="flex items-center gap-2 opacity-30">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs">{placeholder}</span>
                </div>
            )}
        </div>
    );
}
