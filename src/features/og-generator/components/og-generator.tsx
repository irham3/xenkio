'use client';

import { Download, Globe, Image as ImageIcon, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared';
import { cn } from '@/lib/utils';
import { useOpenGraphGenerator } from '../hooks/use-og-generator';
import { OG_TYPES, PRESETS, TWITTER_CARD_TYPES } from '../lib/og-utils';

export function OpenGraphGenerator() {
    const {
        config,
        output,
        updateField,
        applyPreset,
        resetConfig,
        downloadFile,
    } = useOpenGraphGenerator();

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
                            onClick={() => applyPreset(preset.config)}
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
                <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-5">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary-500" />
                        Open Graph Settings
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            value={config.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="Your page title"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</label>
                        <textarea
                            value={config.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="w-full min-h-[86px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                            placeholder="Short description for social preview"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="h-3 w-3" />
                            URL
                        </label>
                        <input
                            type="url"
                            value={config.url}
                            onChange={(e) => updateField('url', e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="https://example.com/page"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="h-3 w-3" />
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={config.image}
                            onChange={(e) => updateField('image', e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="https://example.com/og-image.jpg"
                        />
                        <p className="text-xs text-gray-400">Recommended: 1200×630px</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Image Alt Text</label>
                        <input
                            type="text"
                            value={config.imageAlt}
                            onChange={(e) => updateField('imageAlt', e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="Describe the preview image"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">OG Type</label>
                            <select
                                value={config.type}
                                onChange={(e) => updateField('type', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer"
                            >
                                {OG_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Site Name</label>
                            <input
                                type="text"
                                value={config.siteName}
                                onChange={(e) => updateField('siteName', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="Your brand name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Locale</label>
                            <input
                                type="text"
                                value={config.locale}
                                onChange={(e) => updateField('locale', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="en_US"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Twitter Card</label>
                            <select
                                value={config.twitterCard}
                                onChange={(e) => updateField('twitterCard', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer"
                            >
                                {TWITTER_CARD_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">@site</label>
                            <input
                                type="text"
                                value={config.twitterSite}
                                onChange={(e) => updateField('twitterSite', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="@yoursite"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">@creator</label>
                            <input
                                type="text"
                                value={config.twitterCreator}
                                onChange={(e) => updateField('twitterCreator', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="@creator"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 sticky top-24">
                        <div className="flex items-center justify-between mb-6 gap-2">
                            <h3 className="text-lg font-bold text-gray-900">Generated OG Tags</h3>
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
                                <CopyButton value={output} label="Copy" className="rounded-xl" />
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-5 overflow-auto max-h-[60vh]">
                            <pre className="font-mono text-sm text-gray-100 whitespace-pre-wrap leading-relaxed select-all">
                                {output || '<!-- Fill in the fields to generate Open Graph tags -->'}
                            </pre>
                        </div>

                        <Button
                            onClick={downloadFile}
                            disabled={!output}
                            className={cn(
                                'w-full mt-4 h-12 rounded-xl font-bold text-base cursor-pointer',
                                'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all',
                            )}
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Download open-graph-tags.html
                        </Button>

                        <div className="mt-6 p-4 rounded-xl bg-primary-50/30 border border-primary-200">
                            <p className="text-xs text-primary-700 leading-relaxed">
                                <strong>Tip:</strong> Paste this output in the{' '}
                                <code className="bg-primary-100 px-1.5 py-0.5 rounded text-primary-800 font-mono">&lt;head&gt;</code>{' '}
                                of your website. It improves how links appear on social media and messaging apps.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
