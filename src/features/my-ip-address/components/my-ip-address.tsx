'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, MapPin, Globe2, Clock, Building2, Network, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMyIp } from '../hooks/use-my-ip';
import { parseOrg, getCountryFlag, formatCoords } from '../lib/ip-utils';

export function MyIpAddress() {
    const { state, refresh } = useMyIp();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (state.info?.ip) {
            navigator.clipboard.writeText(state.info.ip);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const { asn, isp } = parseOrg(state.info?.org);
    const flag = getCountryFlag(state.info?.country);
    const coords = formatCoords(state.info?.loc);

    const location = [state.info?.city, state.info?.region, flag ? `${flag} ${state.info?.country}` : state.info?.country]
        .filter(Boolean)
        .join(', ');

    const isLoading = state.status === 'loading';
    const isError = state.status === 'error';

    return (
        <div className="space-y-6">
            {/* Main IP Display Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                            <Network className="w-4 h-4 text-primary-500" />
                            Your Public IP Address
                        </div>

                        {isLoading ? (
                            <div className="space-y-3 w-full max-w-md">
                                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                                <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-3/4 mx-auto" />
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center gap-3 py-4 text-gray-500">
                                <AlertTriangle className="w-10 h-10 text-error-400" />
                                <p className="text-sm font-medium text-error-600">Could not detect your IP address</p>
                                <p className="text-xs text-gray-400 max-w-sm">{state.error}</p>
                                <Button
                                    onClick={refresh}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 mt-2 border-gray-200 hover:bg-gray-50"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="relative group">
                                    <p className="text-4xl md:text-5xl font-black font-mono tracking-tight text-gray-900 select-all">
                                        {state.info?.ip}
                                    </p>
                                </div>

                                {location && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                        {location}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleCopy}
                                        className={cn(
                                            'gap-2 transition-all',
                                            copied
                                                ? 'bg-success-500 hover:bg-success-600 text-white border-success-500'
                                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                                        )}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy IP
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={refresh}
                                        variant="outline"
                                        className="gap-2 border-gray-200 hover:bg-gray-50"
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                                        Refresh
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Cards */}
            {state.status === 'success' && state.info && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Location */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <MapPin className="w-3.5 h-3.5 text-primary-500" />
                            Location
                        </div>
                        <p className="font-semibold text-gray-900 text-sm leading-snug">
                            {state.info.city || '—'}
                            {state.info.region && `, ${state.info.region}`}
                        </p>
                        {state.info.country && (
                            <p className="text-sm text-gray-500">
                                {flag && <span className="mr-1">{flag}</span>}
                                {state.info.country}
                                {state.info.postal && ` · ${state.info.postal}`}
                            </p>
                        )}
                        {coords && (
                            <p className="text-xs text-gray-400 font-mono">{coords}</p>
                        )}
                    </div>

                    {/* ISP / Organization */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <Building2 className="w-3.5 h-3.5 text-primary-500" />
                            ISP / Organization
                        </div>
                        <p className="font-semibold text-gray-900 text-sm leading-snug">
                            {isp || state.info.org || '—'}
                        </p>
                        {asn && (
                            <p className="text-xs text-gray-400 font-mono">{asn}</p>
                        )}
                    </div>

                    {/* Hostname */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <Globe2 className="w-3.5 h-3.5 text-primary-500" />
                            Hostname
                        </div>
                        <p className="font-semibold text-gray-900 text-sm leading-snug break-all">
                            {state.info.hostname || '—'}
                        </p>
                    </div>

                    {/* Timezone */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <Clock className="w-3.5 h-3.5 text-primary-500" />
                            Timezone
                        </div>
                        <p className="font-semibold text-gray-900 text-sm leading-snug">
                            {state.info.timezone || '—'}
                        </p>
                    </div>
                </div>
            )}

            {/* Skeleton Grid when loading */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-sm">
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                            <div className="h-5 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
