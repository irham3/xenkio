'use client';

import { Clapperboard, BookOpen, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TeleprompterConfig } from '../types';
import { FONT_FAMILIES } from '../lib/teleprompter-utils';

interface TeleprompterSetupProps {
    config: TeleprompterConfig;
    updateConfig: (partial: Partial<TeleprompterConfig>) => void;
    onStartTeleprompter: () => void;
    onStartReading: () => void;
}

const FONT_WEIGHT_OPTIONS = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
] as const;

const FONT_FAMILY_OPTIONS = [
    { value: 'sans', label: 'Sans-serif' },
    { value: 'serif', label: 'Serif' },
    { value: 'mono', label: 'Monospace' },
] as const;

const SEGMENT_OPTIONS = [
    { value: 'paragraph', label: 'Per Paragraph' },
    { value: 'sentence', label: 'Per Sentence' },
    { value: 'line', label: 'Per Line' },
] as const;

export function TeleprompterSetup({
    config,
    updateConfig,
    onStartTeleprompter,
    onStartReading,
}: TeleprompterSetupProps) {
    const canStart = config.script.trim().length > 0;

    return (
        <div className="space-y-6">
            {/* Script Input */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                <div className="mb-4">
                    <Label className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                        Script / Text
                    </Label>
                    <p className="text-sm text-gray-400 mt-1">
                        Write or paste the text to be read. Use empty lines to separate paragraphs.
                    </p>
                </div>
                <Textarea
                    value={config.script}
                    onChange={(e) => updateConfig({ script: e.target.value })}
                    placeholder="Write your script here..."
                    className="min-h-[220px] text-base resize-y font-mono"
                />
                <p className="text-xs text-gray-400 mt-2 text-right">
                    {config.script.trim().length > 0
                        ? `${config.script.trim().split(/\s+/).length} words`
                        : '0 words'}
                </p>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight mb-6">
                    Display Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Font Size */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">
                            Font Size{' '}
                            <span className="font-bold text-sky-600">{config.fontSize}px</span>
                        </Label>
                        <Slider
                            min={20}
                            max={120}
                            step={2}
                            value={[config.fontSize]}
                            onValueChange={([v]) => updateConfig({ fontSize: v })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>20px</span>
                            <span>120px</span>
                        </div>
                    </div>

                    {/* Line Spacing */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">
                            Line Spacing{' '}
                            <span className="font-bold text-sky-600">{config.lineSpacing.toFixed(1)}x</span>
                        </Label>
                        <Slider
                            min={1}
                            max={3}
                            step={0.1}
                            value={[config.lineSpacing]}
                            onValueChange={([v]) => updateConfig({ lineSpacing: v })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>1.0x</span>
                            <span>3.0x</span>
                        </div>
                    </div>

                    {/* Font Family */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Font</Label>
                        <div className="flex gap-2 flex-wrap">
                            {FONT_FAMILY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateConfig({ fontFamily: opt.value })}
                                    style={
                                        config.fontFamily === opt.value
                                            ? undefined
                                            : { fontFamily: FONT_FAMILIES[opt.value] }
                                    }
                                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                                        config.fontFamily === opt.value
                                            ? 'bg-sky-500 text-white border-sky-500 font-semibold'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Font Weight</Label>
                        <div className="flex gap-2">
                            {FONT_WEIGHT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateConfig({ fontWeight: opt.value })}
                                    className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${
                                        config.fontWeight === opt.value
                                            ? 'bg-sky-500 text-white border-sky-500 font-semibold'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'
                                    }`}
                                >
                                    <span style={{ fontWeight: opt.value }}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Text Color</Label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={config.textColor}
                                onChange={(e) => updateConfig({ textColor: e.target.value })}
                                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                            />
                            <span className="text-sm font-mono text-gray-500">{config.textColor}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Background Color</Label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={config.backgroundColor}
                                onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                            />
                            <span className="text-sm font-mono text-gray-500">{config.backgroundColor}</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teleprompter Speed */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">
                            Scroll Speed{' '}
                            <span className="font-bold text-sky-600">{config.scrollSpeed}</span>
                        </Label>
                        <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[config.scrollSpeed]}
                            onValueChange={([v]) => updateConfig({ scrollSpeed: v })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Slow</span>
                            <span>Fast</span>
                        </div>
                    </div>

                    {/* Mirror Mode */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">
                            Mode Mirror (Teleprompter)
                        </Label>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={config.mirror}
                                onCheckedChange={(checked) => updateConfig({ mirror: checked })}
                            />
                            <span className="text-sm text-gray-500">
                                {config.mirror ? 'Active — text is mirrored' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Segment Type (for reading mode) */}
                    <div className="space-y-3 md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-700">
                            Show Per (Reading Mode)
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                            {SEGMENT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateConfig({ segmentType: opt.value })}
                                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                                        config.segmentType === opt.value
                                            ? 'bg-sky-500 text-white border-sky-500 font-semibold'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Start Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={onStartTeleprompter}
                    disabled={!canStart}
                    className={`flex items-center justify-between gap-4 p-5 rounded-2xl border-2 text-left transition-all group ${
                        canStart
                            ? 'border-sky-500 bg-sky-50 hover:bg-sky-100 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clapperboard className="w-5 h-5 text-sky-600" />
                            <span className="font-bold text-gray-900">Mode Teleprompter</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Auto-scrolling text — suitable for presentations or recordings.
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-sky-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={onStartReading}
                    disabled={!canStart}
                    className={`flex items-center justify-between gap-4 p-5 rounded-2xl border-2 text-left transition-all group ${
                        canStart
                            ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            <span className="font-bold text-gray-900">Mode Baca</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Display text segment by segment with next/prev — suitable for tablets or phones.
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {!canStart && (
                <p className="text-center text-sm text-gray-400">
                    Please enter a script first to start.
                </p>
            )}

            {/* Color Presets */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight mb-4">
                    Color Presets
                </h3>
                <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() =>
                                updateConfig({
                                    textColor: preset.textColor,
                                    backgroundColor: preset.backgroundColor,
                                })
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-sky-300 transition-all text-sm"
                        >
                            <span
                                className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                                style={{ backgroundColor: preset.backgroundColor }}
                            />
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0 -ml-1"
                                style={{ backgroundColor: preset.textColor, border: '1.5px solid #e5e7eb' }}
                            />
                            <span className="text-gray-600">{preset.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

const COLOR_PRESETS = [
    { name: 'Classic', textColor: '#ffffff', backgroundColor: '#000000' },
    { name: 'White', textColor: '#1a1a1a', backgroundColor: '#ffffff' },
    { name: 'Matrix Green', textColor: '#00ff41', backgroundColor: '#0d0d0d' },
    { name: 'Yellow', textColor: '#fbbf24', backgroundColor: '#1c1917' },
    { name: 'Midnight Blue', textColor: '#e0f2fe', backgroundColor: '#0c1a2e' },
    { name: 'Sepia', textColor: '#4a3728', backgroundColor: '#f5f0e8' },
];
