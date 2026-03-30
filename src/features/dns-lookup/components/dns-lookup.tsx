'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import {
    Search,
    Copy,
    Check,
    AlertTriangle,
    Clock,
    ChevronRight,
    RotateCcw,
    Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDnsLookup } from '../hooks/use-dns-lookup';
import { DNS_RECORD_TYPES, formatTtl, getTypeName } from '../lib/dns-utils';
import type { DnsRecordType } from '../types';

const RECORD_TYPE_DESCRIPTIONS: Record<DnsRecordType, string> = {
    A: 'IPv4 address',
    AAAA: 'IPv6 address',
    MX: 'Mail exchange',
    TXT: 'Text record',
    CNAME: 'Canonical name',
    NS: 'Name server',
    SOA: 'Start of authority',
    PTR: 'Pointer record',
};

const QUICK_EXAMPLES = ['google.com', 'github.com', 'cloudflare.com', 'example.com'];

export function DnsLookup() {
    const { state, setDomain, setRecordType, lookup, reset } = useDnsLookup();
    const [inputValue, setInputValue] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (value: string) => {
        setInputValue(value);
        setDomain(value);
    };

    const handleLookup = () => {
        lookup(inputValue, state.recordType);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLookup();
        }
    };

    const handleTypeChange = (type: DnsRecordType) => {
        setRecordType(type);
        if (inputValue && state.status !== 'idle') {
            lookup(inputValue, type);
        }
    };

    const handleQuickExample = (domain: string) => {
        setInputValue(domain);
        setDomain(domain);
        lookup(domain, state.recordType);
    };

    const handleReset = () => {
        setInputValue('');
        reset();
        inputRef.current?.focus();
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }).catch(() => {
            // Silently ignore clipboard errors (e.g. insecure context, permissions denied)
        });
    };

    const isLoading = state.status === 'loading';
    const hasResults = state.status === 'success';
    const hasError = state.status === 'error';

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                <div className="p-6 md:p-8 space-y-5">
                    {/* Domain Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Domain Name</label>
                        <div className="relative flex gap-3">
                            <div className="relative flex-1">
                                <Server className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={e => handleInputChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. example.com"
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="w-full pl-10 pr-4 py-3 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400"
                                />
                            </div>
                            <Button
                                onClick={handleLookup}
                                disabled={isLoading || !inputValue.trim()}
                                className="gap-2 px-6 bg-primary-600 hover:bg-primary-700 text-white shrink-0"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Looking up…
                                    </span>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Lookup
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Record Type Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Record Type</label>
                        <div className="flex flex-wrap gap-2">
                            {DNS_RECORD_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeChange(type)}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all',
                                        state.recordType === type
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                                    )}
                                    title={RECORD_TYPE_DESCRIPTIONS[type]}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Examples */}
                    {state.status === 'idle' && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium">Try:</span>
                            {QUICK_EXAMPLES.map(example => (
                                <button
                                    key={example}
                                    onClick={() => handleQuickExample(example)}
                                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium group"
                                >
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    {example}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Error State */}
            {hasError && (
                <div className="bg-white rounded-2xl border border-error-200 p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-error-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-error-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Lookup Failed</p>
                        <p className="text-sm text-gray-500 mt-1">{state.error}</p>
                    </div>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-gray-200 hover:bg-gray-50 shrink-0"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </Button>
                </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-48" />
                    </div>
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="px-6 py-4 grid grid-cols-3 gap-4">
                                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                <div className="h-4 bg-gray-100 rounded animate-pulse col-span-2" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {hasResults && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                    {/* Results Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-success-500" />
                            <span className="text-sm font-semibold text-gray-700">
                                {state.records.length === 0
                                    ? 'No records found'
                                    : `${state.records.length} record${state.records.length !== 1 ? 's' : ''} found`}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                                {state.domain} · {state.recordType}
                            </span>
                        </div>
                        <Button
                            onClick={handleReset}
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-gray-500 hover:text-gray-700 h-8 px-3"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear
                        </Button>
                    </div>

                    {/* Empty state */}
                    {state.records.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-gray-500">
                                No <span className="font-semibold">{state.recordType}</span> records found for{' '}
                                <span className="font-semibold font-mono">{state.domain}</span>.
                            </p>
                        </div>
                    )}

                    {/* Records Table */}
                    {state.records.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                TTL
                                            </span>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            Value
                                        </th>
                                        <th className="px-6 py-3 w-12" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {state.records.map((record, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50/70 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md bg-primary-50 text-primary-700 border border-primary-100">
                                                    {getTypeName(record.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    {formatTtl(record.ttl)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-gray-900 text-sm break-all">
                                                    {record.data}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleCopy(record.data, index)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                                                    title="Copy value"
                                                >
                                                    {copiedIndex === index ? (
                                                        <Check className="w-3.5 h-3.5 text-success-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
