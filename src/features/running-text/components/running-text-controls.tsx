'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { RunningTextConfig, StrobeMode, BlinkMode, FontFamily, BackgroundMode } from '../types';

interface RunningTextControlsProps {
    config: RunningTextConfig;
    updateConfig: (updates: Partial<RunningTextConfig>) => void;
    onReset: () => void;
}

export function RunningTextControls({
    config,
    updateConfig,
    onReset,
}: RunningTextControlsProps) {
    return (
        <div className="space-y-6">
            {/* Text */}
            <div className="space-y-2">
                <Label htmlFor="rt-text" className="text-sm font-semibold text-gray-700">
                    Text
                </Label>
                <Input
                    id="rt-text"
                    value={config.text}
                    onChange={(e) => updateConfig({ text: e.target.value })}
                    placeholder="Type your message…"
                    className="font-medium"
                />
            </div>

            {/* Separator */}
            <div className="space-y-2">
                <Label htmlFor="rt-separator" className="text-sm font-semibold text-gray-700">
                    Separator between repetitions
                </Label>
                <Input
                    id="rt-separator"
                    value={config.separator}
                    onChange={(e) => updateConfig({ separator: e.target.value })}
                    placeholder="e.g.   ✦  "
                    className="font-mono"
                />
            </div>

            {/* Direction */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Scroll Direction</Label>
                <div className="flex gap-2">
                    {(['left', 'right'] as const).map((dir) => (
                        <button
                            key={dir}
                            onClick={() => updateConfig({ direction: dir })}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                config.direction === dir
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {dir === 'left' ? '← Left' : 'Right →'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Speed */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                    Speed{' '}
                    <span className="font-normal text-gray-400">({config.speed}/10)</span>
                </Label>
                <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[config.speed]}
                    onValueChange={([v]) => updateConfig({ speed: v })}
                />
            </div>

            {/* Font size */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                    Font Size{' '}
                    <span className="font-normal text-gray-400">({config.fontSize}px)</span>
                </Label>
                <Slider
                    min={16}
                    max={200}
                    step={2}
                    value={[config.fontSize]}
                    onValueChange={([v]) => updateConfig({ fontSize: v })}
                />
            </div>

            {/* Font weight */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">Bold Text</Label>
                <Switch
                    checked={config.fontWeight === 'bold'}
                    onCheckedChange={(checked) =>
                        updateConfig({ fontWeight: checked ? 'bold' : 'normal' })
                    }
                />
            </div>

            {/* Font family */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Font Family</Label>
                <Select
                    value={config.fontFamily}
                    onValueChange={(v) => updateConfig({ fontFamily: v as FontFamily })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sans">Sans-serif (Arial)</SelectItem>
                        <SelectItem value="mono">Monospace (Courier)</SelectItem>
                        <SelectItem value="serif">Serif (Georgia)</SelectItem>
                        <SelectItem value="impact">Display (Impact)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Colors — only shown in solid mode */}
            {config.backgroundMode === 'solid' && (
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Text Color</Label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={config.textColor}
                            onChange={(e) => updateConfig({ textColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                        />
                        <span className="text-sm font-mono text-gray-500">
                            {config.textColor}
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Background</Label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={config.backgroundColor}
                            onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                        />
                        <span className="text-sm font-mono text-gray-500">
                            {config.backgroundColor}
                        </span>
                    </div>
                </div>
            </div>
            )}

            {/* Text color shown always */}
            {config.backgroundMode === 'split' && (
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Text Color</Label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => updateConfig({ textColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                    />
                    <span className="text-sm font-mono text-gray-500">{config.textColor}</span>
                </div>
            </div>
            )}

            {/* Background Mode */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Background Mode</Label>
                <div className="flex gap-2">
                    {(
                        [
                            { value: 'solid', label: '⬛ Solid' },
                            { value: 'split', label: '◧ Split (2 Halves)' },
                        ] as { value: BackgroundMode; label: string }[]
                    ).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => updateConfig({ backgroundMode: value })}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                config.backgroundMode === value
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Split color controls */}
                {config.backgroundMode === 'split' && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Left color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={config.splitColorLeft}
                                        onChange={(e) =>
                                            updateConfig({ splitColorLeft: e.target.value })
                                        }
                                        className="w-9 h-9 rounded cursor-pointer border border-gray-200"
                                    />
                                    <span className="text-xs font-mono text-gray-500">
                                        {config.splitColorLeft}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Right color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={config.splitColorRight}
                                        onChange={(e) =>
                                            updateConfig({ splitColorRight: e.target.value })
                                        }
                                        className="w-9 h-9 rounded cursor-pointer border border-gray-200"
                                    />
                                    <span className="text-xs font-mono text-gray-500">
                                        {config.splitColorRight}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Swap toggle */}
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-gray-600 font-medium">
                                Alternate / Swap halves
                            </Label>
                            <Switch
                                checked={config.splitSwap}
                                onCheckedChange={(checked) =>
                                    updateConfig({ splitSwap: checked })
                                }
                            />
                        </div>

                        {/* Swap speed */}
                        {config.splitSwap && (
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">
                                    Swap speed: {config.splitSwapSpeed} ms
                                </Label>
                                <Slider
                                    min={50}
                                    max={2000}
                                    step={50}
                                    value={[config.splitSwapSpeed]}
                                    onValueChange={([v]) =>
                                        updateConfig({ splitSwapSpeed: v })
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Blink Mode */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Blink Effect</Label>
                <div className="grid grid-cols-4 gap-1.5">
                    {(['off', 'slow', 'medium', 'fast'] as BlinkMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => updateConfig({ blinkMode: mode })}
                            className={`py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                                config.blinkMode === mode
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {mode === 'off' ? 'Off' : mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Strobe Mode — only for solid background */}
            {config.backgroundMode === 'solid' && (
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Strobe / Flash Mode</Label>
                <div className="grid grid-cols-2 gap-1.5">
                    {(
                        [
                            { value: 'off', label: '🚫 Off' },
                            { value: 'ambulance', label: '🚑 Ambulance' },
                            { value: 'police', label: '🚔 Police' },
                            { value: 'warning', label: '⚠️ Warning' },
                            { value: 'custom', label: '🎨 Custom' },
                        ] as { value: StrobeMode; label: string }[]
                    ).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => updateConfig({ strobeMode: value })}
                            className={`py-2 rounded-lg border text-xs font-medium transition-colors ${
                                config.strobeMode === value
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Custom strobe colors */}
                {config.strobeMode === 'custom' && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Color A</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={config.strobeColor1}
                                        onChange={(e) =>
                                            updateConfig({ strobeColor1: e.target.value })
                                        }
                                        className="w-9 h-9 rounded cursor-pointer border border-gray-200"
                                    />
                                    <span className="text-xs font-mono text-gray-500">
                                        {config.strobeColor1}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Color B</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={config.strobeColor2}
                                        onChange={(e) =>
                                            updateConfig({ strobeColor2: e.target.value })
                                        }
                                        className="w-9 h-9 rounded cursor-pointer border border-gray-200"
                                    />
                                    <span className="text-xs font-mono text-gray-500">
                                        {config.strobeColor2}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">
                                Flash speed: {config.strobeSpeed}ms
                            </Label>
                            <Slider
                                min={50}
                                max={1000}
                                step={25}
                                value={[config.strobeSpeed]}
                                onValueChange={([v]) => updateConfig({ strobeSpeed: v })}
                            />
                        </div>
                    </div>
                )}
            </div>
            )}

            {/* Reset */}
            <Button
                variant="outline"
                className="w-full"
                onClick={onReset}
            >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
            </Button>
        </div>
    );
}
