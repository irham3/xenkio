import { useState, useCallback } from 'react';
import { ColorValue, ColorFormat, ColorHistoryItem, RGBColor, HSLColor } from '../types';
import { DEFAULT_COLOR, MAX_HISTORY_SIZE } from '../constants';
import { colorFromHex, colorFromRgb, colorFromHsl, isValidHex } from '../lib/color-utils';

export function useColorPicker() {
  const [currentColor, setCurrentColor] = useState<ColorValue>(DEFAULT_COLOR);
  const [history, setHistory] = useState<ColorHistoryItem[]>([]);
  const [activeFormat, setActiveFormat] = useState<ColorFormat>('hex');

  const addToHistory = useCallback((color: ColorValue) => {
    setHistory(prev => {
      // Don't add duplicates
      if (prev.some(item => item.color.hex === color.hex)) {
        return prev;
      }
      const newItem: ColorHistoryItem = {
        id: crypto.randomUUID(),
        color,
        addedAt: Date.now(),
      };
      return [newItem, ...prev].slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  const setColorFromHex = useCallback((hex: string) => {
    if (!isValidHex(hex)) return;
    const color = colorFromHex(hex);
    setCurrentColor(color);
  }, []);

  const setColorFromRgb = useCallback((rgb: RGBColor) => {
    const color = colorFromRgb(rgb);
    setCurrentColor(color);
  }, []);

  const setColorFromHsl = useCallback((hsl: HSLColor) => {
    const color = colorFromHsl(hsl);
    setCurrentColor(color);
  }, []);

  // Set color and add to history (for picks from canvas/native picker)
  const setColor = useCallback((color: ColorValue) => {
    setCurrentColor(color);
    addToHistory(color);
  }, [addToHistory]);

  // Select a color without adding to history (for presets and history items)
  const selectColor = useCallback((color: ColorValue) => {
    setCurrentColor(color);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
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
  };
}
