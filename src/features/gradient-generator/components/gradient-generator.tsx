'use client';

import { useState, useRef, useCallback } from 'react';
import { useGradientGenerator } from '../hooks/use-gradient-generator';
import { GRADIENT_PRESETS, MAX_STOPS, MIN_STOPS } from '../constants';
import { GradientType } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, Copy, Check, Plus, Trash2, RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

const GRADIENT_TYPES: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
];

export function GradientGenerator() {
  const {
    config,
    setType,
    setAngle,
    updateStop,
    addStop,
    removeStop,
    applyPreset,
    randomize,
    cssOutput,
    fullCss,
    tailwindClass,
  } = useGradientGenerator();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCopy = useCallback(async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, []);

  const handleDownloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    let gradient: CanvasGradient;

    const centerX = width / 2;
    const centerY = height / 2;

    if (config.type === 'linear') {
      const angleRad = (config.angle * Math.PI) / 180;
      const len = Math.sqrt(width * width + height * height) / 2;
      const x1 = centerX - Math.cos(angleRad) * len;
      const y1 = centerY - Math.sin(angleRad) * len;
      const x2 = centerX + Math.cos(angleRad) * len;
      const y2 = centerY + Math.sin(angleRad) * len;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    } else if (config.type === 'radial') {
      gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
    } else {
      gradient = ctx.createConicGradient((config.angle * Math.PI) / 180, centerX, centerY);
    }

    config.stops.forEach((stop) => {
      gradient.addColorStop(stop.position / 100, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, 'gradient.png');
        toast.success('Downloaded gradient as PNG!');
      }
    }, 'image/png');
  }, [config]);

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Gradient Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
              Gradient Type
            </h2>
            <div className="space-y-5">
              <div className="flex gap-2">
                {GRADIENT_TYPES.map((gt) => (
                  <Button
                    key={gt.value}
                    variant={config.type === gt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setType(gt.value)}
                    className="flex-1"
                  >
                    {gt.label}
                  </Button>
                ))}
              </div>
              {(config.type === 'linear' || config.type === 'conic') && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">
                    Angle: {config.angle}°
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={config.angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    aria-label="Gradient angle"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    style={{
                      background: `linear-gradient(to right, #e5e7eb, #6366f1)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0°</span>
                    <span>90°</span>
                    <span>180°</span>
                    <span>270°</span>
                    <span>360°</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Color Stops */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
              Color Stops
            </h2>
            <div className="space-y-3">
              {config.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-medium text-gray-400 w-4">{index + 1}</span>
                  <div className="relative">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStop(stop.id, { color: e.target.value.toUpperCase() })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      aria-label={`Color for stop ${index + 1}`}
                    />
                  </div>
                  <Input
                    value={stop.color}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (/^#[0-9A-F]{0,6}$/.test(val) || val === '') {
                        updateStop(stop.id, { color: val || '#' });
                      }
                    }}
                    className="w-24 font-mono text-sm uppercase bg-white"
                    maxLength={7}
                  />
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) => updateStop(stop.id, { position: parseInt(e.target.value) })}
                      aria-label={`Position for stop ${index + 1}`}
                      className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) =>
                        updateStop(stop.id, {
                          position: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                        })
                      }
                      className="w-16 text-center font-mono text-sm bg-white"
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStop(stop.id)}
                    disabled={config.stops.length <= MIN_STOPS}
                    className="shrink-0 h-8 w-8 text-gray-400 hover:text-red-500"
                    aria-label={`Remove stop ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addStop}
                disabled={config.stops.length >= MAX_STOPS}
                className="w-full mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Color Stop
              </Button>
            </div>
          </div>

          {/* Section 3: Presets */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">3</span>
              Presets
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GRADIENT_PRESETS.map((preset) => {
                const previewStops = preset.config.stops
                  .map((s) => `${s.color} ${s.position}%`)
                  .join(', ');
                const previewBg =
                  preset.config.type === 'linear'
                    ? `linear-gradient(${preset.config.angle}deg, ${previewStops})`
                    : preset.config.type === 'radial'
                      ? `radial-gradient(circle, ${previewStops})`
                      : `conic-gradient(from ${preset.config.angle}deg, ${previewStops})`;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.config)}
                    className="group rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-all hover:shadow-md"
                  >
                    <div
                      className="h-16 w-full"
                      style={{ background: previewBg }}
                    />
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-600 bg-white group-hover:text-gray-900 transition-colors">
                      {preset.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Generated CSS */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">4</span>
              Generated Code
            </h2>
            <div className="space-y-4">
              {/* CSS Output */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">CSS</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 break-all">
                    {fullCss}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy('css', fullCss)}
                    className={cn(
                      'shrink-0 transition-all',
                      copiedField === 'css' && 'text-green-600 border-green-500 bg-green-50'
                    )}
                  >
                    {copiedField === 'css' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Tailwind Output */}
              {tailwindClass && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">Tailwind CSS</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 break-all">
                      {tailwindClass}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy('tailwind', tailwindClass)}
                      className={cn(
                        'shrink-0 transition-all',
                        copiedField === 'tailwind' && 'text-green-600 border-green-500 bg-green-50'
                      )}
                    >
                      {copiedField === 'tailwind' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Column (Sticky) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-600" />
                Preview
              </h2>
              <div
                className="w-full aspect-square rounded-xl border border-gray-200 shadow-inner"
                style={{ background: cssOutput }}
              />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={randomize}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Randomize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPng}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleCopy('css-full', fullCss)}
                className="w-full mt-2"
              >
                {copiedField === 'css-full' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy CSS
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
