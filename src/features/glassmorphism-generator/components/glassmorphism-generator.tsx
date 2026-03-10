'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Shuffle, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GlassConfig {
  blur: number;
  opacity: number;
  saturation: number;
  borderOpacity: number;
  glassColor: string;
  borderRadius: number;
}

interface PresetGlass {
  name: string;
  config: Omit<GlassConfig, 'glassColor'>;
}

const PRESET_GLASSES: PresetGlass[] = [
  {
    name: 'Subtle',
    config: { blur: 8, opacity: 15, saturation: 100, borderOpacity: 20, borderRadius: 12 },
  },
  {
    name: 'Light',
    config: { blur: 12, opacity: 25, saturation: 120, borderOpacity: 30, borderRadius: 16 },
  },
  {
    name: 'Medium',
    config: { blur: 16, opacity: 35, saturation: 140, borderOpacity: 35, borderRadius: 16 },
  },
  {
    name: 'Frosted',
    config: { blur: 24, opacity: 20, saturation: 180, borderOpacity: 25, borderRadius: 20 },
  },
  {
    name: 'Heavy',
    config: { blur: 32, opacity: 50, saturation: 160, borderOpacity: 40, borderRadius: 16 },
  },
  {
    name: 'Crystal',
    config: { blur: 40, opacity: 10, saturation: 200, borderOpacity: 50, borderRadius: 24 },
  },
  {
    name: 'Opaque',
    config: { blur: 10, opacity: 60, saturation: 100, borderOpacity: 45, borderRadius: 12 },
  },
  {
    name: 'Soft',
    config: { blur: 20, opacity: 30, saturation: 120, borderOpacity: 15, borderRadius: 20 },
  },
];

const BACKGROUND_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

const DEFAULT_CONFIG: GlassConfig = {
  blur: 16,
  opacity: 25,
  saturation: 140,
  borderOpacity: 30,
  glassColor: '#ffffff',
  borderRadius: 16,
};

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
}

function buildGlassCss(config: GlassConfig): string {
  const lines = [
    `background: ${hexToRgba(config.glassColor, config.opacity)};`,
    `backdrop-filter: blur(${config.blur}px) saturate(${config.saturation}%);`,
    `-webkit-backdrop-filter: blur(${config.blur}px) saturate(${config.saturation}%);`,
    `border-radius: ${config.borderRadius}px;`,
    `border: 1px solid ${hexToRgba(config.glassColor, config.borderOpacity)};`,
  ];
  return lines.join('\n');
}

export function GlassmorphismGenerator() {
  const [config, setConfig] = useState<GlassConfig>(DEFAULT_CONFIG);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [useCustomBg, setUseCustomBg] = useState(false);
  const [customColor1, setCustomColor1] = useState('#667eea');
  const [customColor2, setCustomColor2] = useState('#764ba2');

  const glassCss = useMemo(() => buildGlassCss(config), [config]);
  const customBg = `linear-gradient(135deg, ${customColor1} 0%, ${customColor2} 100%)`;
  const currentBg = useCustomBg ? customBg : BACKGROUND_PRESETS[backgroundIndex];

  const updateConfig = useCallback(<K extends keyof GlassConfig>(key: K, value: GlassConfig[K]): void => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(glassCss);
      setCopied(true);
      toast.success('CSS copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy CSS');
    }
  }, [glassCss]);

  const handleRandom = useCallback((): void => {
    setConfig({
      blur: 4 + Math.round(Math.random() * 36),
      opacity: 5 + Math.round(Math.random() * 55),
      saturation: 100 + Math.round(Math.random() * 100),
      borderOpacity: 10 + Math.round(Math.random() * 40),
      glassColor: '#ffffff',
      borderRadius: 8 + Math.round(Math.random() * 24),
    });
    setUseCustomBg(false);
    setBackgroundIndex(Math.floor(Math.random() * BACKGROUND_PRESETS.length));
  }, []);

  const applyPreset = useCallback((preset: PresetGlass): void => {
    setConfig((prev) => ({ ...prev, ...preset.config }));
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Preview */}
        <div
          className="w-full flex items-center justify-center rounded-t-2xl relative"
          style={{ background: currentBg, minHeight: '280px' }}
        >
          {/* Decorative shapes behind glass */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-32 h-32 rounded-full"
              style={{ background: 'rgba(255,255,255,0.35)', top: '10%', left: '10%' }}
            />
            <div
              className="absolute w-24 h-24 rounded-full"
              style={{ background: 'rgba(255,255,0,0.3)', bottom: '15%', right: '12%' }}
            />
            <div
              className="absolute w-16 h-16 rounded-lg rotate-45"
              style={{ background: 'rgba(255,100,100,0.35)', top: '25%', right: '25%' }}
            />
            <div
              className="absolute w-20 h-20 rounded-full"
              style={{ background: 'rgba(0,255,200,0.3)', bottom: '25%', left: '25%' }}
            />
            <div
              className="absolute w-12 h-12 rounded-full"
              style={{ background: 'rgba(255,255,255,0.4)', top: '55%', right: '45%' }}
            />
          </div>

          <div
            className="w-56 h-40 transition-all duration-200 relative z-10"
            style={{
              background: hexToRgba(config.glassColor, config.opacity),
              backdropFilter: `blur(${config.blur}px) saturate(${config.saturation}%)`,
              WebkitBackdropFilter: `blur(${config.blur}px) saturate(${config.saturation}%)`,
              borderRadius: `${config.borderRadius}px`,
              border: `1px solid ${hexToRgba(config.glassColor, config.borderOpacity)}`,
            }}
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* LEFT PANEL: Controls */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-6">
              {/* Glass Color */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800">Glass Color</Label>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <div
                      className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer"
                      style={{ backgroundColor: config.glassColor }}
                    />
                    <input
                      type="color"
                      value={config.glassColor}
                      onChange={(e) => updateConfig('glassColor', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Glass color"
                    />
                  </div>
                  <Input
                    value={config.glassColor.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) updateConfig('glassColor', val);
                    }}
                    className="h-8 font-mono text-xs uppercase bg-gray-50"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Blur</span>
                    <span className="text-xs text-gray-500 tabular-nums">{config.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={config.blur}
                    onChange={(e) => updateConfig('blur', parseInt(e.target.value))}
                    aria-label="Blur amount"
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Opacity</span>
                    <span className="text-xs text-gray-500 tabular-nums">{config.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={config.opacity}
                    onChange={(e) => updateConfig('opacity', parseInt(e.target.value))}
                    aria-label="Glass opacity"
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Saturation</span>
                    <span className="text-xs text-gray-500 tabular-nums">{config.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={200}
                    value={config.saturation}
                    onChange={(e) => updateConfig('saturation', parseInt(e.target.value))}
                    aria-label="Backdrop saturation"
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Border Opacity</span>
                    <span className="text-xs text-gray-500 tabular-nums">{config.borderOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={config.borderOpacity}
                    onChange={(e) => updateConfig('borderOpacity', parseInt(e.target.value))}
                    aria-label="Border opacity"
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Border Radius</span>
                    <span className="text-xs text-gray-500 tabular-nums">{config.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={config.borderRadius}
                    onChange={(e) => updateConfig('borderRadius', parseInt(e.target.value))}
                    aria-label="Border radius"
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandom}
                  className="flex-1 gap-1.5"
                >
                  <Shuffle className="w-4 h-4" />
                  Random
                </Button>
              </div>

              {/* Background Presets */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-800">Background</Label>
                <div className="grid grid-cols-4 gap-2">
                  {BACKGROUND_PRESETS.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setBackgroundIndex(i);
                        setUseCustomBg(false);
                      }}
                      className={cn(
                        'aspect-square rounded-lg border-2 transition-all',
                        !useCustomBg && i === backgroundIndex
                          ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-1'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                      style={{ background: bg }}
                      aria-label={`Background preset ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Background */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">Custom Background</Label>
                  <Button
                    variant={useCustomBg ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseCustomBg(!useCustomBg)}
                    className="h-7 text-xs gap-1.5"
                  >
                    <Palette className="w-3 h-3" />
                    {useCustomBg ? 'Active' : 'Use Custom'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">Start Color</span>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer"
                          style={{ backgroundColor: customColor1 }}
                        />
                        <input
                          type="color"
                          value={customColor1}
                          onChange={(e) => {
                            setCustomColor1(e.target.value);
                            setUseCustomBg(true);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Custom background start color"
                        />
                      </div>
                      <Input
                        value={customColor1.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setCustomColor1(val);
                            setUseCustomBg(true);
                          }
                        }}
                        className="h-8 font-mono text-xs uppercase bg-gray-50"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">End Color</span>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer"
                          style={{ backgroundColor: customColor2 }}
                        />
                        <input
                          type="color"
                          value={customColor2}
                          onChange={(e) => {
                            setCustomColor2(e.target.value);
                            setUseCustomBg(true);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Custom background end color"
                        />
                      </div>
                      <Input
                        value={customColor2.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setCustomColor2(val);
                            setUseCustomBg(true);
                          }
                        }}
                        className="h-8 font-mono text-xs uppercase bg-gray-50"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
                {useCustomBg && (
                  <div
                    className="h-8 rounded-lg border-2 border-primary-500 ring-2 ring-primary-500 ring-offset-1"
                    style={{ background: customBg }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Presets & CSS Output */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50">
            <div className="space-y-6">
              {/* Presets */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800">Presets</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_GLASSES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all h-16"
                      style={{ background: currentBg }}
                      title={preset.name}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: hexToRgba('#ffffff', preset.config.opacity),
                            backdropFilter: `blur(${preset.config.blur}px) saturate(${preset.config.saturation}%)`,
                            WebkitBackdropFilter: `blur(${preset.config.blur}px) saturate(${preset.config.saturation}%)`,
                            borderRadius: `${preset.config.borderRadius}px`,
                          }}
                        >
                          <span className="text-xs font-medium text-white drop-shadow-sm">
                            {preset.name}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CSS Output */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">CSS Code</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                      'h-7 text-xs gap-1.5 transition-all',
                      copied && 'text-green-600 border-green-500 bg-green-50'
                    )}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy CSS'}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm leading-relaxed overflow-x-auto">
                  <div>
                    <span className="text-blue-400">background</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">{hexToRgba(config.glassColor, config.opacity)}</span>
                    <span className="text-gray-400">;</span>
                  </div>
                  <div>
                    <span className="text-blue-400">backdrop-filter</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">blur({config.blur}px) saturate({config.saturation}%)</span>
                    <span className="text-gray-400">;</span>
                  </div>
                  <div>
                    <span className="text-blue-400">-webkit-backdrop-filter</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">blur({config.blur}px) saturate({config.saturation}%)</span>
                    <span className="text-gray-400">;</span>
                  </div>
                  <div>
                    <span className="text-blue-400">border-radius</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">{config.borderRadius}px</span>
                    <span className="text-gray-400">;</span>
                  </div>
                  <div>
                    <span className="text-blue-400">border</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">1px solid {hexToRgba(config.glassColor, config.borderOpacity)}</span>
                    <span className="text-gray-400">;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
