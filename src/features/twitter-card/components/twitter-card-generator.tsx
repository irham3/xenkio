'use client';

import { Download, Globe, Image as ImageIcon, RotateCcw, Sparkles, Twitter, User, Play, Smartphone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared';
import { cn } from '@/lib/utils';
import { useTwitterCardGenerator } from '../hooks/use-twitter-card';
import { CARD_TYPES, PRESETS, getCharacterCount } from '../lib/twitter-card-utils';

function CharCount({ value, max }: { value: string; max: number }) {
    const { count, isOver } = getCharacterCount(value, max);
    return (
        <span className={cn('text-xs tabular-nums', isOver ? 'text-error-500 font-semibold' : 'text-gray-400')}>
            {count}/{max}
        </span>
    );
}

function CardPreview({ config }: { config: { cardType: string; title: string; description: string; image: string; siteUsername: string } }) {
    const isLargeImage = config.cardType === 'summary_large_image';
    const isPlayer = config.cardType === 'player';
    const isApp = config.cardType === 'app';

    const displayTitle = config.title || 'Your Page Title';
    const displayDescription = config.description || 'Your page description will appear here.';
    const displaySite = config.siteUsername || 'yoursite.com';

    if (isApp) {
        return (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                <div className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="h-7 w-7 text-gray-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayTitle}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{displayDescription}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            View on App Store
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLargeImage || isPlayer) {
        return (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                <div className="aspect-[2/1] bg-gray-100 relative flex items-center justify-center">
                    {config.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={config.image} alt="Card preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                            {isPlayer ? <Play className="h-10 w-10" /> : <ImageIcon className="h-10 w-10" />}
                            <span className="text-xs">{isPlayer ? 'Player preview' : '1200 x 600'}</span>
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{displayTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{displayDescription}</p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {displaySite}
                    </p>
                </div>
            </div>
        );
    }

    // Summary card
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white flex">
            <div className="w-[125px] h-[125px] bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {config.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={config.image} alt="Card preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                )}
            </div>
            <div className="p-3 min-w-0 flex-1 flex flex-col justify-center">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayTitle}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{displayDescription}</p>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {displaySite}
                </p>
            </div>
        </div>
    );
}

export function TwitterCardGenerator() {
    const {
        config,
        output,
        updateField,
        applyPreset,
        resetConfig,
        downloadFile,
    } = useTwitterCardGenerator();

    return (
        <div className="w-full space-y-8">
            {/* Presets */}
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
                {/* Settings Panel */}
                <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-5">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Twitter className="h-5 w-5 text-primary-500" />
                        Card Settings
                    </h3>

                    {/* Card Type */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Card Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CARD_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => updateField('cardType', type.value)}
                                    className={cn(
                                        'p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer',
                                        config.cardType === type.value
                                            ? 'border-primary-400 bg-primary-50/50'
                                            : 'border-gray-100 hover:border-gray-200'
                                    )}
                                >
                                    <span className={cn(
                                        'text-xs font-bold block',
                                        config.cardType === type.value ? 'text-primary-700' : 'text-gray-700'
                                    )}>
                                        {type.label}
                                    </span>
                                    <span className="text-[10px] text-gray-400 block mt-0.5">{type.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</label>
                            <CharCount value={config.title} max={70} />
                        </div>
                        <input
                            type="text"
                            value={config.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="Your page title"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</label>
                            <CharCount value={config.description} max={200} />
                        </div>
                        <textarea
                            value={config.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="w-full min-h-[86px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                            placeholder="Short description for your Twitter card"
                        />
                    </div>

                    {/* Username fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                @site
                            </label>
                            <input
                                type="text"
                                value={config.siteUsername}
                                onChange={(e) => updateField('siteUsername', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="@yoursite"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                @creator
                            </label>
                            <input
                                type="text"
                                value={config.creatorUsername}
                                onChange={(e) => updateField('creatorUsername', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="@creator"
                            />
                        </div>
                    </div>

                    {/* Image fields (for summary, summary_large_image, player) */}
                    {config.cardType !== 'app' && (
                        <>
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
                                    placeholder="https://example.com/card-image.jpg"
                                />
                                <p className="text-xs text-gray-400">
                                    {config.cardType === 'summary' ? 'Recommended: 144x144px (min 144x144)' : 'Recommended: 1200x600px (min 300x157)'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Image Alt Text</label>
                                <input
                                    type="text"
                                    value={config.imageAlt}
                                    onChange={(e) => updateField('imageAlt', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    placeholder="Describe the card image"
                                />
                            </div>
                        </>
                    )}

                    {/* Player-specific fields */}
                    {config.cardType === 'player' && (
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                                <Play className="h-3 w-3" />
                                Player Settings
                            </h4>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Player URL (HTTPS iframe)</label>
                                <input
                                    type="url"
                                    value={config.playerUrl}
                                    onChange={(e) => updateField('playerUrl', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    placeholder="https://example.com/player"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Width (px)</label>
                                    <input
                                        type="text"
                                        value={config.playerWidth}
                                        onChange={(e) => updateField('playerWidth', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="480"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Height (px)</label>
                                    <input
                                        type="text"
                                        value={config.playerHeight}
                                        onChange={(e) => updateField('playerHeight', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="270"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* App-specific fields */}
                    {config.cardType === 'app' && (
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                                <Smartphone className="h-3 w-3" />
                                App Store Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">iPhone App Name</label>
                                    <input
                                        type="text"
                                        value={config.appNameIphone}
                                        onChange={(e) => updateField('appNameIphone', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="App Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">iPhone App ID</label>
                                    <input
                                        type="text"
                                        value={config.appIdIphone}
                                        onChange={(e) => updateField('appIdIphone', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="123456789"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">iPad App Name</label>
                                    <input
                                        type="text"
                                        value={config.appNameIpad}
                                        onChange={(e) => updateField('appNameIpad', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="App Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">iPad App ID</label>
                                    <input
                                        type="text"
                                        value={config.appIdIpad}
                                        onChange={(e) => updateField('appIdIpad', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="123456789"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Google Play App Name</label>
                                    <input
                                        type="text"
                                        value={config.appNameGooglePlay}
                                        onChange={(e) => updateField('appNameGooglePlay', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="App Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Google Play App ID</label>
                                    <input
                                        type="text"
                                        value={config.appIdGooglePlay}
                                        onChange={(e) => updateField('appIdGooglePlay', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="com.example.app"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Output + Preview Panel */}
                <div className="space-y-6">
                    {/* Live Preview */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-primary-500" />
                            Live Preview
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <CardPreview config={config} />
                        </div>
                        <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
                            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>This is an approximation. Actual appearance may vary on Twitter/X.</span>
                        </div>
                    </div>

                    {/* Generated Code */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 sticky top-24">
                        <div className="flex items-center justify-between mb-6 gap-2">
                            <h3 className="text-lg font-bold text-gray-900">Generated Tags</h3>
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
                                {output || '<!-- Fill in the fields to generate Twitter Card tags -->'}
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
                            Download twitter-card-tags.html
                        </Button>

                        <div className="mt-6 p-4 rounded-xl bg-primary-50/30 border border-primary-200">
                            <p className="text-xs text-primary-700 leading-relaxed">
                                <strong>Tip:</strong> Paste this output in the{' '}
                                <code className="bg-primary-100 px-1.5 py-0.5 rounded text-primary-800 font-mono">&lt;head&gt;</code>{' '}
                                of your website. Twitter/X will use these tags to render rich link previews when your page is shared.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
