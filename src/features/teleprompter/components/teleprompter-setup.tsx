'use client';

import { useState } from 'react';
import { FilmStrip, BookOpen } from '@phosphor-icons/react/dist/ssr';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TeleprompterConfig } from '../types';
import { FONT_FAMILIES, estimateDuration } from '../lib/teleprompter-utils';

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
    { value: 'smart', label: 'Smart Mode', desc: 'Intelligent split by sentence & length' },
    { value: 'paragraph', label: 'By Paragraph', desc: 'Split at empty lines' },
    { value: 'sentence', label: 'By Sentence', desc: 'Split at . ! ?' },
    { value: 'line', label: 'By Line', desc: 'Split at each newline' },
] as const;

const COLOR_PRESETS = [
    { name: 'Classic', textColor: '#ffffff', backgroundColor: '#000000' },
    { name: 'White', textColor: '#1a1a1a', backgroundColor: '#ffffff' },
    { name: 'Matrix Green', textColor: '#00ff41', backgroundColor: '#0d0d0d' },
    { name: 'Yellow', textColor: '#fbbf24', backgroundColor: '#1c1917' },
    { name: 'Midnight Blue', textColor: '#e0f2fe', backgroundColor: '#0c1a2e' },
    { name: 'Sepia', textColor: '#4a3728', backgroundColor: '#f5f0e8' },
];

type ActiveTab = 'teleprompter' | 'reading';

export function TeleprompterSetup({
    config,
    updateConfig,
    onStartTeleprompter,
    onStartReading,
}: TeleprompterSetupProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('teleprompter');
    const canStart = config.script.trim().length > 0;
    const wordCount = config.script.trim() ? config.script.trim().split(/\s+/).length : 0;

    return (
        <div className="space-y-5">
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
                    className="min-h-[200px] text-base resize-y font-mono"
                />
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                        {wordCount > 0 ? `Est. reading time: ${estimateDuration(config.script, config.scrollSpeed)}` : ''}
                    </span>
                    <span className="text-xs text-gray-400">{wordCount} words</span>
                </div>
            </div>

            {/* Tab Panel */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('teleprompter')}
                        className={`flex items-center gap-2.5 px-6 py-4 text-sm font-semibold transition-all relative flex-1 justify-center ${
                            activeTab === 'teleprompter'
                                ? 'text-sky-600'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <FilmStrip className="w-4 h-4"  weight="duotone"/>
                        Teleprompter Mode
                        {activeTab === 'teleprompter' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-t" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('reading')}
                        className={`flex items-center gap-2.5 px-6 py-4 text-sm font-semibold transition-all relative flex-1 justify-center ${
                            activeTab === 'reading'
                                ? 'text-emerald-600'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <BookOpen className="w-4 h-4"  weight="duotone"/>
                        Reading Mode
                        {activeTab === 'reading' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t" />
                        )}
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {/* ── TELEPROMPTER TAB ── */}
                    {activeTab === 'teleprompter' && (
                        <div className="space-y-7">
                            <p className="text-sm text-gray-400 -mt-2">
                                Auto-scrolling text — best for presentations and video recordings.
                            </p>

                            {/* Shared Display Settings */}
                            <SharedDisplaySettings config={config} updateConfig={updateConfig} />

                            {/* Divider */}
                            <div className="border-t border-gray-100" />

                            {/* Teleprompter-specific */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Scroll Speed */}
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
                                        Mirror Mode
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
                                    {config.mirror && (
                                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                                            ⚠ Use a physical mirror or beam splitter in front of your screen.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={onStartTeleprompter}
                                disabled={!canStart}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                                    canStart
                                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow-md'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FilmStrip className="w-4 h-4"  weight="duotone"/>
                                Start Teleprompter
                            </button>
                            {!canStart && (
                                <p className="text-center text-xs text-gray-400 -mt-4">
                                    Enter a script above to get started.
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── READING MODE TAB ── */}
                    {activeTab === 'reading' && (
                        <div className="space-y-7">
                            <p className="text-sm text-gray-400 -mt-2">
                                Segment-by-segment display — best for tablets, phones, or guided reading.
                            </p>

                            {/* Shared Display Settings */}
                            <SharedDisplaySettings config={config} updateConfig={updateConfig} />

                            {/* Divider */}
                            <div className="border-t border-gray-100" />

                            {/* Segment Type */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">
                                    Display By
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SEGMENT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateConfig({ segmentType: opt.value })}
                                            className={`text-left px-4 py-3 rounded-xl border transition-all ${
                                                config.segmentType === opt.value
                                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-200'
                                            }`}
                                        >
                                            <span className="block text-sm font-semibold">{opt.label}</span>
                                            <span className="block text-xs text-gray-400 mt-0.5">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={onStartReading}
                                disabled={!canStart}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                                    canStart
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <BookOpen className="w-4 h-4"  weight="duotone"/>
                                Start Reading Mode
                            </button>
                            {!canStart && (
                                <p className="text-center text-xs text-gray-400 -mt-4">
                                    Enter a script above to get started.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Shared Display Settings (used by both tabs) ─── */
function SharedDisplaySettings({
    config,
    updateConfig,
}: {
    config: TeleprompterConfig;
    updateConfig: (partial: Partial<TeleprompterConfig>) => void;
}) {
    return (
        <div className="space-y-6">
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

                {/* Text Color */}
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

                {/* Background Color */}
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

            {/* Color Presets */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                    Color Presets
                </Label>
                <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() =>
                                updateConfig({
                                    textColor: preset.textColor,
                                    backgroundColor: preset.backgroundColor,
                                })
                            }
                            title={preset.name}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${
                                config.textColor === preset.textColor &&
                                config.backgroundColor === preset.backgroundColor
                                    ? 'border-sky-400 bg-sky-50 font-semibold text-sky-700'
                                    : 'border-gray-200 hover:border-sky-300 text-gray-600'
                            }`}
                        >
                            <span
                                className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                                style={{ backgroundColor: preset.backgroundColor }}
                            />
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 -ml-1"
                                style={{ backgroundColor: preset.textColor, border: '1.5px solid #e5e7eb' }}
                            />
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
