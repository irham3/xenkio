'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Link, Unlink, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Unit = 'px' | '%' | 'rem' | 'em';

interface BorderRadiusState {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  linked: boolean;
  unit: Unit;
  previewSize: number;
  previewColor: string;
}

interface PresetShape {
  name: string;
  values: [number, number, number, number];
}

const UNITS: Unit[] = ['px', '%', 'rem', 'em'];

const PRESET_SHAPES: PresetShape[] = [
  { name: 'None', values: [0, 0, 0, 0] },
  { name: 'Rounded', values: [8, 8, 8, 8] },
  { name: 'Pill', values: [50, 50, 50, 50] },
  { name: 'Blob', values: [30, 70, 50, 20] },
  { name: 'Leaf', values: [50, 0, 50, 0] },
  { name: 'Drop', values: [50, 50, 0, 50] },
  { name: 'Ticket', values: [12, 12, 0, 0] },
  { name: 'Badge', values: [0, 16, 16, 0] },
  { name: 'Message', values: [16, 16, 16, 0] },
  { name: 'Diamond', values: [10, 50, 10, 50] },
];

const PREVIEW_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#3b82f6', '#8b5cf6', '#ef4444', '#22c55e',
];

const DEFAULT_STATE: BorderRadiusState = {
  topLeft: 16,
  topRight: 16,
  bottomRight: 16,
  bottomLeft: 16,
  linked: true,
  unit: 'px',
  previewSize: 200,
  previewColor: '#6366f1',
};

const MAX_VALUES: Record<Unit, number> = {
  px: 200,
  '%': 50,
  rem: 20,
  em: 20,
};

function buildBorderRadiusCss(state: BorderRadiusState): string {
  const { topLeft, topRight, bottomRight, bottomLeft, unit } = state;
  if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
    return `${topLeft}${unit}`;
  }
  return `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;
}

export function BorderRadiusGeneratorTool() {
  const [state, setState] = useState<BorderRadiusState>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const borderRadiusCss = useMemo(() => buildBorderRadiusCss(state), [state]);
  const fullCss = `border-radius: ${borderRadiusCss};`;

  const maxValue = MAX_VALUES[state.unit];

  const updateCorner = useCallback((corner: keyof Pick<BorderRadiusState, 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'>, value: number): void => {
    setState((prev) => {
      if (prev.linked) {
        return { ...prev, topLeft: value, topRight: value, bottomRight: value, bottomLeft: value };
      }
      return { ...prev, [corner]: value };
    });
  }, []);

  const updateUnit = useCallback((unit: Unit): void => {
    setState((prev) => {
      const newMax = MAX_VALUES[unit];
      const clamp = (v: number): number => Math.min(v, newMax);
      return {
        ...prev,
        unit,
        topLeft: clamp(prev.topLeft),
        topRight: clamp(prev.topRight),
        bottomRight: clamp(prev.bottomRight),
        bottomLeft: clamp(prev.bottomLeft),
      };
    });
  }, []);

  const toggleLinked = useCallback((): void => {
    setState((prev) => ({ ...prev, linked: !prev.linked }));
  }, []);

  const handleReset = useCallback((): void => {
    setState(DEFAULT_STATE);
  }, []);

  const applyPreset = useCallback((preset: PresetShape): void => {
    setState((prev) => ({
      ...prev,
      topLeft: Math.min(preset.values[0], MAX_VALUES[prev.unit]),
      topRight: Math.min(preset.values[1], MAX_VALUES[prev.unit]),
      bottomRight: Math.min(preset.values[2], MAX_VALUES[prev.unit]),
      bottomLeft: Math.min(preset.values[3], MAX_VALUES[prev.unit]),
      linked: false,
    }));
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

  const handleInputChange = useCallback((corner: keyof Pick<BorderRadiusState, 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'>, raw: string): void => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    const clamped = Math.max(0, Math.min(parsed, MAX_VALUES[state.unit]));
    updateCorner(corner, clamped);
  }, [state.unit, updateCorner]);

  const corners: { key: keyof Pick<BorderRadiusState, 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'>; label: string }[] = [
    { key: 'topLeft', label: 'Top Left' },
    { key: 'topRight', label: 'Top Right' },
    { key: 'bottomRight', label: 'Bottom Right' },
    { key: 'bottomLeft', label: 'Bottom Left' },
  ];

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Preview */}
        <div className="flex items-center justify-center bg-gray-50 p-8 md:p-12 min-h-[280px]">
          <div
            className="transition-all duration-300 shadow-lg"
            style={{
              width: `${state.previewSize}px`,
              height: `${state.previewSize}px`,
              borderRadius: borderRadiusCss,
              backgroundColor: state.previewColor,
            }}
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* LEFT PANEL: Controls */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-6">
              {/* Unit Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Unit</Label>
                <div className="grid grid-cols-4 gap-2">
                  {UNITS.map((u) => (
                    <button
                      key={u}
                      onClick={() => updateUnit(u)}
                      className={cn(
                        'px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200',
                        state.unit === u
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link/Unlink Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-800">Corner Values</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLinked}
                  className={cn(
                    'h-8 text-xs gap-1.5 transition-all',
                    state.linked && 'text-primary-600 border-primary-300 bg-primary-50'
                  )}
                >
                  {state.linked ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                  {state.linked ? 'Linked' : 'Unlinked'}
                </Button>
              </div>

              {/* Corner Sliders */}
              <div className="space-y-3">
                {corners.map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{label}</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={state[key]}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="h-7 w-16 text-xs text-center font-mono"
                          min={0}
                          max={maxValue}
                        />
                        <span className="text-xs text-gray-500 w-6">{state.unit}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxValue}
                      value={state[key]}
                      onChange={(e) => updateCorner(key, parseInt(e.target.value))}
                      aria-label={`${label} border radius`}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                    />
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Preview Options, CSS Output, Presets */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50">
            <div className="space-y-6">
              {/* Preview Color */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Preview Color</Label>
                <div className="flex flex-wrap gap-2">
                  {PREVIEW_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setState((prev) => ({ ...prev, previewColor: color }))}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 transition-all duration-200',
                        state.previewColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Set preview color to ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview Size */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">
                  Preview Size: {state.previewSize}px
                </Label>
                <input
                  type="range"
                  min={80}
                  max={300}
                  value={state.previewSize}
                  onChange={(e) => setState((prev) => ({ ...prev, previewSize: parseInt(e.target.value) }))}
                  aria-label="Preview size"
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                />
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
                  <span className="text-blue-400">border-radius</span>
                  <span className="text-gray-400">: </span>
                  <span className="text-green-400 break-all">{borderRadiusCss}</span>
                  <span className="text-gray-400">;</span>
                </div>
              </div>

              {/* Preset Shapes */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-800">Preset Shapes</Label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_SHAPES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="group relative flex flex-col items-center gap-1.5 p-2 rounded-lg border border-gray-200 hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all bg-white"
                      title={preset.name}
                    >
                      <div
                        className="w-10 h-10 bg-primary-400 transition-all duration-200"
                        style={{
                          borderRadius: `${preset.values[0]}${state.unit} ${preset.values[1]}${state.unit} ${preset.values[2]}${state.unit} ${preset.values[3]}${state.unit}`,
                        }}
                      />
                      <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-800 truncate w-full text-center">
                        {preset.name}
                      </span>
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
