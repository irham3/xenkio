'use client';

import {
    Download,
    Globe,
    Link2,
    ListTree,
    Plus,
    RotateCcw,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/shared';
import { useSitemapGenerator } from '../hooks/use-sitemap-generator';
import { CHANGE_FREQUENCIES, PRESETS } from '../lib/sitemap-utils';

export function SitemapGenerator() {
    const {
        config,
        output,
        bulkPaths,
        setBulkPaths,
        updateBaseUrl,
        addUrl,
        removeUrl,
        updateUrl,
        importPaths,
        applyPreset,
        resetConfig,
        downloadFile,
    } = useSitemapGenerator();

    return (
        <div className="w-full space-y-8">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    Quick Presets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => applyPreset(preset.paths)}
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
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary-500" />
                            Website Settings
                        </h3>

                        <div className="space-y-2 mb-6">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Base URL
                            </label>
                            <input
                                type="url"
                                value={config.baseUrl}
                                onChange={(e) => updateBaseUrl(e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Bulk Path Import
                                </label>
                                <Button
                                    onClick={importPaths}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 cursor-pointer"
                                >
                                    Import
                                </Button>
                            </div>
                            <textarea
                                value={bulkPaths}
                                onChange={(e) => setBulkPaths(e.target.value)}
                                className="w-full min-h-[90px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                                placeholder={'/\n/about\n/contact\n/blog/post-1'}
                            />
                            <p className="text-xs text-gray-400">
                                One path per line. You can also paste full URLs.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ListTree className="h-5 w-5 text-primary-500" />
                                URL Entries
                            </h3>
                            <Button
                                onClick={addUrl}
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 cursor-pointer"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add URL
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {config.urls.map((entry, index) => (
                                <div key={entry.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-primary-500 bg-primary-50 px-2 py-1 rounded-lg">
                                            URL {index + 1}
                                        </span>
                                        {config.urls.length > 1 && (
                                            <button
                                                onClick={() => removeUrl(entry.id)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                            <Link2 className="h-3 w-3" />
                                            URL Path or Full URL
                                        </label>
                                        <input
                                            type="text"
                                            value={entry.path}
                                            onChange={(e) => updateUrl(entry.id, 'path', e.target.value)}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            placeholder="/about"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Last Modified
                                            </label>
                                            <input
                                                type="date"
                                                value={entry.lastmod}
                                                onChange={(e) => updateUrl(entry.id, 'lastmod', e.target.value)}
                                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Change Freq
                                            </label>
                                            <select
                                                value={entry.changefreq}
                                                onChange={(e) => updateUrl(entry.id, 'changefreq', e.target.value as (typeof CHANGE_FREQUENCIES)[number])}
                                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer"
                                            >
                                                {CHANGE_FREQUENCIES.map((value) => (
                                                    <option key={value} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Priority (0-1)
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                value={entry.priority}
                                                onChange={(e) => updateUrl(entry.id, 'priority', Number(e.target.value))}
                                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Generated sitemap.xml
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

                        <div
                            role="region"
                            aria-label="Sitemap XML preview"
                            className="bg-gray-900 rounded-xl p-5 overflow-auto max-h-[60vh]"
                        >
                            <pre className="font-mono text-sm text-gray-100 whitespace-pre-wrap leading-relaxed select-all">
                                {output}
                            </pre>
                        </div>

                        <Button
                            onClick={downloadFile}
                            className={cn(
                                'w-full mt-4 h-12 rounded-xl font-bold text-base cursor-pointer',
                                'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all',
                            )}
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Download sitemap.xml
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
