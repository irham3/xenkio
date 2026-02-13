'use client';

import { useState } from 'react';
import { useContrastChecker } from '../hooks/use-contrast-checker';
import { isValidHex } from '@/features/color-picker/lib/color-utils';
import { suggestAccessibleColor } from '../lib/contrast-utils';
import { WCAG_LABELS } from '../constants';
import { WcagResult } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeftRight, Check, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function ContrastChecker() {
  const { state, updateForeground, updateBackground, swapColors } = useContrastChecker();
  const { foreground, background, result } = state;

  const [fgInput, setFgInput] = useState(foreground);
  const [bgInput, setBgInput] = useState(background);

  const handleFgChange = (value: string) => {
    const upper = value.toUpperCase();
    setFgInput(upper);
    if (isValidHex(upper)) {
      updateForeground(upper.startsWith('#') ? upper : '#' + upper);
    }
  };

  const handleBgChange = (value: string) => {
    const upper = value.toUpperCase();
    setBgInput(upper);
    if (isValidHex(upper)) {
      updateBackground(upper.startsWith('#') ? upper : '#' + upper);
    }
  };

  const handleNativeFgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setFgInput(hex);
    updateForeground(hex);
  };

  const handleNativeBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setBgInput(hex);
    updateBackground(hex);
  };

  const handleSwap = () => {
    swapColors();
    setFgInput(background);
    setBgInput(foreground);
  };

  const handleCopyRatio = async () => {
    try {
      await navigator.clipboard.writeText(`${result.ratio.toFixed(2)}:1`);
      toast.success('Contrast ratio copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSuggest = () => {
    const suggested = suggestAccessibleColor(foreground, background);
    if (suggested !== foreground) {
      updateForeground(suggested);
      setFgInput(suggested);
      toast.success(`Suggested color: ${suggested}`);
    } else {
      toast.info('Colors already meet AA contrast.');
    }
  };

  const ratioDisplay = result.ratio.toFixed(2);
  const overallPass = result.wcag.aaNormal;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Color Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* Foreground */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">Text Color (Foreground)</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={foreground}
                onChange={handleNativeFgChange}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <Input
                value={fgInput}
                onChange={(e) => handleFgChange(e.target.value)}
                onBlur={() => {
                  if (!isValidHex(fgInput)) setFgInput(foreground);
                }}
                placeholder="#000000"
                className="font-mono text-sm uppercase bg-gray-50 focus:bg-white"
                maxLength={7}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center pb-1">
            <Button variant="outline" size="icon" onClick={handleSwap} title="Swap colors">
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">Background Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={background}
                onChange={handleNativeBgChange}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <Input
                value={bgInput}
                onChange={(e) => handleBgChange(e.target.value)}
                onBlur={() => {
                  if (!isValidHex(bgInput)) setBgInput(background);
                }}
                placeholder="#FFFFFF"
                className="font-mono text-sm uppercase bg-gray-50 focus:bg-white"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contrast Ratio Display */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
        <p className="text-sm text-gray-500 mb-2">Contrast Ratio</p>
        <div className="flex items-center justify-center gap-3">
          <span className={cn(
            'text-5xl font-extrabold tracking-tight',
            overallPass ? 'text-green-700' : 'text-red-700'
          )}>
            {ratioDisplay}:1
          </span>
          <Button variant="ghost" size="icon" onClick={handleCopyRatio} title="Copy ratio">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className={cn(
          'text-sm font-medium mt-2',
          overallPass ? 'text-green-600' : 'text-red-600'
        )}>
          {overallPass ? 'Passes WCAG AA' : 'Fails WCAG AA'}
        </p>
      </div>

      {/* WCAG Compliance Badges */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">WCAG Compliance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(WCAG_LABELS) as Array<keyof WcagResult>).map((key) => {
            const pass = result.wcag[key];
            return (
              <div
                key={key}
                className={cn(
                  'flex items-center justify-between rounded-lg px-4 py-3 border',
                  pass
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                )}
              >
                <span className="text-sm font-medium">{WCAG_LABELS[key]}</span>
                <span className="flex items-center gap-1 text-sm font-semibold">
                  {pass ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {pass ? 'Pass' : 'Fail'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <div
          className="rounded-lg p-6 border border-gray-200"
          style={{ backgroundColor: background }}
        >
          <p
            className="text-base mb-3"
            style={{ color: foreground }}
          >
            Normal text — The quick brown fox jumps over the lazy dog.
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: foreground }}
          >
            Large text — The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>

      {/* Suggestion */}
      {!result.wcag.aaNormal && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Accessibility Suggestion</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your current color pair does not meet WCAG AA for normal text. Click below to find the closest accessible foreground color.
          </p>
          <Button onClick={handleSuggest}>
            Suggest Accessible Color
          </Button>
        </div>
      )}
    </div>
  );
}
