'use client';

import { Link2, RotateCcw, Download, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared';
import { cn } from '@/lib/utils';
import { UTMParams } from '../types';
import { UTM_PRESETS } from '../lib/utm-utils';
import { useUtmBuilder } from '../hooks/use-utm-builder';

const REQUIRED_FIELDS: Array<keyof UTMParams> = ['source', 'medium', 'campaign'];

const FIELD_CONFIG: Array<{ key: keyof UTMParams; label: string; placeholder: string; required?: boolean }> = [
    {
        key: 'source',
        label: 'Source',
        placeholder: 'google, instagram, newsletter',
        required: true,
    },
    {
        key: 'medium',
        label: 'Medium',
        placeholder: 'cpc, social, email',
        required: true,
    },
    {
        key: 'campaign',
        label: 'Campaign',
        placeholder: 'spring_sale_2026',
        required: true,
    },
    {
        key: 'term',
        label: 'Term (optional)',
        placeholder: 'running-shoes',
    },
    {
        key: 'content',
        label: 'Content (optional)',
        placeholder: 'banner_a, cta_button',
    },
];

export function UTMBuilderTool() {
    const {
        state,
        fullUrl,
        queryString,
        isReady,
        updateBaseUrl,
        updateParam,
        applyPreset,
        reset,
        download,
    } = useUtmBuilder();

    const missingFields = REQUIRED_FIELDS.filter((field) => !state.params[field].trim());

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    Quick Presets
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {UTM_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => applyPreset(preset.params)}
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
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-primary-500" />
                        UTM Configuration
                    </h2>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Base URL
                        </label>
                        <input
                            type="url"
                            value={state.baseUrl}
                            onChange={(event) => updateBaseUrl(event.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="https://example.com/landing-page"
                        />
                    </div>

                    {FIELD_CONFIG.map((field) => (
                        <div key={field.key} className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                {field.label}
                                {field.required ? <span className="text-red-500 ml-1">*</span> : null}
                            </label>
                            <input
                                type="text"
                                value={state.params[field.key]}
                                onChange={(event) => updateParam(field.key, event.target.value)}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                </div>

                <div className="space-y-5">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Generated URL</h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={reset}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Reset
                                </Button>
                                <CopyButton
                                    value={fullUrl}
                                    label="Copy"
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-4 overflow-auto min-h-[140px]">
                            <pre className="font-mono text-sm text-gray-100 whitespace-pre-wrap break-all leading-relaxed select-all">
                                {fullUrl || 'Fill in required fields to generate your UTM URL...'}
                            </pre>
                        </div>

                        <Button
                            onClick={download}
                            disabled={!fullUrl}
                            className={cn(
                                'w-full mt-4 h-11 rounded-xl font-bold text-sm cursor-pointer',
                                'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all'
                            )}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download URL (.txt)
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8 space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Preview Query String</h3>
                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 font-mono text-xs text-gray-700 break-all min-h-12">
                            {queryString || 'utm_source=&utm_medium=&utm_campaign='}
                        </div>

                        {!isReady && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
                                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>
                                    Required fields: {missingFields.join(', ') || 'base URL'}.
                                    Fill source, medium, and campaign to create a complete tracking URL.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
