'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type TriangleDirection =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface TriangleState {
  direction: TriangleDirection;
  width: number;
  height: number;
  color: string;
}

const DIRECTIONS: { value: TriangleDirection; label: string; arrow: string }[] = [
  { value: 'top', label: 'Top', arrow: '▲' },
  { value: 'right', label: 'Right', arrow: '▶' },
  { value: 'bottom', label: 'Bottom', arrow: '▼' },
  { value: 'left', label: 'Left', arrow: '◀' },
  { value: 'top-left', label: 'Top Left', arrow: '◤' },
  { value: 'top-right', label: 'Top Right', arrow: '◥' },
  { value: 'bottom-left', label: 'Bottom Left', arrow: '◣' },
  { value: 'bottom-right', label: 'Bottom Right', arrow: '◢' },
];

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#64748b',
];

const MIN_DIMENSION = 1;
const MAX_DIMENSION = 500;
const SLIDER_MIN = 10;
const SLIDER_MAX = 300;

const DEFAULT_STATE: TriangleState = {
  direction: 'top',
  width: 100,
  height: 100,
  color: '#6366f1',
};

function buildTriangleCss(state: TriangleState): Record<string, string> {
  const { direction, width, height, color } = state;
  const halfW = Math.round(width / 2);
  const halfH = Math.round(height / 2);

  const base: Record<string, string> = {
    width: '0',
    height: '0',
  };

  switch (direction) {
    case 'top':
      return {
        ...base,
        'border-left': `${halfW}px solid transparent`,
        'border-right': `${halfW}px solid transparent`,
        'border-bottom': `${height}px solid ${color}`,
      };
    case 'right':
      return {
        ...base,
        'border-top': `${halfH}px solid transparent`,
        'border-bottom': `${halfH}px solid transparent`,
        'border-left': `${width}px solid ${color}`,
      };
    case 'bottom':
      return {
        ...base,
        'border-left': `${halfW}px solid transparent`,
        'border-right': `${halfW}px solid transparent`,
        'border-top': `${height}px solid ${color}`,
      };
    case 'left':
      return {
        ...base,
        'border-top': `${halfH}px solid transparent`,
        'border-bottom': `${halfH}px solid transparent`,
        'border-right': `${width}px solid ${color}`,
      };
    case 'top-left':
      return {
        ...base,
        'border-top': `${height}px solid ${color}`,
        'border-right': `${width}px solid transparent`,
      };
    case 'top-right':
      return {
        ...base,
        'border-top': `${height}px solid ${color}`,
        'border-left': `${width}px solid transparent`,
      };
    case 'bottom-left':
      return {
        ...base,
        'border-bottom': `${height}px solid ${color}`,
        'border-right': `${width}px solid transparent`,
      };
    case 'bottom-right':
      return {
        ...base,
        'border-bottom': `${height}px solid ${color}`,
        'border-left': `${width}px solid transparent`,
      };
  }
}

function cssObjectToString(css: Record<string, string>): string {
  return Object.entries(css)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join('\n');
}

function cssObjectToInlineStyle(css: Record<string, string>): React.CSSProperties {
  const styleMap: Record<string, string> = {
    width: 'width',
    height: 'height',
    'border-left': 'borderLeft',
    'border-right': 'borderRight',
    'border-top': 'borderTop',
    'border-bottom': 'borderBottom',
  };

  const style: Record<string, string> = {};
  for (const [prop, val] of Object.entries(css)) {
    const camel = styleMap[prop] || prop;
    style[camel] = val;
  }
  return style as React.CSSProperties;
}

export function CssTriangleTool() {
  const [state, setState] = useState<TriangleState>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const triangleCss = useMemo(() => buildTriangleCss(state), [state]);
  const cssString = useMemo(() => cssObjectToString(triangleCss), [triangleCss]);
  const inlineStyle = useMemo(() => cssObjectToInlineStyle(triangleCss), [triangleCss]);

  const updateState = useCallback((partial: Partial<TriangleState>): void => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(cssString);
      setCopied(true);
      toast.success('CSS copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy CSS');
    }
  }, [cssString]);

  const handleReset = useCallback((): void => {
    setState(DEFAULT_STATE);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Triangle Preview */}
        <div className="relative">
          <div className="w-full rounded-t-2xl bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px] flex items-center justify-center" style={{ minHeight: '240px' }}>
            <div style={inlineStyle} />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* LEFT PANEL: Controls */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-6">
              {/* Direction */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Direction</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DIRECTIONS.map(({ value, label, arrow }) => (
                    <button
                      key={value}
                      onClick={() => updateState({ direction: value })}
                      title={label}
                      className={cn(
                        'px-2 py-2 text-sm font-medium rounded-lg border transition-all duration-200 flex flex-col items-center gap-0.5',
                        state.direction === value
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <span className="text-base leading-none">{arrow}</span>
                      <span className="text-[10px] leading-none">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Width */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">
                  Width: {state.width}px
                </Label>
                <input
                  type="range"
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  value={state.width}
                  onChange={(e) => updateState({ width: parseInt(e.target.value) })}
                  aria-label="Triangle width"
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                />
                <Input
                  type="number"
                  min={MIN_DIMENSION}
                  max={MAX_DIMENSION}
                  value={state.width}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v > 0) updateState({ width: Math.min(MAX_DIMENSION, v) });
                  }}
                  className="h-9 w-24 font-mono text-xs"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">
                  Height: {state.height}px
                </Label>
                <input
                  type="range"
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  value={state.height}
                  onChange={(e) => updateState({ height: parseInt(e.target.value) })}
                  aria-label="Triangle height"
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                />
                <Input
                  type="number"
                  min={MIN_DIMENSION}
                  max={MAX_DIMENSION}
                  value={state.height}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v > 0) updateState({ height: Math.min(MAX_DIMENSION, v) });
                  }}
                  className="h-9 w-24 font-mono text-xs"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Color</Label>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <div
                      className="w-9 h-9 rounded-md border border-gray-200 cursor-pointer"
                      style={{ backgroundColor: state.color }}
                    />
                    <input
                      type="color"
                      value={state.color}
                      onChange={(e) => updateState({ color: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Triangle color"
                    />
                  </div>
                  <Input
                    value={state.color.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                        updateState({ color: val });
                      }
                    }}
                    className="h-9 w-28 font-mono text-xs uppercase bg-gray-50"
                    maxLength={7}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateState({ color: c })}
                      className={cn(
                        'w-7 h-7 rounded-md border transition-all',
                        state.color === c
                          ? 'ring-2 ring-primary-500 ring-offset-1 border-primary-500'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                      style={{ backgroundColor: c }}
                      title={c}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
              </div>

              {/* Reset button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL: CSS Output */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50">
            <div className="space-y-6">
              {/* CSS Output */}
              <div className="space-y-2">
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
                  {Object.entries(triangleCss).map(([prop, val]) => (
                    <div key={prop}>
                      <span className="text-blue-400">{prop}</span>
                      <span className="text-gray-400">: </span>
                      <span className="text-green-400">{val}</span>
                      <span className="text-gray-400">;</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direction Quick Reference */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-800">Quick Reference</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DIRECTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateState({ direction: value })}
                      className={cn(
                        'group relative aspect-square rounded-lg border overflow-hidden flex items-center justify-center transition-all hover:ring-2 hover:ring-primary-500 hover:ring-offset-1',
                        state.direction === value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white'
                      )}
                      title={label}
                    >
                      <div
                        style={cssObjectToInlineStyle(
                          buildTriangleCss({ direction: value, width: 24, height: 24, color: state.direction === value ? '#6366f1' : '#9ca3af' })
                        )}
                      />
                      <div className="absolute inset-x-0 bottom-0 px-1 py-0.5">
                        <span className={cn(
                          'text-[10px] font-medium truncate block text-center',
                          state.direction === value ? 'text-primary-600' : 'text-gray-500'
                        )}>
                          {label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-800">How It Works</Label>
                <p className="text-xs text-gray-500 leading-relaxed">
                  CSS triangles are created using the border trick: an element with zero width and height, where
                  one border is colored and the adjacent borders are transparent. The colored border forms the
                  triangle shape, and the size is controlled by the border widths.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
