'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Plus, Trash2, Shuffle, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type GradientType = 'linear' | 'radial' | 'conic';
type RadialShape = 'circle' | 'ellipse';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientState {
  type: GradientType;
  angle: number;
  radialShape: RadialShape;
  radialPositionX: number;
  radialPositionY: number;
  colorStops: ColorStop[];
}

interface PresetGradient {
  name: string;
  state: GradientState;
}

const GRADIENT_TYPES: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
];

const PRESET_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function createId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createStop(color: string, position: number): ColorStop {
  return { id: createId(), color, position };
}

const PRESET_GRADIENTS: PresetGradient[] = [
  {
    name: 'Sunset',
    state: {
      type: 'linear', angle: 135, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#FF512F', 0), createStop('#F09819', 100)],
    },
  },
  {
    name: 'Ocean',
    state: {
      type: 'linear', angle: 90, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#2193b0', 0), createStop('#6dd5ed', 100)],
    },
  },
  {
    name: 'Purple Haze',
    state: {
      type: 'linear', angle: 135, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#7B2FF7', 0), createStop('#C471F5', 50), createStop('#FA71CD', 100)],
    },
  },
  {
    name: 'Emerald',
    state: {
      type: 'linear', angle: 180, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#11998e', 0), createStop('#38ef7d', 100)],
    },
  },
  {
    name: 'Fire',
    state: {
      type: 'radial', angle: 0, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#f5af19', 0), createStop('#f12711', 100)],
    },
  },
  {
    name: 'Northern Lights',
    state: {
      type: 'linear', angle: 45, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#43cea2', 0), createStop('#185a9d', 100)],
    },
  },
  {
    name: 'Cotton Candy',
    state: {
      type: 'linear', angle: 90, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#FFDEE9', 0), createStop('#B5FFFC', 100)],
    },
  },
  {
    name: 'Midnight',
    state: {
      type: 'linear', angle: 180, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#0f0c29', 0), createStop('#302b63', 50), createStop('#24243e', 100)],
    },
  },
  {
    name: 'Rainbow Conic',
    state: {
      type: 'conic', angle: 0, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [
        createStop('#ff0000', 0), createStop('#ff8800', 17), createStop('#ffff00', 33),
        createStop('#00ff00', 50), createStop('#0088ff', 67), createStop('#8800ff', 83), createStop('#ff0000', 100),
      ],
    },
  },
  {
    name: 'Peach',
    state: {
      type: 'linear', angle: 135, radialShape: 'circle', radialPositionX: 50, radialPositionY: 50,
      colorStops: [createStop('#ffecd2', 0), createStop('#fcb69f', 100)],
    },
  },
];

const RANDOM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#82E0AA', '#F8C471', '#AED6F1', '#D7BDE2',
  '#A3E4D7', '#FAD7A0', '#A9CCE3', '#D5F5E3', '#FADBD8',
];

function buildGradientCss(state: GradientState): string {
  const stops = state.colorStops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');

  switch (state.type) {
    case 'linear':
      return `linear-gradient(${state.angle}deg, ${stops})`;
    case 'radial':
      return `radial-gradient(${state.radialShape} at ${state.radialPositionX}% ${state.radialPositionY}%, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${state.angle}deg at ${state.radialPositionX}% ${state.radialPositionY}%, ${stops})`;
  }
}

const DEFAULT_STATE: GradientState = {
  type: 'linear',
  angle: 135,
  radialShape: 'circle',
  radialPositionX: 50,
  radialPositionY: 50,
  colorStops: [createStop('#6366f1', 0), createStop('#ec4899', 100)],
};

export function GradientGeneratorTool() {
  const [state, setState] = useState<GradientState>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const gradientCss = useMemo(() => buildGradientCss(state), [state]);
  const fullCss = `background: ${gradientCss};`;

  const updateState = useCallback((partial: Partial<GradientState>): void => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateColorStop = useCallback((id: string, updates: Partial<ColorStop>): void => {
    setState((prev) => ({
      ...prev,
      colorStops: prev.colorStops.map((stop) =>
        stop.id === id ? { ...stop, ...updates } : stop
      ),
    }));
  }, []);

  const addColorStop = useCallback((): void => {
    setState((prev) => {
      const sorted = prev.colorStops.slice().sort((a, b) => a.position - b.position);
      const lastPos = sorted[sorted.length - 1]?.position ?? 0;
      const firstPos = sorted[0]?.position ?? 0;
      let newPos = Math.round((firstPos + lastPos) / 2);
      if (prev.colorStops.some((s) => s.position === newPos)) {
        newPos = Math.min(100, lastPos + 10);
      }
      const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
      return {
        ...prev,
        colorStops: [...prev.colorStops, createStop(randomColor, newPos)],
      };
    });
  }, []);

  const removeColorStop = useCallback((id: string): void => {
    setState((prev) => {
      if (prev.colorStops.length <= 2) return prev;
      return { ...prev, colorStops: prev.colorStops.filter((s) => s.id !== id) };
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

  const handleRandomGradient = useCallback((): void => {
    const types: GradientType[] = ['linear', 'radial', 'conic'];
    const type = types[Math.floor(Math.random() * types.length)];
    const numStops = 2 + Math.floor(Math.random() * 3);
    const colorStops: ColorStop[] = [];
    for (let i = 0; i < numStops; i++) {
      const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
      const position = Math.round((i / (numStops - 1)) * 100);
      colorStops.push(createStop(color, position));
    }
    setState({
      type,
      angle: Math.round(Math.random() * 360),
      radialShape: Math.random() > 0.5 ? 'circle' : 'ellipse',
      radialPositionX: 50,
      radialPositionY: 50,
      colorStops,
    });
  }, []);

  const applyPreset = useCallback((preset: PresetGradient): void => {
    setState({
      ...preset.state,
      colorStops: preset.state.colorStops.map((s) => ({ ...s, id: createId() })),
    });
  }, []);

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0" style={{ background: gradientCss }} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullScreen(false)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-md"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Exit Full Screen
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Gradient Preview */}
        <div className="relative">
          <div
            className="w-full rounded-t-2xl"
            style={{ background: gradientCss, minHeight: '240px' }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullScreen(true)}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* LEFT PANEL: Controls */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-6">
              {/* Gradient Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Gradient Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENT_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateState({ type: value })}
                      className={cn(
                        'px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200',
                        state.type === value
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle (linear & conic) */}
              {(state.type === 'linear' || state.type === 'conic') && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">
                    Angle: {state.angle}°
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={state.angle}
                    onChange={(e) => updateState({ angle: parseInt(e.target.value) })}
                    aria-label="Gradient angle"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ANGLES.map((a) => (
                      <button
                        key={a}
                        onClick={() => updateState({ angle: a })}
                        className={cn(
                          'px-2 py-1 text-xs rounded-md border transition-all',
                          state.angle === a
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {a}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Radial options */}
              {state.type === 'radial' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Shape</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['circle', 'ellipse'] as const).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => updateState({ radialShape: shape })}
                          className={cn(
                            'px-3 py-2 text-sm font-medium rounded-lg border capitalize transition-all duration-200',
                            state.radialShape === shape
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          )}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Position: {state.radialPositionX}% / {state.radialPositionY}%
                    </Label>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4">X</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={state.radialPositionX}
                          onChange={(e) => updateState({ radialPositionX: parseInt(e.target.value) })}
                          aria-label="Radial position X"
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4">Y</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={state.radialPositionY}
                          onChange={(e) => updateState({ radialPositionY: parseInt(e.target.value) })}
                          aria-label="Radial position Y"
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Position for conic */}
              {state.type === 'conic' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">
                    Position: {state.radialPositionX}% / {state.radialPositionY}%
                  </Label>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">X</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={state.radialPositionX}
                        onChange={(e) => updateState({ radialPositionX: parseInt(e.target.value) })}
                        aria-label="Conic position X"
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">Y</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={state.radialPositionY}
                        onChange={(e) => updateState({ radialPositionY: parseInt(e.target.value) })}
                        aria-label="Conic position Y"
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomGradient}
                  className="flex-1 gap-1.5"
                >
                  <Shuffle className="w-4 h-4" />
                  Random
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(true)}
                  className="flex-1 gap-1.5"
                >
                  <Maximize2 className="w-4 h-4" />
                  Full Screen
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Color Stops, CSS Output, Presets */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50">
            <div className="space-y-6">
              {/* Color Stops */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">Color Stops</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addColorStop}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Stop
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {state.colorStops
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="relative shrink-0">
                        <div
                          className="w-9 h-9 rounded-md border border-gray-200 cursor-pointer"
                          style={{ backgroundColor: stop.color }}
                        />
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={`Color for stop at ${stop.position}%`}
                        />
                      </div>
                      <Input
                        value={stop.color.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            updateColorStop(stop.id, { color: val });
                          }
                        }}
                        className="h-9 w-24 font-mono text-xs uppercase bg-gray-50"
                        maxLength={7}
                      />
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={stop.position}
                          onChange={(e) => updateColorStop(stop.id, { position: parseInt(e.target.value) })}
                          aria-label={`Position for color ${stop.color}`}
                          className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                        />
                        <span className="text-xs text-gray-500 w-8 text-right tabular-nums">
                          {stop.position}%
                        </span>
                      </div>
                      <button
                        onClick={() => removeColorStop(stop.id)}
                        disabled={state.colorStops.length <= 2}
                        className={cn(
                          'p-1.5 rounded-md transition-colors shrink-0',
                          state.colorStops.length <= 2
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        )}
                        aria-label="Remove color stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                  <span className="text-blue-400">background</span>
                  <span className="text-gray-400">: </span>
                  <span className="text-green-400 break-all">{gradientCss}</span>
                  <span className="text-gray-400">;</span>
                </div>
              </div>

              {/* Preset Gradients */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-800">Preset Gradients</Label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_GRADIENTS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all"
                      title={preset.name}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: buildGradientCss(preset.state) }}
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
        </div>
      </div>
    </div>
  );
}
