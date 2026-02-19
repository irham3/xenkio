'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, Copy, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c.repeat(2)).join('');
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(clean);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const h = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('').toUpperCase();
}

function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface WcagResult {
  label: string;
  threshold: number;
  pass: boolean;
}

function getWcagResults(ratio: number): WcagResult[] {
  return [
    { label: 'AA Normal Text', threshold: 4.5, pass: ratio >= 4.5 },
    { label: 'AA Large Text', threshold: 3, pass: ratio >= 3 },
    { label: 'AAA Normal Text', threshold: 7, pass: ratio >= 7 },
    { label: 'AAA Large Text', threshold: 4.5, pass: ratio >= 4.5 },
  ];
}

function suggestColor(
  fixedHex: string,
  adjustableHex: string,
  targetRatio: number
): string | null {
  const { r, g, b } = hexToRgb(adjustableHex);
  const fixedLum = relativeLuminance(fixedHex);

  // Try lightening and darkening in small steps
  for (let step = 1; step <= 255; step++) {
    // Try darker
    const dr = Math.max(0, r - step);
    const dg = Math.max(0, g - step);
    const db = Math.max(0, b - step);
    const darkerHex = rgbToHex(dr, dg, db);
    const darkerLum = relativeLuminance(darkerHex);
    const darkerRatio = fixedLum > darkerLum
      ? (fixedLum + 0.05) / (darkerLum + 0.05)
      : (darkerLum + 0.05) / (fixedLum + 0.05);
    if (darkerRatio >= targetRatio) {
      return darkerHex;
    }

    // Try lighter
    const lr = Math.min(255, r + step);
    const lg = Math.min(255, g + step);
    const lb = Math.min(255, b + step);
    const lighterHex = rgbToHex(lr, lg, lb);
    const lighterLum = relativeLuminance(lighterHex);
    const lighterRatio = fixedLum > lighterLum
      ? (fixedLum + 0.05) / (lighterLum + 0.05)
      : (lighterLum + 0.05) / (fixedLum + 0.05);
    if (lighterRatio >= targetRatio) return lighterHex;
  }
  return null;
}

export function ContrastCheckerTool() {
  const [foreground, setForeground] = useState('#1A1A2E');
  const [background, setBackground] = useState('#FFFFFF');
  const [fgInput, setFgInput] = useState('#1A1A2E');
  const [bgInput, setBgInput] = useState('#FFFFFF');
  const [copied, setCopied] = useState(false);

  const ratio = useMemo(() => contrastRatio(foreground, background), [foreground, background]);
  const wcagResults = useMemo(() => getWcagResults(ratio), [ratio]);
  const allPass = wcagResults.every(r => r.pass);

  const suggestions = useMemo(() => {
    if (allPass) return [];
    const results: { label: string; fg: string; bg: string }[] = [];
    const suggestedFg = suggestColor(background, foreground, 7);
    if (suggestedFg && suggestedFg !== foreground) {
      results.push({ label: 'Adjusted foreground for AAA', fg: suggestedFg, bg: background });
    }
    const suggestedBg = suggestColor(foreground, background, 7);
    if (suggestedBg && suggestedBg !== background) {
      results.push({ label: 'Adjusted background for AAA', fg: foreground, bg: suggestedBg });
    }
    return results;
  }, [foreground, background, allPass]);

  const updateForeground = useCallback((hex: string) => {
    const normalized = hex.startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase();
    setForeground(normalized);
    setFgInput(normalized);
  }, []);

  const updateBackground = useCallback((hex: string) => {
    const normalized = hex.startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase();
    setBackground(normalized);
    setBgInput(normalized);
  }, []);

  const handleFgInputChange = (value: string) => {
    const upper = value.toUpperCase();
    setFgInput(upper);
    if (isValidHex(upper)) {
      setForeground(upper.startsWith('#') ? upper : '#' + upper);
    }
  };

  const handleBgInputChange = (value: string) => {
    const upper = value.toUpperCase();
    setBgInput(upper);
    if (isValidHex(upper)) {
      setBackground(upper.startsWith('#') ? upper : '#' + upper);
    }
  };

  const swapColors = () => {
    const tmpFg = foreground;
    const tmpBg = background;
    updateForeground(tmpBg);
    updateBackground(tmpFg);
  };

  const copyReport = async () => {
    const lines = [
      'WCAG Contrast Report',
      '====================',
      `Foreground: ${foreground}`,
      `Background: ${background}`,
      `Contrast Ratio: ${ratio.toFixed(2)}:1`,
      '',
      ...wcagResults.map(r => `${r.label} (${r.threshold}:1): ${r.pass ? 'PASS ✓' : 'FAIL ✗'}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      toast.success('Contrast report copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy report');
    }
  };

  const applySuggestion = (fg: string, bg: string) => {
    updateForeground(fg);
    updateBackground(bg);
    toast.success('Suggested colors applied');
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Panel: Color Inputs */}
          <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-6">
              {/* Foreground Color */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Foreground (Text) Color</Label>
                <div className="flex gap-3 items-center">
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer"
                      style={{ backgroundColor: foreground }}
                    >
                      <input
                        type="color"
                        value={foreground}
                        onChange={(e) => updateForeground(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Pick foreground color"
                      />
                    </div>
                  </div>
                  <Input
                    value={fgInput}
                    onChange={(e) => handleFgInputChange(e.target.value)}
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
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapColors}
                  className="gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Swap Colors
                </Button>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Background Color</Label>
                <div className="flex gap-3 items-center">
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer"
                      style={{ backgroundColor: background }}
                    >
                      <input
                        type="color"
                        value={background}
                        onChange={(e) => updateBackground(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Pick background color"
                      />
                    </div>
                  </div>
                  <Input
                    value={bgInput}
                    onChange={(e) => handleBgInputChange(e.target.value)}
                    onBlur={() => {
                      if (!isValidHex(bgInput)) setBgInput(background);
                    }}
                    placeholder="#FFFFFF"
                    className="font-mono text-sm uppercase bg-gray-50 focus:bg-white"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Contrast Ratio */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center space-y-2">
                <p className="text-sm font-medium text-gray-500">Contrast Ratio</p>
                <p className={cn(
                  "text-4xl font-bold tracking-tight",
                  ratio >= 7 ? "text-success-600" : ratio >= 4.5 ? "text-amber-600" : "text-red-600"
                )}>
                  {ratio.toFixed(2)}:1
                </p>
              </div>

              {/* WCAG Results */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">WCAG 2.1 Compliance</Label>
                <div className="grid grid-cols-2 gap-2">
                  {wcagResults.map((result) => (
                    <div
                      key={result.label}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border text-sm",
                        result.pass
                          ? "bg-success-50 border-success-200 text-success-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      )}
                    >
                      {result.pass ? (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-xs leading-tight">{result.label}</p>
                        <p className="text-xs opacity-75">{result.threshold}:1 — {result.pass ? 'Pass' : 'Fail'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy Report */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={copyReport}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Contrast Report'}
              </Button>
            </div>
          </div>

          {/* Right Panel: Preview & Suggestions */}
          <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col">
            <div className="space-y-6">
              {/* Preview Area */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Preview</Label>
                <div
                  className="rounded-xl border border-gray-200 p-6 space-y-4 min-h-[200px]"
                  style={{ backgroundColor: background }}
                >
                  <p style={{ color: foreground, fontSize: '28px', fontWeight: 700, lineHeight: 1.3 }}>
                    Large Heading Text
                  </p>
                  <p style={{ color: foreground, fontSize: '20px', fontWeight: 600, lineHeight: 1.4 }}>
                    Medium Heading Text
                  </p>
                  <p style={{ color: foreground, fontSize: '16px', fontWeight: 400, lineHeight: 1.6 }}>
                    Normal body text. The quick brown fox jumps over the lazy dog.
                    This paragraph demonstrates how your text will appear at regular size.
                  </p>
                  <p style={{ color: foreground, fontSize: '12px', fontWeight: 400, lineHeight: 1.5 }}>
                    Small text — captions, footnotes, and fine print appear at this size.
                  </p>
                </div>
              </div>

              {/* Suggested Colors */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800">Suggested Improvements</Label>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, i) => {
                      const sugRatio = contrastRatio(suggestion.fg, suggestion.bg);
                      return (
                        <button
                          key={i}
                          onClick={() => applySuggestion(suggestion.fg, suggestion.bg)}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">{suggestion.label}</span>
                            <span className="text-xs font-mono text-success-600">{sugRatio.toFixed(2)}:1</span>
                          </div>
                          <div
                            className="rounded-md px-3 py-2 text-sm font-medium"
                            style={{ backgroundColor: suggestion.bg, color: suggestion.fg }}
                          >
                            Sample Text Preview
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5 group-hover:text-gray-600 transition-colors">
                            Click to apply — FG: {suggestion.fg} / BG: {suggestion.bg}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
