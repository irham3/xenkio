'use client';

import { useState } from 'react';
import {
    Download,
    RotateCcw,
    Sparkles,
    Globe,
    Share2,
    ChevronDown,
    ChevronUp,
    Search,
    Type,
    FileText,
    Image as ImageIcon,
    AtSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/shared';
import { useMetaTagGenerator } from '../hooks/use-meta-tag-generator';
import {
    PRESETS,
    ROBOTS_OPTIONS,
    OG_TYPES,
    TWITTER_CARD_TYPES,
    LANGUAGES,
    getTitleCharCount,
    getDescriptionCharCount,
    getTitleStatusLabel,
    getDescriptionStatusLabel,
} from '../lib/meta-tag-utils';

function CharCounter({ count, status, label }: { count: number; status: 'good' | 'warning' | 'danger'; label: string }) {
    if (count === 0) return null;
    const colors = {
        good: 'text-green-600 bg-green-50',
        warning: 'text-amber-600 bg-amber-50',
        danger: 'text-red-600 bg-red-50',
    };
    return (
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md', colors[status])}>
            {count} chars — {label}
        </span>
    );
}

export function MetaTagGenerator() {
    const {
        config,
        output,
        updateField,
        applyPreset,
        resetConfig,
        downloadFile,
    } = useMetaTagGenerator();

    const [showOg, setShowOg] = useState(true);
    const [showTwitter, setShowTwitter] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const titleInfo = getTitleCharCount(config.title);
    const descInfo = getDescriptionCharCount(config.description);

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
                {/* Configuration Panel */}
                <div className="space-y-6">
                    {/* Basic SEO */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary-500" />
                            Basic SEO
                        </h3>
                        <div className="space-y-5">
                            {/* Title */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <Type className="h-3 w-3" />
                                        Page Title
                                    </label>
                                    <CharCounter
                                        count={titleInfo.count}
                                        status={titleInfo.status}
                                        label={getTitleStatusLabel(titleInfo.count)}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={config.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    placeholder="My Awesome Website — Best Tools Online"
                                />
                                <p className="text-xs text-gray-400">Recommended: 30–60 characters</p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="h-3 w-3" />
                                        Meta Description
                                    </label>
                                    <CharCounter
                                        count={descInfo.count}
                                        status={descInfo.status}
                                        label={getDescriptionStatusLabel(descInfo.count)}
                                    />
                                </div>
                                <textarea
                                    value={config.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className="w-full min-h-[80px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                                    placeholder="A brief description of your page content for search engines..."
                                />
                                <p className="text-xs text-gray-400">Recommended: 120–160 characters</p>
                            </div>

                            {/* Keywords */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Keywords
                                </label>
                                <input
                                    type="text"
                                    value={config.keywords}
                                    onChange={(e) => updateField('keywords', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>

                            {/* Author */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <AtSign className="h-3 w-3" />
                                    Author
                                </label>
                                <input
                                    type="text"
                                    value={config.author}
                                    onChange={(e) => updateField('author', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Canonical URL */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe className="h-3 w-3" />
                                    Canonical URL
                                </label>
                                <input
                                    type="url"
                                    value={config.canonical}
                                    onChange={(e) => updateField('canonical', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    placeholder="https://example.com/page"
                                />
                            </div>

                            {/* Robots */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Robots Directive
                                </label>
                                <select
                                    value={config.robots}
                                    onChange={(e) => updateField('robots', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer"
                                >
                                    {ROBOTS_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Open Graph */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setShowOg(!showOg)}
                            className="w-full flex items-center justify-between p-6 md:px-8 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Share2 className="h-5 w-5 text-primary-500" />
                                Open Graph (Facebook, LinkedIn)
                            </h3>
                            {showOg ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                        {showOg && (
                            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">OG Title</label>
                                    <input
                                        type="text"
                                        value={config.ogTitle}
                                        onChange={(e) => updateField('ogTitle', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder={config.title || 'Falls back to page title'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">OG Description</label>
                                    <textarea
                                        value={config.ogDescription}
                                        onChange={(e) => updateField('ogDescription', e.target.value)}
                                        className="w-full min-h-[60px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                                        placeholder={config.description || 'Falls back to meta description'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <ImageIcon className="h-3 w-3" />
                                        OG Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={config.ogImage}
                                        onChange={(e) => updateField('ogImage', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="https://example.com/og-image.jpg"
                                    />
                                    <p className="text-xs text-gray-400">Recommended: 1200×630px</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">OG URL</label>
                                    <input
                                        type="url"
                                        value={config.ogUrl}
                                        onChange={(e) => updateField('ogUrl', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder={config.canonical || 'Falls back to canonical URL'}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">OG Type</label>
                                        <select
                                            value={config.ogType}
                                            onChange={(e) => updateField('ogType', e.target.value)}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer"
                                        >
                                            {OG_TYPES.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Site Name</label>
                                        <input
                                            type="text"
                                            value={config.ogSiteName}
                                            onChange={(e) => updateField('ogSiteName', e.target.value)}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            placeholder="My Website"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Twitter Card */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setShowTwitter(!showTwitter)}
                            className="w-full flex items-center justify-between p-6 md:px-8 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <svg className="h-5 w-5 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                Twitter Card (X)
                            </h3>
                            {showTwitter ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                        {showTwitter && (
                            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Card Type</label>
                                    <select
                                        value={config.twitterCard}
                                        onChange={(e) => updateField('twitterCard', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer"
                                    >
                                        {TWITTER_CARD_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">@Site</label>
                                        <input
                                            type="text"
                                            value={config.twitterSite}
                                            onChange={(e) => updateField('twitterSite', e.target.value)}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            placeholder="@yoursite"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">@Creator</label>
                                        <input
                                            type="text"
                                            value={config.twitterCreator}
                                            onChange={(e) => updateField('twitterCreator', e.target.value)}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            placeholder="@creator"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Twitter Title</label>
                                    <input
                                        type="text"
                                        value={config.twitterTitle}
                                        onChange={(e) => updateField('twitterTitle', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder={config.ogTitle || config.title || 'Falls back to OG/page title'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Twitter Description</label>
                                    <textarea
                                        value={config.twitterDescription}
                                        onChange={(e) => updateField('twitterDescription', e.target.value)}
                                        className="w-full min-h-[60px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                                        placeholder={config.ogDescription || config.description || 'Falls back to OG/meta description'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Twitter Image URL</label>
                                    <input
                                        type="url"
                                        value={config.twitterImage}
                                        onChange={(e) => updateField('twitterImage', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder={config.ogImage || 'Falls back to OG image'}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Advanced Options */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between p-6 md:px-8 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary-500" />
                                Advanced Options
                            </h3>
                            {showAdvanced ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                        {showAdvanced && (
                            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Charset</label>
                                        <input
                                            type="text"
                                            value={config.charset}
                                            onChange={(e) => updateField('charset', e.target.value)}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            placeholder="UTF-8"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Language</label>
                                        <select
                                            value={config.language}
                                            onChange={(e) => updateField('language', e.target.value)}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer"
                                        >
                                            {LANGUAGES.map((lang) => (
                                                <option key={lang.value} value={lang.value}>{lang.label} ({lang.value})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Viewport</label>
                                    <input
                                        type="text"
                                        value={config.viewport}
                                        onChange={(e) => updateField('viewport', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="width=device-width, initial-scale=1.0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Theme Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={config.themeColor || '#ffffff'}
                                            onChange={(e) => updateField('themeColor', e.target.value)}
                                            className="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                                        />
                                        <input
                                            type="text"
                                            value={config.themeColor}
                                            onChange={(e) => updateField('themeColor', e.target.value)}
                                            className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                            placeholder="#ffffff"
                                        />
                                    </div>
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
                                Generated Meta Tags
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
                                {output || '<!-- Fill in the fields to generate meta tags -->'}
                            </pre>
                        </div>

                        {/* Download button */}
                        <Button
                            onClick={downloadFile}
                            disabled={!output}
                            className={cn(
                                "w-full mt-4 h-12 rounded-xl font-bold text-base cursor-pointer",
                                "bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                            )}
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Download meta-tags.html
                        </Button>

                        {/* Google Preview */}
                        {(config.title || config.description) && (
                            <div className="mt-6">
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                                    Google Search Preview
                                </h4>
                                <div className="p-4 rounded-xl bg-white border border-gray-200">
                                    <p className="text-blue-700 text-lg font-medium leading-snug truncate">
                                        {config.title || 'Page Title'}
                                    </p>
                                    <p className="text-green-700 text-xs font-mono mt-1 truncate">
                                        {config.canonical || 'https://example.com/page'}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                                        {config.description || 'Page description will appear here...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <div className="mt-6 p-4 rounded-xl bg-primary-50/30 border border-primary-200">
                            <p className="text-xs text-primary-700 leading-relaxed">
                                <strong>Tip:</strong> Place these meta tags inside the{' '}
                                <code className="bg-primary-100 px-1.5 py-0.5 rounded text-primary-800 font-mono">&lt;head&gt;</code>{' '}
                                section of your HTML document. Open Graph and Twitter Card tags help your content look great when shared on social media.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
