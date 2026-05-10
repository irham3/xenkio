'use client';

import { useMemo, useRef, useState, KeyboardEvent } from 'react';
import {
    MagnifyingGlass,
    Warning,
    Clock,
    Globe,
    FileText,
    ArrowsClockwise,
    ArrowSquareOut,
    Copy,
    Check,
    GitBranch,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHttpStatusChecker } from '../hooks/use-http-status-checker';
import type { StatusCheckResult } from '../types';

const STATUS_CLASS_STYLES: Record<
    StatusCheckResult['statusClass'],
    { bg: string; border: string; text: string; badge: string; label: string }
> = {
    '1xx': {
        bg: 'bg-primary-50',
        border: 'border-primary-200',
        text: 'text-primary-700',
        badge: 'bg-primary-100 text-primary-700',
        label: 'Informational',
    },
    '2xx': {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700',
        label: 'Success',
    },
    '3xx': {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        label: 'Redirection',
    },
    '4xx': {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700',
        label: 'Client Error',
    },
    '5xx': {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-700',
        label: 'Server Error',
    },
};

const QUICK_EXAMPLES = [
    'https://example.com',
    'http://github.com',
    'https://httpbin.org/status/404',
    'https://httpbin.org/status/500',
];

function formatHeaders(headers: StatusCheckResult['headers']) {
    return headers.map((header) => `${header.name}: ${header.value}`).join('\n');
}

export function HttpStatusCheckerTool() {
    const { state, setUrl, check, reset } = useHttpStatusChecker();
    const [inputValue, setInputValue] = useState('');
    const [copiedHeaders, setCopiedHeaders] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const result = state.result;
    const styles = result ? STATUS_CLASS_STYLES[result.statusClass] : null;
    const headersText = useMemo(() => formatHeaders(result?.headers ?? []), [result?.headers]);

    const handleInputChange = (value: string) => {
        setInputValue(value);
        setUrl(value);
    };

    const handleCheck = () => {
        setCopiedHeaders(false);
        check(inputValue);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCheck();
        }
    };

    const handleQuickExample = (url: string) => {
        setCopiedHeaders(false);
        setInputValue(url);
        setUrl(url);
        check(url);
    };

    const handleReset = () => {
        setInputValue('');
        setCopiedHeaders(false);
        reset();
        inputRef.current?.focus();
    };

    const handleCopyHeaders = async () => {
        if (!headersText) return;
        await navigator.clipboard.writeText(headersText);
        setCopiedHeaders(true);
        window.setTimeout(() => setCopiedHeaders(false), 1500);
    };

    const isLoading = state.status === 'loading';
    const hasResult = state.status === 'success' && state.result;
    const hasError = state.status === 'error';

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                <div className="p-6 md:p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">URL to Check</label>
                        <div className="relative flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Globe
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                                    weight="duotone"
                                />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. https://example.com"
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="w-full pl-10 pr-4 py-3 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400"
                                />
                            </div>
                            <Button
                                onClick={handleCheck}
                                disabled={isLoading || !inputValue.trim()}
                                className="gap-2 px-6 bg-primary-600 hover:bg-primary-700 text-white shrink-0"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Checking...
                                    </span>
                                ) : (
                                    <>
                                        <MagnifyingGlass className="w-4 h-4" weight="duotone" />
                                        Check
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Quick Examples
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_EXAMPLES.map((url) => (
                                <button
                                    key={url}
                                    type="button"
                                    onClick={() => handleQuickExample(url)}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-xs font-mono rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-all disabled:opacity-50"
                                >
                                    {url}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 md:p-8 space-y-6 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gray-100" />
                        <div className="space-y-3 flex-1">
                            <div className="h-5 bg-gray-100 rounded w-1/3" />
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                </div>
            )}

            {hasError && !isLoading && (
                <div className="bg-white rounded-2xl border border-red-200 shadow-soft p-6 md:p-8">
                    <div className="flex flex-col items-center gap-4 text-center py-4">
                        <Warning className="w-10 h-10 text-red-400" weight="duotone" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-red-700">Check Failed</p>
                            <p className="text-sm text-gray-500 max-w-md">{state.error}</p>
                        </div>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 hover:bg-gray-50"
                        >
                            <ArrowsClockwise className="w-3.5 h-3.5" weight="duotone" />
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {hasResult && result && styles && (
                <div className="space-y-4">
                    <div
                        className={cn(
                            'bg-white rounded-2xl border shadow-soft overflow-hidden',
                            styles.border
                        )}
                    >
                        <div className={cn('p-6 md:p-8', styles.bg)}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div
                                    className={cn(
                                        'flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center font-black text-3xl font-mono border',
                                        styles.bg,
                                        styles.text,
                                        styles.border
                                    )}
                                >
                                    {result.statusCode}
                                </div>

                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className={cn(
                                                'text-xs font-semibold px-2.5 py-1 rounded-full',
                                                styles.badge
                                            )}
                                        >
                                            {result.statusClass} - {styles.label}
                                        </span>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 text-gray-600 border border-gray-200">
                                            {result.checkedVia === 'browser'
                                                ? 'Browser fetch'
                                                : 'Public checker'}
                                        </span>
                                    </div>
                                    <h2 className={cn('text-2xl font-bold', styles.text)}>
                                        {result.statusCode} {result.statusText}
                                    </h2>
                                    <p className="text-sm text-gray-500 font-mono break-all">
                                        {result.url}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <FileText className="w-3.5 h-3.5 text-primary-500" weight="duotone" />
                                Content-Type
                            </div>
                            <p className="font-semibold text-gray-900 text-sm leading-snug font-mono break-all">
                                {result.contentType ?? '-'}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Clock className="w-3.5 h-3.5 text-primary-500" weight="duotone" />
                                Response Time
                            </div>
                            <p className="font-semibold text-gray-900 text-sm leading-snug font-mono">
                                {result.responseTime > 0 ? `${result.responseTime} ms` : '-'}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <ArrowSquareOut
                                    className="w-3.5 h-3.5 text-primary-500"
                                    weight="duotone"
                                />
                                Final URL
                            </div>
                            <p className="font-semibold text-gray-900 text-sm leading-snug font-mono break-all">
                                {result.finalUrl !== result.url ? (
                                    <span title="URL after redirects">{result.finalUrl}</span>
                                ) : (
                                    <span className="text-gray-500">No redirect</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {result.redirects.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                                <GitBranch className="w-4 h-4 text-primary-500" weight="duotone" />
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Redirect Chain
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {result.redirects.map((redirect, index) => (
                                    <div key={`${redirect.from}-${index}`} className="p-5 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                                {redirect.statusCode || '-'} {redirect.statusText}
                                            </span>
                                            {redirect.duration !== null && (
                                                <span className="text-xs text-gray-500 font-mono">
                                                    {redirect.duration} ms
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 font-mono break-all">
                                            {redirect.from}
                                        </p>
                                        {redirect.to && (
                                            <p className="text-xs text-gray-900 font-mono break-all">
                                                {redirect.to}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Response Headers
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {result.headers.length} header
                                    {result.headers.length === 1 ? '' : 's'} available
                                </p>
                            </div>
                            <Button
                                onClick={handleCopyHeaders}
                                disabled={!headersText}
                                variant="outline"
                                size="sm"
                                className="gap-2 border-gray-200 hover:bg-gray-50"
                            >
                                {copiedHeaders ? (
                                    <Check className="w-3.5 h-3.5" weight="duotone" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" weight="duotone" />
                                )}
                                {copiedHeaders ? 'Copied' : 'Copy'}
                            </Button>
                        </div>

                        {result.headerNote && (
                            <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800">
                                {result.headerNote}
                            </div>
                        )}

                        {result.headers.length > 0 ? (
                            <div className="max-h-96 overflow-auto">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-100">
                                        {result.headers.map((header, index) => (
                                            <tr key={`${header.name}-${index}`} className="align-top">
                                                <th className="w-44 px-5 py-3 text-left font-mono text-xs font-semibold text-gray-500 bg-gray-50">
                                                    {header.name}
                                                </th>
                                                <td className="px-5 py-3 font-mono text-xs text-gray-800 break-all">
                                                    {header.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-5 py-8 text-center text-sm text-gray-500">
                                No response headers were exposed for this check.
                            </div>
                        )}
                    </div>

                    {result.warnings.length > 0 && (
                        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-2">
                            {result.warnings.map((warning, index) => (
                                <div
                                    key={`${warning}-${index}`}
                                    className="flex items-start gap-2 text-sm text-amber-800"
                                >
                                    <Warning
                                        className="w-4 h-4 mt-0.5 shrink-0"
                                        weight="duotone"
                                    />
                                    <span>{warning}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 hover:bg-gray-50"
                        >
                            <ArrowsClockwise className="w-3.5 h-3.5" weight="duotone" />
                            Check Another URL
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
