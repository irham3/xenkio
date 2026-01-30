'use client';

import { useState, useCallback } from 'react';
import { ColorValue } from '../types';
import { DEFAULT_COLOR, MAX_RECENT_COLORS } from '../constants';
import { createColorValue, rgbToHex, hslToRgb } from '../lib/color-utils';

export function useColorPicker() {
  const [color, setColor] = useState<ColorValue>(DEFAULT_COLOR);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const updateFromHex = useCallback((hex: string) => {
    const newColor = createColorValue(hex);
    setColor(newColor);
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const newColor = createColorValue(hex);
    setColor(newColor);
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const newColor = createColorValue(hex);
    setColor(newColor);
  }, []);

  const addToRecent = useCallback((hex: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== hex);
      return [hex, ...filtered].slice(0, MAX_RECENT_COLORS);
    });
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  return {
    color,
    recentColors,
    updateFromHex,
    updateFromRgb,
    updateFromHsl,
    addToRecent,
    copyToClipboard,
  };
}
