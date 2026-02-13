'use client';

import { useState, useRef, useCallback } from 'react';
import { useColorPalette } from '../hooks/use-color-palette';
import { HARMONY_TYPES } from '../constants';
import { paletteToCssVariables, paletteToTailwindColors } from '../lib/palette-utils';
import { isValidHex, getContrastColor } from '@/features/color-picker/lib/color-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ColorPaletteGenerator() {
  const {
    baseColor,
    harmonyType,
    palette,
    setHarmonyType,
    updateBaseFromHex,
    randomize,
    copyToClipboard,
  } = useColorPalette();

  const [hexInput, setHexInput] = useState(baseColor.hex);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      updateBaseFromHex(value);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value.toUpperCase();
    setHexInput(newHex);
    updateBaseFromHex(newHex);
  };

  const handleRandomize = () => {
    const newHex = randomize();
    setHexInput(newHex);
  };

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyCssVars = async () => {
    const css = paletteToCssVariables(palette);
    await handleCopy('css', css);
  };

  const handleCopyTailwind = async () => {
    const tw = paletteToTailwindColors(palette);
    await handleCopy('tailwind', tw);
  };

  const handleExportPng = useCallback(() => {
    const canvas = document.createElement('canvas');
    const count = palette.length;
    const swatchW = 200;
    const swatchH = 200;
    const infoH = 80;
    canvas.width = swatchW * count;
    canvas.height = swatchH + infoH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    palette.forEach((item, i) => {
      const x = i * swatchW;
      ctx.fillStyle = item.color.hex;
      ctx.fillRect(x, 0, swatchW, swatchH);

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(item.color.hex, x + 12, swatchH + 24);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#666666';
      const { r, g, b } = item.color.rgb;
      ctx.fillText(`rgb(${r}, ${g}, ${b})`, x + 12, swatchH + 44);
      const { h, s, l } = item.color.hsl;
      ctx.fillText(`hsl(${h}, ${s}%, ${l}%)`, x + 12, swatchH + 62);
    });

    const link = document.createElement('a');
    link.download = `palette-${harmonyType}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Palette exported as PNG!');
  }, [palette, harmonyType]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Base Color Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
          Choose Base Color
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">Color Picker</Label>
            <div
              className="relative w-16 h-10 rounded-lg border border-gray-200 cursor-pointer overflow-hidden"
              onClick={() => colorInputRef.current?.click()}
            >
              <div className="absolute inset-0" style={{ backgroundColor: baseColor.hex }} />
              <input
                ref={colorInputRef}
                type="color"
                value={baseColor.hex}
                onChange={handleNativeColorChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">HEX Code</Label>
            <Input
              value={hexInput}
              onChange={(e) => handleHexInputChange(e.target.value.toUpperCase())}
              onBlur={() => {
                if (!isValidHex(hexInput)) {
                  setHexInput(baseColor.hex);
                }
              }}
              placeholder="#000000"
              className="w-32 font-mono text-sm uppercase bg-gray-50 focus:bg-white"
              maxLength={7}
            />
          </div>
          <Button variant="outline" onClick={handleRandomize} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Randomize
          </Button>
        </div>
      </div>

      {/* Harmony Type Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
          Select Harmony
        </h2>
        <div className="flex flex-wrap gap-2">
          {HARMONY_TYPES.map((ht) => (
            <Button
              key={ht.value}
              variant={harmonyType === ht.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHarmonyType(ht.value)}
            >
              {ht.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Palette Display */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">3</span>
          <Palette className="w-5 h-5" />
          Generated Palette
        </h2>

        {/* Swatches */}
        <div ref={paletteRef} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${palette.length}, minmax(0, 1fr))` }}>
          {palette.map((item, i) => {
            const contrast = getContrastColor(item.color.hex);
            const hexId = `hex-${i}`;
            const rgbId = `rgb-${i}`;
            const hslId = `hsl-${i}`;
            const { r, g, b } = item.color.rgb;
            const { h, s, l } = item.color.hsl;
            const rgbStr = `rgb(${r}, ${g}, ${b})`;
            const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

            return (
              <div key={i} className="space-y-2">
                <button
                  className="w-full aspect-square rounded-xl border border-gray-200 flex items-center justify-center text-sm font-bold transition-transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: item.color.hex, color: contrast }}
                  onClick={() => handleCopy(hexId, item.color.hex)}
                  title="Click to copy HEX"
                >
                  {copiedId === hexId ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{item.color.hex}</span>
                  )}
                </button>
                <div className="text-xs text-center font-medium text-gray-700">{item.name}</div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCopy(rgbId, rgbStr)}
                    className={cn(
                      "w-full flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-mono bg-gray-50 hover:bg-gray-100 transition-colors",
                      copiedId === rgbId && "bg-green-50 text-green-700"
                    )}
                  >
                    <span className="truncate">{rgbStr}</span>
                    {copiedId === rgbId ? <Check className="w-3 h-3 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                  </button>
                  <button
                    onClick={() => handleCopy(hslId, hslStr)}
                    className={cn(
                      "w-full flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-mono bg-gray-50 hover:bg-gray-100 transition-colors",
                      copiedId === hslId && "bg-green-50 text-green-700"
                    )}
                  >
                    <span className="truncate">{hslStr}</span>
                    {copiedId === hslId ? <Check className="w-3 h-3 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">4</span>
          Export Palette
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleCopyCssVars} className="gap-2">
            {copiedId === 'css' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy as CSS Variables
          </Button>
          <Button variant="outline" onClick={handleCopyTailwind} className="gap-2">
            {copiedId === 'tailwind' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy as Tailwind Colors
          </Button>
          <Button variant="outline" onClick={handleExportPng} className="gap-2">
            <Download className="w-4 h-4" />
            Export as PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
