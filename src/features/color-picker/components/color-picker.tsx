'use client';

import { useState, useRef } from 'react';
import { useColorPicker } from '../hooks/use-color-picker';
import { PRESET_COLORS } from '../constants';
import { isValidHex, getContrastColor, rgbToHex, hslToRgb } from '../lib/color-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Pipette, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ColorPicker() {
  const {
    color,
    recentColors,
    updateFromHex,
    updateFromRgb,
    updateFromHsl,
    addToRecent,
    copyToClipboard,
  } = useColorPicker();

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState(color.hex);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      updateFromHex(value);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value.toUpperCase();
    setHexInput(newHex);
    updateFromHex(newHex);
  };

  const handleCopy = async (format: string, value: string) => {
    await copyToClipboard(value);
    addToRecent(color.hex);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handlePresetClick = (hex: string) => {
    setHexInput(hex);
    updateFromHex(hex);
    addToRecent(hex);
  };

  const handleRecentClick = (hex: string) => {
    setHexInput(hex);
    updateFromHex(hex);
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...color.rgb, [channel]: value };
    updateFromRgb(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (channel: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...color.hsl, [channel]: value };
    updateFromHsl(newHsl.h, newHsl.s, newHsl.l);
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const hexString = color.hex;
  const rgbString = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const hslString = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-5 gap-0">
          {/* LEFT PANEL: Color Selection */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-6">
              {/* Color Preview with Native Picker */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800">Selected Color</Label>
                <div
                  className="relative w-full h-32 rounded-xl border border-gray-200 cursor-pointer overflow-hidden group"
                  onClick={() => colorInputRef.current?.click()}
                >
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded-full shadow-sm">
                      <Pipette className="w-4 h-4" />
                      <span className="text-sm font-medium">Click to pick</span>
                    </div>
                  </div>
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={color.hex}
                    onChange={handleNativeColorChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* HEX Input */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">HEX Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value.toUpperCase())}
                    onBlur={() => {
                      if (!isValidHex(hexInput)) {
                        setHexInput(color.hex);
                      }
                    }}
                    placeholder="#000000"
                    className="font-mono text-sm uppercase bg-gray-50 focus:bg-white"
                    maxLength={7}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy('hex', hexString)}
                    className={cn(
                      "shrink-0 transition-all",
                      copiedFormat === 'hex' && "text-success-600 border-success-500 bg-success-50"
                    )}
                  >
                    {copiedFormat === 'hex' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Preset Colors */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Preset Colors</Label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((presetHex) => (
                    <button
                      key={presetHex}
                      onClick={() => handlePresetClick(presetHex)}
                      className={cn(
                        "w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105",
                        color.hex === presetHex
                          ? "border-gray-800 ring-2 ring-gray-800/20"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ backgroundColor: presetHex }}
                      title={presetHex}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Colors */}
              {recentColors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Recent Colors
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {recentColors.map((recentHex, index) => (
                      <button
                        key={`${recentHex}-${index}`}
                        onClick={() => handleRecentClick(recentHex)}
                        className={cn(
                          "w-8 h-8 rounded-md border-2 transition-all duration-200 hover:scale-110",
                          color.hex === recentHex
                            ? "border-gray-800"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        style={{ backgroundColor: recentHex }}
                        title={recentHex}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Color Values */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col border-l border-gray-100">
            <div className="space-y-6">
              {/* Color Display Banner */}
              <div
                className="w-full h-20 rounded-xl flex items-center justify-center shadow-sm border border-gray-200"
                style={{ backgroundColor: color.hex }}
              >
                <span
                  className="text-lg font-semibold tracking-wide"
                  style={{ color: getContrastColor(color.hex) }}
                >
                  {color.hex}
                </span>
              </div>

              {/* RGB Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">RGB</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('rgb', rgbString)}
                    className={cn(
                      "h-7 text-xs gap-1.5",
                      copiedFormat === 'rgb' && "text-success-600"
                    )}
                  >
                    {copiedFormat === 'rgb' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {rgbString}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['r', 'g', 'b'] as const).map((channel) => (
                    <div key={channel} className="space-y-1">
                      <Label className="text-xs font-medium text-gray-500 uppercase">{channel}</Label>
                      <Input
                        type="number"
                        min={0}
                        max={255}
                        value={color.rgb[channel]}
                        onChange={(e) => handleRgbChange(channel, Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="h-9 bg-white text-center font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['r', 'g', 'b'] as const).map((channel) => (
                    <input
                      key={`slider-${channel}`}
                      type="range"
                      min={0}
                      max={255}
                      value={color.rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, parseInt(e.target.value))}
                      className={cn(
                        "w-full h-2 rounded-lg appearance-none cursor-pointer",
                        channel === 'r' && "accent-red-500",
                        channel === 'g' && "accent-green-500",
                        channel === 'b' && "accent-blue-500"
                      )}
                      style={{
                        background: channel === 'r'
                          ? `linear-gradient(to right, rgb(0, ${color.rgb.g}, ${color.rgb.b}), rgb(255, ${color.rgb.g}, ${color.rgb.b}))`
                          : channel === 'g'
                            ? `linear-gradient(to right, rgb(${color.rgb.r}, 0, ${color.rgb.b}), rgb(${color.rgb.r}, 255, ${color.rgb.b}))`
                            : `linear-gradient(to right, rgb(${color.rgb.r}, ${color.rgb.g}, 0), rgb(${color.rgb.r}, ${color.rgb.g}, 255))`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* HSL Controls */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">HSL</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('hsl', hslString)}
                    className={cn(
                      "h-7 text-xs gap-1.5",
                      copiedFormat === 'hsl' && "text-success-600"
                    )}
                  >
                    {copiedFormat === 'hsl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {hslString}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase">H</Label>
                    <Input
                      type="number"
                      min={0}
                      max={360}
                      value={color.hsl.h}
                      onChange={(e) => handleHslChange('h', Math.min(360, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="h-9 bg-white text-center font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase">S</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={color.hsl.s}
                      onChange={(e) => handleHslChange('s', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="h-9 bg-white text-center font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase">L</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={color.hsl.l}
                      onChange={(e) => handleHslChange('l', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="h-9 bg-white text-center font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={color.hsl.h}
                    onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))'
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={color.hsl.s}
                    onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(${color.hsl.h}, 0%, ${color.hsl.l}%), hsl(${color.hsl.h}, 100%, ${color.hsl.l}%))`
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={color.hsl.l}
                    onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(${color.hsl.h}, ${color.hsl.s}%, 0%), hsl(${color.hsl.h}, ${color.hsl.s}%, 50%), hsl(${color.hsl.h}, ${color.hsl.s}%, 100%))`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
