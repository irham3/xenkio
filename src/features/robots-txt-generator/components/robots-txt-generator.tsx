'use client';

import { useState } from 'react';
import {
    Bot,
    Plus,
    Trash2,
    Download,
    RotateCcw,
    Sparkles,
    Globe,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/shared';
import { useRobotsTxtGenerator } from '../hooks/use-robots-txt-generator';
import { PRESETS, COMMON_USER_AGENTS, COMMON_PATHS } from '../lib/robots-txt-utils';

export function RobotsTxtGenerator() {
    const {
        config,
        output,
        addRule,
        removeRule,
        updateRule,
        addPathToRule,
        updatePathInRule,
        removePathFromRule,
        addSitemap,
        updateSitemap,
        removeSitemap,
        setHost,
        applyPreset,
        resetConfig,
        downloadFile,
    } = useRobotsTxtGenerator();

    const [expandedRules, setExpandedRules] = useState<Set<string>>(
        new Set(config.rules.map(r => r.id))
    );
    const [showAdvanced, setShowAdvanced] = useState(false);

    const toggleRule = (id: string) => {
        setExpandedRules(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleApplyPreset = (presetConfig: typeof config) => {
        const newIds = applyPreset(presetConfig);
        setExpandedRules(new Set(newIds));
    };

    const handleAddRule = () => {
        const newId = addRule();
        setExpandedRules(prev => {
            const next = new Set(prev);
            next.add(newId);
            return next;
        });
    };

    return (
        <div className="w-full space-y-8">
            {/* Presets */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    Quick Presets
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => handleApplyPreset(preset.config)}
                            className="p-3 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer text-left group"
                        >
                            <span className="text-sm font-bold text-gray-900 block group-hover:text-primary-600 transition-colors">
                                {preset.label}
                            </span>
                            <span className="text-xs text-gray-400 mt-1 block leading-snug">
                                {preset.description}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    {/* Rules */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary-500" />
                                User-Agent Rules
                            </h3>
                            <Button
                                onClick={handleAddRule}
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 cursor-pointer"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Rule
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {config.rules.map((rule) => (
                                    <motion.div
                                        key={rule.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border border-gray-200 rounded-xl overflow-hidden"
                                    >
                                        {/* Rule header */}
                                        <div
                                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleRule(rule.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-primary-500 bg-primary-50 px-2 py-1 rounded-lg">
                                                    UA
                                                </span>
                                                <span className="font-bold text-sm text-gray-900 font-mono">
                                                    {rule.userAgent || '*'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {config.rules.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeRule(rule.id);
                                                        }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                {expandedRules.has(rule.id) ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Rule body */}
                                        {expandedRules.has(rule.id) && (
                                            <div className="p-4 space-y-5">
                                                {/* User Agent */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        User-Agent
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={rule.userAgent}
                                                            onChange={(e) => updateRule(rule.id, { userAgent: e.target.value })}
                                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                                            placeholder="e.g. Googlebot"
                                                            list={`ua-list-${rule.id}`}
                                                        />
                                                        <datalist id={`ua-list-${rule.id}`}>
                                                            {COMMON_USER_AGENTS.map((ua) => (
                                                                <option key={ua} value={ua} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                </div>

                                                {/* Disallow paths */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                                                            Disallow
                                                        </label>
                                                        <button
                                                            onClick={() => addPathToRule(rule.id, 'disallow')}
                                                            className="text-xs font-medium text-gray-400 hover:text-primary-500 transition-colors cursor-pointer flex items-center gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add
                                                        </button>
                                                    </div>
                                                    {rule.disallow.length === 0 ? (
                                                        <p className="text-xs text-gray-400 italic py-2">
                                                            No disallow paths — everything is accessible
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {rule.disallow.map((path, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={path}
                                                                        onChange={(e) => updatePathInRule(rule.id, 'disallow', idx, e.target.value)}
                                                                        className="flex-1 h-9 px-3 bg-red-50/50 border border-red-100 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
                                                                        placeholder="/path/"
                                                                        list={`path-list-${rule.id}-d-${idx}`}
                                                                    />
                                                                    <datalist id={`path-list-${rule.id}-d-${idx}`}>
                                                                        {COMMON_PATHS.map((p) => (
                                                                            <option key={p} value={p} />
                                                                        ))}
                                                                    </datalist>
                                                                    <button
                                                                        onClick={() => removePathFromRule(rule.id, 'disallow', idx)}
                                                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Allow paths */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                                                            Allow
                                                        </label>
                                                        <button
                                                            onClick={() => addPathToRule(rule.id, 'allow')}
                                                            className="text-xs font-medium text-gray-400 hover:text-primary-500 transition-colors cursor-pointer flex items-center gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add
                                                        </button>
                                                    </div>
                                                    {rule.allow.length === 0 ? (
                                                        <p className="text-xs text-gray-400 italic py-2">
                                                            No allow paths specified
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {rule.allow.map((path, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={path}
                                                                        onChange={(e) => updatePathInRule(rule.id, 'allow', idx, e.target.value)}
                                                                        className="flex-1 h-9 px-3 bg-green-50/50 border border-green-100 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 transition-all"
                                                                        placeholder="/path/"
                                                                        list={`path-list-${rule.id}-a-${idx}`}
                                                                    />
                                                                    <datalist id={`path-list-${rule.id}-a-${idx}`}>
                                                                        {COMMON_PATHS.map((p) => (
                                                                            <option key={p} value={p} />
                                                                        ))}
                                                                    </datalist>
                                                                    <button
                                                                        onClick={() => removePathFromRule(rule.id, 'allow', idx)}
                                                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Crawl Delay */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Crawl Delay (seconds)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={rule.crawlDelay ?? ''}
                                                        onChange={(e) => updateRule(rule.id, {
                                                            crawlDelay: e.target.value ? parseInt(e.target.value, 10) : undefined,
                                                        })}
                                                        className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                                        placeholder="Optional"
                                                        min={0}
                                                        max={120}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sitemaps */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary-500" />
                                Sitemaps
                            </h3>
                            <Button
                                onClick={addSitemap}
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 cursor-pointer"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </div>
                        {config.sitemaps.length === 0 ? (
                            <p className="text-sm text-gray-400 italic py-4 text-center">
                                No sitemaps added. Click &quot;Add&quot; to include a sitemap URL.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {config.sitemaps.map((sitemap, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="url"
                                            value={sitemap}
                                            onChange={(e) => updateSitemap(idx, e.target.value)}
                                            className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            placeholder="https://example.com/sitemap.xml"
                                        />
                                        <button
                                            onClick={() => removeSitemap(idx)}
                                            className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Advanced Options */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary-500" />
                                Advanced Options
                            </h3>
                            {showAdvanced ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                        {showAdvanced && (
                            <div className="px-6 pb-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Host (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.host ?? ''}
                                        onChange={(e) => setHost(e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="https://example.com"
                                    />
                                    <p className="text-xs text-gray-400">
                                        The preferred domain for your site (used by Yandex).
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Output Panel */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Generated robots.txt
                            </h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={resetConfig}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Reset
                                </Button>
                                <CopyButton
                                    value={output}
                                    label="Copy"
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Output preview */}
                        <div className="bg-gray-900 rounded-xl p-5 overflow-auto max-h-[60vh]">
                            <pre className="font-mono text-sm text-gray-100 whitespace-pre-wrap leading-relaxed select-all">
                                {output}
                            </pre>
                        </div>

                        {/* Download button */}
                        <Button
                            onClick={downloadFile}
                            className={cn(
                                "w-full mt-4 h-12 rounded-xl font-bold text-base cursor-pointer",
                                "bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                            )}
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Download robots.txt
                        </Button>

                        {/* Info */}
                        <div className="mt-6 p-4 rounded-xl bg-primary-50/30 border border-primary-200">
                            <p className="text-xs text-primary-700 leading-relaxed">
                                <strong>Tip:</strong> Place the robots.txt file in the root directory of your website
                                (e.g., <code className="bg-primary-100 px-1.5 py-0.5 rounded text-primary-800 font-mono">https://example.com/robots.txt</code>).
                                Search engines check this file before crawling your site.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
