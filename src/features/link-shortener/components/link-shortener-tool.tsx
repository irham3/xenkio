'use client';

import { Link2, RotateCcw, Scissors, Trash2, ExternalLink, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared';
import { cn } from '@/lib/utils';
import { PROVIDERS } from '../lib/link-shortener-utils';
import { useLinkShortener } from '../hooks/use-link-shortener';

function formatDate(ts: number): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(ts));
}

function truncate(str: string, max: number): string {
    return str.length > max ? `${str.slice(0, max)}…` : str;
}

export function LinkShortenerTool() {
    const {
        state,
        setUrl,
        setAlias,
        shorten,
        resetForm,
        deleteHistory,
        clearHistory,
    } = useLinkShortener();

    const isLoading = state.status === 'loading';

    return (
        <div className="space-y-8">
            {/* Main Input Card */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-primary-500" />
                    Shorten a URL
                </h2>

                {/* URL Input */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Long URL <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={state.url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') shorten(); }}
                            disabled={isLoading}
                            className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all disabled:opacity-50"
                            placeholder="https://your-very-long-url.com/path?query=value"
                        />
                    </div>
                </div>

                {/* Provider + Alias row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Provider
                        </label>
                        <div className="h-10 rounded-xl border border-primary-200 bg-primary-50/60 px-3 flex items-center text-sm font-semibold text-primary-700">
                            v.gd
                        </div>
                        <p className="text-xs text-gray-400">
                            {PROVIDERS[state.provider].supportsAlias ? 'Custom aliases supported' : 'No custom alias support'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Custom Alias <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex items-center h-10 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all">
                            <span className="px-3 text-xs text-gray-400 font-mono shrink-0">
                                v.gd/
                            </span>
                            <input
                                type="text"
                                value={state.alias}
                                onChange={(e) => setAlias(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 h-full bg-transparent text-sm font-mono focus:outline-none pr-3 disabled:opacity-50"
                                placeholder="my-alias"
                                maxLength={30}
                            />
                        </div>
                        <p className="text-xs text-gray-400">4–30 chars: letters, numbers, -, _</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        onClick={shorten}
                        disabled={isLoading || !state.url.trim()}
                        className={cn(
                            'h-11 px-6 rounded-xl font-bold text-sm cursor-pointer flex-1 sm:flex-none',
                            'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Scissors className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? 'Shortening…' : 'Shorten URL'}
                    </Button>
                    <Button
                        onClick={resetForm}
                        variant="outline"
                        disabled={isLoading}
                        className="h-11 rounded-xl border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Error */}
                {state.status === 'error' && state.error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{state.error}</p>
                    </div>
                )}

                {/* Success Result */}
                {state.status === 'success' && state.result && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-3">
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-semibold">URL shortened successfully!</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-green-200 px-3 py-2">
                            <Link2 className="h-4 w-4 text-green-600 shrink-0" />
                            <a
                                href={state.result}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm font-mono font-semibold text-green-700 hover:underline truncate"
                            >
                                {state.result}
                            </a>
                            <CopyButton value={state.result} label="Copy" className="rounded-lg shrink-0" />
                        </div>
                    </div>
                )}
            </div>

            {/* History */}
            {state.history.length > 0 && (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary-500" />
                            History
                            <span className="text-sm font-normal text-gray-400">({state.history.length})</span>
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearHistory}
                            className="rounded-xl border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 cursor-pointer transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Clear All
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {state.history.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <a
                                            href={item.shortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-semibold font-mono text-primary-600 hover:underline"
                                        >
                                            {item.shortUrl}
                                        </a>
                                        <ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-gray-400 transition-colors" />
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">
                                        {truncate(item.originalUrl, 70)}
                                    </p>
                                    <p className="text-xs text-gray-300">{formatDate(item.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <CopyButton
                                        value={item.shortUrl}
                                        label="Copy"
                                        showText={false}
                                        size="icon"
                                        className="rounded-lg opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => deleteHistory(item.id)}
                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                        aria-label="Delete from history"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
                    <h3 className="text-sm font-bold text-gray-900">v.gd</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        A free and reliable URL shortener with custom alias support.
                        Links are fast to create and easy to share.
                    </p>
                </div>
            </div>
        </div>
    );
}
