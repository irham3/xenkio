'use client';

import {
    Building2,
    Code2,
    Download,
    FileText,
    Globe,
    HelpCircle,
    Newspaper,
    Plus,
    RotateCcw,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared';
import { cn } from '@/lib/utils';
import { PRESETS, SCHEMA_TYPES } from '../lib/schema-utils';
import { useSchemaGenerator } from '../hooks/use-schema-generator';

export function SchemaGenerator() {
    const {
        config,
        output,
        updateField,
        setSchemaType,
        applyPreset,
        addFaq,
        removeFaq,
        updateFaq,
        resetConfig,
        downloadFile,
    } = useSchemaGenerator();

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
                            onClick={() => applyPreset(preset.schemaType)}
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
                            <Code2 className="h-5 w-5 text-primary-500" />
                            Schema Type
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SCHEMA_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSchemaType(type.value)}
                                    className={cn(
                                        'p-3 rounded-xl border-2 text-left transition-all cursor-pointer',
                                        config.schemaType === type.value
                                            ? 'border-primary-400 bg-primary-50/50'
                                            : 'border-gray-100 hover:border-gray-200',
                                    )}
                                >
                                    <span className={cn(
                                        'text-sm font-bold block',
                                        config.schemaType === type.value ? 'text-primary-700' : 'text-gray-900',
                                    )}>
                                        {type.label}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1 block leading-snug">
                                        {type.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-5">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary-500" />
                            Base Fields
                        </h3>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </label>
                            <input
                                type="text"
                                value={config.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="Acme Digital Studio"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Description
                            </label>
                            <textarea
                                value={config.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="w-full min-h-[80px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                                placeholder="Describe your page, product, or organization."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                URL
                            </label>
                            <input
                                type="url"
                                value={config.url}
                                onChange={(e) => updateField('url', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Image / Logo URL
                            </label>
                            <input
                                type="url"
                                value={config.image}
                                onChange={(e) => updateField('image', e.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    {config.schemaType === 'article' && (
                        <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-5">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Newspaper className="h-5 w-5 text-primary-500" />
                                Article Fields
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Headline
                                </label>
                                <input
                                    type="text"
                                    value={config.headline}
                                    onChange={(e) => updateField('headline', e.target.value)}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    placeholder="How to Improve Technical SEO in 2026"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Author Name
                                    </label>
                                    <input
                                        type="text"
                                        value={config.authorName}
                                        onChange={(e) => updateField('authorName', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="Jane Doe"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Publisher Name
                                    </label>
                                    <input
                                        type="text"
                                        value={config.publisherName}
                                        onChange={(e) => updateField('publisherName', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        placeholder="Acme Media"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Date Published
                                    </label>
                                    <input
                                        type="date"
                                        value={config.datePublished}
                                        onChange={(e) => updateField('datePublished', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Date Modified
                                    </label>
                                    <input
                                        type="date"
                                        value={config.dateModified}
                                        onChange={(e) => updateField('dateModified', e.target.value)}
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {config.schemaType === 'faq' && (
                        <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5 text-primary-500" />
                                    FAQ Items
                                </h3>
                                <Button
                                    onClick={addFaq}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 cursor-pointer"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add FAQ
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {config.faqs.map((item, index) => (
                                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-primary-500 bg-primary-50 px-2 py-1 rounded-lg">
                                                Item {index + 1}
                                            </span>
                                            {config.faqs.length > 1 && (
                                                <button
                                                    onClick={() => removeFaq(item.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Question
                                            </label>
                                            <input
                                                type="text"
                                                value={item.question}
                                                onChange={(e) => updateFaq(item.id, 'question', e.target.value)}
                                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                                placeholder="How long does setup take?"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Answer
                                            </label>
                                            <textarea
                                                value={item.answer}
                                                onChange={(e) => updateFaq(item.id, 'answer', e.target.value)}
                                                className="w-full min-h-[70px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                                                placeholder="Most teams publish their first schema in under 10 minutes."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {config.schemaType === 'organization' && (
                        <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                                <Building2 className="h-5 w-5 text-primary-500" />
                                Organization Tips
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Use your official brand name, homepage URL, and logo URL for the best rich result eligibility.
                            </p>
                        </div>
                    )}

                    {config.schemaType === 'website' && (
                        <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                                <Globe className="h-5 w-5 text-primary-500" />
                                Website Tips
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Use your canonical domain in URL. The generator will include SearchAction markup automatically.
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Generated JSON-LD
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
                            aria-label="Schema JSON-LD preview"
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
                            Download schema-markup.json
                        </Button>

                        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                            Paste this JSON-LD script into your page head or validate it in Google Rich Results Test.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary-500" />
                            Usage
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Generated output follows schema.org format and is ready to wrap in
                            {' '}
                            <code className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">{'<script type="application/ld+json">'}</code>
                            {' '}
                            tags.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
