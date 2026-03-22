'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Clock, Share2, Check, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    getShareUrl?: () => string;
}

export function RunningTextControls({
    config,
    updateConfig,
    onReset,
    getShareUrl,
}: RunningTextControlsProps) {
    // Force re-render for countdown
    const [now, setNow] = useState(Date.now());
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (!getShareUrl) return;
        const url = getShareUrl();
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    useEffect(() => {
        if (!config.isSynced || !config.syncStartTime) return;
        
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 100);
        
        return () => clearInterval(interval);
    }, [config.isSynced, config.syncStartTime]);

    return (
        <div className="space-y-6">
            {/* Text */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="rt-text" className="text-sm font-semibold text-gray-700">
                        Text
                    </Label>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                                key={align}
                                onClick={() => updateConfig({ textAlign: align })}
                                className={`p-1.5 hover:bg-gray-100 transition-colors ${
                                    config.textAlign === align ? 'bg-gray-100 text-gray-900' : 'text-gray-400'
                                }`}
                                title={`Align ${align}`}
                            >
                                {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                {align === 'right' && <AlignRight className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
                <Textarea
                    id="rt-text"
                    value={config.text}
                    onChange={(e) => updateConfig({ text: e.target.value })}
                    placeholder="Type your message…"
                    className="font-medium min-h-[100px]"
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
                    min={0}
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

            {/* Multi-Device Sync */}
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-blue-900">Multi-Device Sync</Label>
                    <Switch
                        checked={config.isSynced}
                        onCheckedChange={(checked) => updateConfig({ isSynced: checked })}
                    />
                </div>
                
                {config.isSynced && (
                    <div className="space-y-4 pt-2">
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Sync multiple devices to create a connected running text display.
                            Ensure all devices have the exact same settings.
                        </p>

                        {/* Start Time Sync */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-blue-800">Sync Start Time</Label>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="flex-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                                    onClick={() => {
                                        // Set start time to next 10-second mark + 2 seconds buffer
                                        const now = Date.now();
                                        const nextTarget = Math.ceil(now / 10000) * 10000 + 10000;
                                        updateConfig({ syncStartTime: nextTarget });
                                    }}
                                >
                                    Start at next :10s
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white border-blue-200 text-red-600 hover:bg-red-50"
                                    onClick={() => updateConfig({ syncStartTime: null })}
                                >
                                    Reset
                                </Button>
                            </div>
                            
                            {config.syncStartTime && (
                                <div className={`text-center py-3 rounded-lg border transition-colors ${
                                    config.syncStartTime > now
                                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                        : 'bg-green-50 border-green-200 text-green-800'
                                }`}>
                                    {config.syncStartTime > now ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-xs uppercase font-bold tracking-wider opacity-70">
                                                Starting in
                                            </div>
                                            <div className="text-3xl font-black font-mono">
                                                {(config.syncStartTime - now) / 1000 > 0 
                                                    ? ((config.syncStartTime - now) / 1000).toFixed(1)
                                                    : "0.0"}s
                                            </div>
                                            <div className="text-[10px] opacity-60">
                                                Wait for other devices...
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 font-bold animate-pulse">
                                            <Clock className="w-4 h-4" />
                                            SYNC ACTIVE
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Position Offset */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-blue-800">
                                Position/Time Delay ({config.syncOffset}ms)
                            </Label>
                            <Slider
                                min={0}
                                max={10000}
                                step={100}
                                value={[config.syncOffset]}
                                onValueChange={([v]) => updateConfig({ syncOffset: v })}
                                className="py-2"
                            />
                            <p className="text-[10px] text-blue-600">
                                Adjust this slider on the second/third device to delay the text so it "flows" from the previous screen.
                            </p>
                        </div>
                    </div>
                )}
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

            {/* Reset & Share */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onReset}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
                
                {getShareUrl && (
                    <Button
                        variant="default"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleCopyLink}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Config
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
