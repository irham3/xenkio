'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Plus, Trash2, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShadowLayer {
  id: string;
  horizontalOffset: number;
  verticalOffset: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

interface PresetShadow {
  name: string;
  layers: Omit<ShadowLayer, 'id'>[];
}

function createId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createLayer(overrides?: Partial<Omit<ShadowLayer, 'id'>>): ShadowLayer {
  return {
    id: createId(),
    horizontalOffset: 0,
    verticalOffset: 4,
    blur: 12,
    spread: 0,
    color: '#000000',
    opacity: 15,
    inset: false,
    ...overrides,
  };
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
}

function buildShadowCss(layers: ShadowLayer[]): string {
  if (layers.length === 0) return 'none';
  return layers
    .map((layer) => {
      const inset = layer.inset ? 'inset ' : '';
      const color = hexToRgba(layer.color, layer.opacity);
      return `${inset}${layer.horizontalOffset}px ${layer.verticalOffset}px ${layer.blur}px ${layer.spread}px ${color}`;
    })
    .join(', ');
}

const PRESET_SHADOWS: PresetShadow[] = [
  {
    name: 'Subtle',
    layers: [{ horizontalOffset: 0, verticalOffset: 1, blur: 3, spread: 0, color: '#000000', opacity: 10, inset: false }],
  },
  {
    name: 'Soft',
    layers: [{ horizontalOffset: 0, verticalOffset: 4, blur: 12, spread: 0, color: '#000000', opacity: 10, inset: false }],
  },
  {
    name: 'Medium',
    layers: [{ horizontalOffset: 0, verticalOffset: 4, blur: 16, spread: -2, color: '#000000', opacity: 15, inset: false }],
  },
  {
    name: 'Large',
    layers: [{ horizontalOffset: 0, verticalOffset: 10, blur: 30, spread: -5, color: '#000000', opacity: 20, inset: false }],
  },
  {
    name: 'Sharp',
    layers: [{ horizontalOffset: 4, verticalOffset: 4, blur: 0, spread: 0, color: '#000000', opacity: 25, inset: false }],
  },
  {
    name: 'Elevated',
    layers: [
      { horizontalOffset: 0, verticalOffset: 1, blur: 3, spread: 0, color: '#000000', opacity: 8, inset: false },
      { horizontalOffset: 0, verticalOffset: 12, blur: 32, spread: -4, color: '#000000', opacity: 15, inset: false },
    ],
  },
  {
    name: 'Dreamy',
    layers: [
      { horizontalOffset: 0, verticalOffset: 4, blur: 8, spread: 0, color: '#6366f1', opacity: 20, inset: false },
      { horizontalOffset: 0, verticalOffset: 8, blur: 24, spread: 0, color: '#6366f1', opacity: 10, inset: false },
    ],
  },
  {
    name: 'Inset',
    layers: [{ horizontalOffset: 0, verticalOffset: 2, blur: 8, spread: 0, color: '#000000', opacity: 20, inset: true }],
  },
  {
    name: 'Outline Glow',
    layers: [{ horizontalOffset: 0, verticalOffset: 0, blur: 0, spread: 3, color: '#6366f1', opacity: 50, inset: false }],
  },
  {
    name: 'Layered',
    layers: [
      { horizontalOffset: 0, verticalOffset: 1, blur: 2, spread: 0, color: '#000000', opacity: 5, inset: false },
      { horizontalOffset: 0, verticalOffset: 2, blur: 4, spread: 0, color: '#000000', opacity: 5, inset: false },
      { horizontalOffset: 0, verticalOffset: 4, blur: 8, spread: 0, color: '#000000', opacity: 5, inset: false },
      { horizontalOffset: 0, verticalOffset: 8, blur: 16, spread: 0, color: '#000000', opacity: 5, inset: false },
    ],
  },
];

const RANDOM_COLORS = [
  '#000000', '#1a1a1a', '#333333', '#6366f1', '#ec4899',
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
];

const DEFAULT_LAYERS: ShadowLayer[] = [
  createLayer({ horizontalOffset: 0, verticalOffset: 4, blur: 12, spread: 0, color: '#000000', opacity: 15 }),
];

export function BoxShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>(DEFAULT_LAYERS);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [boxColor, setBoxColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  const shadowCss = useMemo(() => buildShadowCss(layers), [layers]);
  const fullCss = `box-shadow: ${shadowCss};`;

  const updateLayer = useCallback((id: string, updates: Partial<Omit<ShadowLayer, 'id'>>): void => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  }, []);

  const addLayer = useCallback((): void => {
    setLayers((prev) => [...prev, createLayer()]);
  }, []);

  const removeLayer = useCallback((id: string): void => {
    setLayers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((l) => l.id !== id);
    });
  }, []);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(fullCss);
      setCopied(true);
      toast.success('CSS copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy CSS');
    }
  }, [fullCss]);

  const handleRandom = useCallback((): void => {
    const numLayers = 1 + Math.floor(Math.random() * 3);
    const newLayers: ShadowLayer[] = [];
    for (let i = 0; i < numLayers; i++) {
      const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
      newLayers.push(
        createLayer({
          horizontalOffset: Math.round((Math.random() - 0.5) * 40),
          verticalOffset: Math.round(Math.random() * 30),
          blur: Math.round(Math.random() * 40),
          spread: Math.round((Math.random() - 0.5) * 20),
          color,
          opacity: 10 + Math.round(Math.random() * 30),
          inset: Math.random() > 0.8,
        })
      );
    }
    setLayers(newLayers);
  }, []);

  const applyPreset = useCallback((preset: PresetShadow): void => {
    setLayers(preset.layers.map((l) => ({ ...l, id: createId() })));
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Preview */}
        <div
          className="w-full flex items-center justify-center rounded-t-2xl"
          style={{ backgroundColor: bgColor, minHeight: '240px' }}
        >
          <div
            className="w-40 h-40 rounded-2xl transition-shadow duration-200"
            style={{
              backgroundColor: boxColor,
              boxShadow: shadowCss,
            }}
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* LEFT PANEL: Controls */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-6">
              {/* Colors */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800">Colors</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">Background</span>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer"
                          style={{ backgroundColor: bgColor }}
                        />
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Background color"
                        />
                      </div>
                      <Input
                        value={bgColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setBgColor(val);
                        }}
                        className="h-8 font-mono text-xs uppercase bg-gray-50"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">Box</span>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer"
                          style={{ backgroundColor: boxColor }}
                        />
                        <input
                          type="color"
                          value={boxColor}
                          onChange={(e) => setBoxColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Box color"
                        />
                      </div>
                      <Input
                        value={boxColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setBoxColor(val);
                        }}
                        className="h-8 font-mono text-xs uppercase bg-gray-50"
                        maxLength={7}
                      />
                    </div>
                  </div>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLayer}
                  className="flex-1 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Layer
                </Button>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-800">Presets</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PRESET_SHADOWS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all bg-white flex items-center justify-center"
                      title={preset.name}
                    >
                      <div
                        className="w-8 h-8 rounded-md bg-white"
                        style={{
                          boxShadow: buildShadowCss(
                            preset.layers.map((l) => ({ ...l, id: '' }))
                          ),
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[10px] font-medium truncate block text-center">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Shadow Layers & CSS Output */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50">
            <div className="space-y-6">
              {/* Shadow Layers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">
                    Shadow Layers ({layers.length})
                  </Label>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {layers.map((layer, index) => (
                    <div
                      key={layer.id}
                      className="p-3 bg-white rounded-lg border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">
                          Layer {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateLayer(layer.id, { inset: !layer.inset })}
                            className={cn(
                              'px-2 py-1 text-xs rounded-md border transition-all',
                              layer.inset
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            )}
                          >
                            Inset
                          </button>
                          <button
                            onClick={() => removeLayer(layer.id)}
                            disabled={layers.length <= 1}
                            className={cn(
                              'p-1.5 rounded-md transition-colors',
                              layers.length <= 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            )}
                            aria-label="Remove shadow layer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Color & Opacity */}
                      <div className="flex items-center gap-2">
                        <div className="relative shrink-0">
                          <div
                            className="w-9 h-9 rounded-md border border-gray-200 cursor-pointer"
                            style={{ backgroundColor: layer.color }}
                          />
                          <input
                            type="color"
                            value={layer.color}
                            onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            aria-label={`Shadow color for layer ${index + 1}`}
                          />
                        </div>
                        <Input
                          value={layer.color.toUpperCase()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                              updateLayer(layer.id, { color: val });
                            }
                          }}
                          className="h-9 w-24 font-mono text-xs uppercase bg-gray-50"
                          maxLength={7}
                        />
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <span className="text-xs text-gray-500 shrink-0">Opacity</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={layer.opacity}
                            onChange={(e) => updateLayer(layer.id, { opacity: parseInt(e.target.value) })}
                            aria-label={`Opacity for layer ${index + 1}`}
                            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                          />
                          <span className="text-xs text-gray-500 w-8 text-right tabular-nums">
                            {layer.opacity}%
                          </span>
                        </div>
                      </div>

                      {/* Sliders */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">X Offset</span>
                            <span className="text-xs text-gray-500 tabular-nums">{layer.horizontalOffset}px</span>
                          </div>
                          <input
                            type="range"
                            min={-50}
                            max={50}
                            value={layer.horizontalOffset}
                            onChange={(e) => updateLayer(layer.id, { horizontalOffset: parseInt(e.target.value) })}
                            aria-label={`Horizontal offset for layer ${index + 1}`}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Y Offset</span>
                            <span className="text-xs text-gray-500 tabular-nums">{layer.verticalOffset}px</span>
                          </div>
                          <input
                            type="range"
                            min={-50}
                            max={50}
                            value={layer.verticalOffset}
                            onChange={(e) => updateLayer(layer.id, { verticalOffset: parseInt(e.target.value) })}
                            aria-label={`Vertical offset for layer ${index + 1}`}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Blur</span>
                            <span className="text-xs text-gray-500 tabular-nums">{layer.blur}px</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={layer.blur}
                            onChange={(e) => updateLayer(layer.id, { blur: parseInt(e.target.value) })}
                            aria-label={`Blur for layer ${index + 1}`}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Spread</span>
                            <span className="text-xs text-gray-500 tabular-nums">{layer.spread}px</span>
                          </div>
                          <input
                            type="range"
                            min={-50}
                            max={50}
                            value={layer.spread}
                            onChange={(e) => updateLayer(layer.id, { spread: parseInt(e.target.value) })}
                            aria-label={`Spread for layer ${index + 1}`}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                          />
                        </div>
                      </div>
                    </div>
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
                  <span className="text-blue-400">box-shadow</span>
                  <span className="text-gray-400">: </span>
                  <span className="text-green-400 break-all">{shadowCss}</span>
                  <span className="text-gray-400">;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
