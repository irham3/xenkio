'use client';

import { useState, useRef, useCallback } from 'react';
import { useColorPicker } from '../hooks/use-color-picker';
import { PRESET_COLORS } from '../constants';
import { formatRgb, formatHsl, getContrastColor, isValidHex, colorFromHex, colorFromRgb, colorFromHsl } from '../lib/color-utils';
import { Button } from '@/components/ui/button';
import { Copy, Check, Pipette, Trash2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorFormat, RGBColor, HSLColor } from '../types';

export function ColorPicker() {
  const {
    currentColor,
    history,
    activeFormat,
    setActiveFormat,
    setColorFromHex,
    setColorFromRgb,
    setColorFromHsl,
    setColor,
    selectColor,
    addToHistory,
    removeFromHistory,
    clearHistory,
  } = useColorPicker();

  const [copied, setCopied] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState(currentColor.hex);
  const [hasImage, setHasImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCopy = async (text: string, format: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      setColorFromHex(value);
    }
  };

  const handleHexBlur = () => {
    if (isValidHex(hexInput)) {
      addToHistory(currentColor);
    }
    setHexInput(currentColor.hex);
  };

  const handleRgbChange = (component: keyof RGBColor, value: number) => {
    const newRgb = { ...currentColor.rgb, [component]: Math.max(0, Math.min(255, value)) };
    const newColor = colorFromRgb(newRgb);
    setColorFromRgb(newRgb);
    setHexInput(newColor.hex);
  };

  const handleHslChange = (component: keyof HSLColor, value: number) => {
    const max = component === 'h' ? 360 : 100;
    const newHsl = { ...currentColor.hsl, [component]: Math.max(0, Math.min(max, value)) };
    const newColor = colorFromHsl(newHsl);
    setColorFromHsl(newHsl);
    setHexInput(newColor.hex);
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexInput(hex.toUpperCase());
    setColorFromHex(hex);
  };

  const handleNativeColorBlur = () => {
    addToHistory(currentColor);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (event) => {
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setHasImage(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset file input so the same file can be uploaded again
    e.target.value = '';
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hexString = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`.toUpperCase();
    const newColor = colorFromHex(hexString);
    setColor(newColor);
    setHexInput(hexString);
  }, [setColor]);

  const getDisplayValue = () => {
    switch (activeFormat) {
      case 'hex': return currentColor.hex;
      case 'rgb': return formatRgb(currentColor.rgb);
      case 'hsl': return formatHsl(currentColor.hsl);
    }
  };

  const contrastColor = getContrastColor(currentColor.rgb);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Color Display & Controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Color Preview Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div 
            className="h-48 md:h-64 w-full transition-colors duration-300 relative group cursor-pointer"
            style={{ backgroundColor: currentColor.hex }}
          >
            {/* Hidden native color input */}
            <input
              type="color"
              value={currentColor.hex}
              onChange={handleNativeColorChange}
              onBlur={handleNativeColorBlur}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Click to pick a color"
            />
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: contrastColor }}
            >
              <div className="flex flex-col items-center gap-2">
                <Pipette className="h-8 w-8" />
                <span className="text-sm font-medium">Click to pick color</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Format Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
              {(['hex', 'rgb', 'hsl'] as ColorFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setActiveFormat(format)}
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all uppercase",
                    activeFormat === format
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {format}
                </button>
              ))}
            </div>

            {/* Color Value Display */}
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                key={getDisplayValue()}
                initial={{ opacity: 0.5, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 font-mono text-2xl md:text-3xl font-bold text-gray-800"
              >
                {getDisplayValue()}
              </motion.div>
              <Button
                size="lg"
                onClick={() => handleCopy(getDisplayValue(), activeFormat)}
                className={cn(
                  "rounded-xl px-6 h-12 font-semibold transition-all",
                  copied === activeFormat
                    ? "bg-success-100 text-success-700 border-2 border-success-200"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                {copied === activeFormat ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Quick Copy All Formats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { format: 'hex' as const, value: currentColor.hex },
                { format: 'rgb' as const, value: formatRgb(currentColor.rgb) },
                { format: 'hsl' as const, value: formatHsl(currentColor.hsl) },
              ].map(({ format, value }) => (
                <button
                  key={format}
                  onClick={() => handleCopy(value, format)}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-left group",
                    copied === format
                      ? "border-success-300 bg-success-50"
                      : "border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                  )}
                >
                  <span className="text-xs font-medium text-gray-500 uppercase block mb-1">{format}</span>
                  <span className="text-sm font-mono text-gray-700 truncate block">{value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Adjustments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Adjust Color</h3>
          
          {/* HEX Input */}
          <div className="space-y-4 mb-8">
            <label className="text-sm font-medium text-gray-700">HEX Value</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
                onBlur={handleHexBlur}
                maxLength={7}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-mono text-lg focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="#000000"
              />
              <div 
                className="w-14 h-14 rounded-xl border-2 border-gray-200 flex-shrink-0"
                style={{ backgroundColor: currentColor.hex }}
              />
            </div>
          </div>

          {/* RGB Sliders */}
          <div className="space-y-6 mb-8">
            <h4 className="text-sm font-medium text-gray-700">RGB</h4>
            {[
              { key: 'r' as const, label: 'Red', color: 'bg-red-500' },
              { key: 'g' as const, label: 'Green', color: 'bg-green-500' },
              { key: 'b' as const, label: 'Blue', color: 'bg-blue-500' },
            ].map(({ key, label, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{label}</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={currentColor.rgb[key]}
                    onChange={(e) => handleRgbChange(key, parseInt(e.target.value) || 0)}
                    onBlur={() => addToHistory(currentColor)}
                    aria-label={`${label} value`}
                    className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center font-mono focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentColor.rgb[key]}
                  onChange={(e) => handleRgbChange(key, parseInt(e.target.value))}
                  onMouseUp={() => addToHistory(currentColor)}
                  onTouchEnd={() => addToHistory(currentColor)}
                  aria-label={`${label} slider`}
                  className={cn("w-full h-2 rounded-lg appearance-none cursor-pointer", color)}
                  style={{ 
                    background: `linear-gradient(to right, #000 0%, ${key === 'r' ? '#f00' : key === 'g' ? '#0f0' : '#00f'} 100%)`
                  }}
                />
              </div>
            ))}
          </div>

          {/* HSL Sliders */}
          <div className="space-y-6">
            <h4 className="text-sm font-medium text-gray-700">HSL</h4>
            {[
              { key: 'h' as const, label: 'Hue', max: 360 },
              { key: 's' as const, label: 'Saturation', max: 100 },
              { key: 'l' as const, label: 'Lightness', max: 100 },
            ].map(({ key, label, max }) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{label}</span>
                  <input
                    type="number"
                    min="0"
                    max={max}
                    value={currentColor.hsl[key]}
                    onChange={(e) => handleHslChange(key, parseInt(e.target.value) || 0)}
                    onBlur={() => addToHistory(currentColor)}
                    aria-label={`${label} value`}
                    className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center font-mono focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={max}
                  value={currentColor.hsl[key]}
                  onChange={(e) => handleHslChange(key, parseInt(e.target.value))}
                  onMouseUp={() => addToHistory(currentColor)}
                  onTouchEnd={() => addToHistory(currentColor)}
                  aria-label={`${label} slider`}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: key === 'h' 
                      ? 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)'
                      : key === 's'
                      ? `linear-gradient(to right, hsl(${currentColor.hsl.h}, 0%, ${currentColor.hsl.l}%), hsl(${currentColor.hsl.h}, 100%, ${currentColor.hsl.l}%))`
                      : `linear-gradient(to right, #000, hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, 50%), #fff)`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Image Color Picker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pick from Image</h3>
          <p className="text-sm text-gray-500 mb-4">Upload an image and click anywhere to pick a color</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            aria-label="Upload image to pick colors"
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full mb-4 h-12 border-2 border-dashed border-gray-300 hover:border-primary-400"
          >
            <Pipette className="mr-2 h-5 w-5" />
            Upload Image
          </Button>
          
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            role="img"
            aria-label="Color picker canvas - click to select a color from the image"
            className="w-full max-h-64 object-contain rounded-xl cursor-crosshair border border-gray-200"
            style={{ display: hasImage ? 'block' : 'none' }}
          />
        </div>
      </div>

      {/* Sidebar - Presets & History */}
      <div className="space-y-6">
        {/* Preset Colors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-700 mb-4">Presets</h3>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => {
                  selectColor(color);
                  setHexInput(color.hex);
                }}
                aria-label={`Select color ${color.hex}`}
                className={cn(
                  "aspect-square rounded-xl transition-all hover:scale-110 border-2",
                  currentColor.hex === color.hex ? "border-gray-800 ring-2 ring-offset-2 ring-gray-400" : "border-white shadow-sm"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.hex}
              />
            ))}
          </div>
        </div>

        {/* Color History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-auto max-h-[500px]">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-error-500 transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {history.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-gray-400 p-4">
                <Pipette className="h-10 w-10 mb-3 opacity-10" />
                <p className="text-sm font-medium">No history yet</p>
                <p className="text-xs opacity-70 mt-1">Pick colors to build history</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => {
                      selectColor(item.color);
                      setHexInput(item.color.hex);
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: item.color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-gray-700 truncate">{item.color.hex}</p>
                      <p className="text-xs text-gray-400 truncate">{formatRgb(item.color.rgb)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.color.hex, item.id);
                      }}
                      aria-label="Copy color"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {copied === item.id ? (
                        <Check className="h-4 w-4 text-success-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.id);
                      }}
                      aria-label="Remove from history"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-error-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-error-500" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
