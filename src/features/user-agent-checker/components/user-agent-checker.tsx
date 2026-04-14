'use client';

import { useState } from 'react';
import {
    Copy,
    Check,
    Monitor,
    Smartphone,
    Tablet,
    Bot,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Globe2,
    Cpu,
    Server,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserAgent } from '../hooks/use-user-agent';
import { getBrowserIcon, getOsIcon, getDeviceIcon } from '../lib/ua-parser';

interface InfoCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    emoji?: string;
}

function InfoCard({ icon, label, value, sub, emoji }: InfoCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {icon}
                {label}
            </div>
            <div className="flex items-start gap-2">
                {emoji && <span className="text-xl leading-none mt-0.5">{emoji}</span>}
                <div>
                    <p className="font-semibold text-gray-900 text-sm leading-snug">
                        {value || '—'}
                    </p>
                    {sub && (
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export function UserAgentChecker() {
    const { parsed, customUa, isCustomMode, detectFromBrowser, parseCustom } = useUserAgent();
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const handleCopy = () => {
        if (customUa) {
            navigator.clipboard.writeText(customUa);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCustomInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        parseCustom(e.target.value);
    };

    const deviceIcon = parsed?.isMobile ? (
        <Smartphone className="w-8 h-8 text-primary-500" />
    ) : parsed?.isTablet ? (
        <Tablet className="w-8 h-8 text-primary-500" />
    ) : parsed?.isBot ? (
        <Bot className="w-8 h-8 text-warning-500" />
    ) : parsed ? (
        <Monitor className="w-8 h-8 text-primary-500" />
    ) : (
        <Monitor className="w-8 h-8 text-gray-300" />
    );

    const getDeviceTypeColor = (): string => {
        if (!parsed) return 'bg-gray-100 text-gray-500';
        if (parsed.isBot) return 'bg-warning-50 text-warning-700 border-warning-200';
        if (parsed.isMobile) return 'bg-primary-50 text-primary-700 border-primary-200';
        if (parsed.isTablet) return 'bg-blue-50 text-blue-700 border-blue-200';
        return 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {/* Main Result Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                <div className="p-6 md:p-8">
                    {parsed ? (
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            {/* Device + Browser Summary */}
                            <div className="flex items-center gap-4 md:min-w-[200px]">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                    {deviceIcon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{getBrowserIcon(parsed.browser.name)}</span>
                                        <p className="font-bold text-gray-900 text-lg leading-tight">
                                            {parsed.browser.name}
                                        </p>
                                    </div>
                                    {parsed.browser.version && (
                                        <p className="text-sm text-gray-500">v{parsed.browser.version}</p>
                                    )}
                                    <div className={cn(
                                        'mt-2 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border',
                                        getDeviceTypeColor()
                                    )}>
                                        {getDeviceIcon(parsed.device.type)}
                                        {parsed.device.type}
                                    </div>
                                </div>
                            </div>

                            {/* OS + Details */}
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-1.5">
                                        <span>{getOsIcon(parsed.os.name)}</span>
                                        <span className="font-medium">{parsed.os.name}</span>
                                        {parsed.os.version && (
                                            <span className="text-gray-400">{parsed.os.version}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-1.5">
                                        <span>⚙️</span>
                                        <span className="font-medium">{parsed.engine.name}</span>
                                        {parsed.engine.version && (
                                            <span className="text-gray-400">{parsed.engine.version}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-1.5">
                                        <span>🔬</span>
                                        <span className="font-medium">{parsed.cpu.architecture}</span>
                                    </div>
                                </div>

                                {parsed.device.model && (
                                    <p className="text-sm text-gray-500">
                                        Model: <span className="text-gray-700 font-medium">{parsed.device.model}</span>
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    onClick={handleCopy}
                                    size="sm"
                                    className={cn(
                                        'gap-2 transition-all',
                                        copied
                                            ? 'bg-success-500 hover:bg-success-600 text-white'
                                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                                    )}
                                >
                                    {copied ? (
                                        <><Check className="w-4 h-4" /> Copied!</>
                                    ) : (
                                        <><Copy className="w-4 h-4" /> Copy UA</>
                                    )}
                                </Button>
                                {isCustomMode && (
                                    <Button
                                        onClick={detectFromBrowser}
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 border-gray-200 hover:bg-gray-50"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-8 text-gray-400">
                            <Monitor className="w-10 h-10" />
                            <p className="text-sm">Detecting your browser…</p>
                        </div>
                    )}
                </div>

                {/* Raw UA Toggle */}
                <div className="border-t border-gray-100">
                    <button
                        onClick={() => setShowRaw(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-3 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <span className="flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            Raw User Agent String
                        </span>
                        {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showRaw && (
                        <div className="px-6 pb-5">
                            <p className="font-mono text-xs text-gray-600 bg-gray-50 rounded-lg p-3 break-all leading-relaxed border border-gray-100 select-all">
                                {customUa || '—'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Cards */}
            {parsed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard
                        icon={<Globe2 className="w-3.5 h-3.5 text-primary-500" />}
                        label="Browser"
                        value={`${parsed.browser.name}${parsed.browser.majorVersion ? ` ${parsed.browser.majorVersion}` : ''}`}
                        sub={parsed.browser.version ? `Full version: ${parsed.browser.version}` : undefined}
                        emoji={getBrowserIcon(parsed.browser.name)}
                    />
                    <InfoCard
                        icon={<Monitor className="w-3.5 h-3.5 text-primary-500" />}
                        label="Operating System"
                        value={parsed.os.name}
                        sub={parsed.os.version ? `Version: ${parsed.os.version}` : undefined}
                        emoji={getOsIcon(parsed.os.name)}
                    />
                    <InfoCard
                        icon={<Smartphone className="w-3.5 h-3.5 text-primary-500" />}
                        label="Device Type"
                        value={parsed.device.type}
                        sub={parsed.device.model || parsed.device.brand || undefined}
                        emoji={getDeviceIcon(parsed.device.type)}
                    />
                    <InfoCard
                        icon={<Server className="w-3.5 h-3.5 text-primary-500" />}
                        label="Rendering Engine"
                        value={parsed.engine.name}
                        sub={parsed.engine.version ? `Version: ${parsed.engine.version}` : undefined}
                    />
                    <InfoCard
                        icon={<Cpu className="w-3.5 h-3.5 text-primary-500" />}
                        label="CPU Architecture"
                        value={parsed.cpu.architecture}
                    />
                    <InfoCard
                        icon={<Bot className="w-3.5 h-3.5 text-primary-500" />}
                        label="Bot / Crawler"
                        value={parsed.isBot ? 'Detected' : 'No'}
                        sub={parsed.isBot ? 'This looks like an automated agent' : undefined}
                    />
                </div>
            )}

            {/* Custom UA Input */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800">Test Any User Agent String</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Paste a user agent string below to parse and inspect it</p>
                </div>
                <div className="p-6 space-y-3">
                    <textarea
                        value={customUa}
                        onChange={handleCustomInput}
                        rows={3}
                        placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36…"
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                    />
                    <div className="flex gap-2">
                        <Button
                            onClick={detectFromBrowser}
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 hover:bg-gray-50"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Use My Browser
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
