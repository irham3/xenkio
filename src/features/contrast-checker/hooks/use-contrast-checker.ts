'use client';

import { useState, useMemo, useCallback } from 'react';
import { ContrastCheckerState } from '../types';
import { DEFAULT_FOREGROUND, DEFAULT_BACKGROUND } from '../constants';
import { calculateContrast } from '../lib/contrast-utils';

export function useContrastChecker() {
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);

  const result = useMemo(
    () => calculateContrast(foreground, background),
    [foreground, background]
  );

  const swapColors = useCallback(() => {
    setForeground(prev => {
      setBackground(prev);
      return background;
    });
  }, [background]);

  const updateForeground = useCallback((hex: string) => {
    setForeground(hex.toUpperCase());
  }, []);

  const updateBackground = useCallback((hex: string) => {
    setBackground(hex.toUpperCase());
  }, []);

  const state: ContrastCheckerState = {
    foreground,
    background,
    result,
  };

  return {
    state,
    updateForeground,
    updateBackground,
    swapColors,
  };
}
