'use client';

import { useState, useCallback, useMemo } from 'react';
import { createColorValue, isValidHex } from '@/features/color-picker/lib/color-utils';
import { HarmonyType, PaletteColor, ColorValue } from '../types';
import { DEFAULT_BASE_HEX, DEFAULT_HARMONY } from '../constants';
import { generatePalette, randomHexColor } from '../lib/palette-utils';

export function useColorPalette() {
  const [baseColor, setBaseColor] = useState<ColorValue>(
    createColorValue(DEFAULT_BASE_HEX)
  );
  const [harmonyType, setHarmonyType] = useState<HarmonyType>(DEFAULT_HARMONY);

  const palette: PaletteColor[] = useMemo(
    () => generatePalette(baseColor.hex, harmonyType),
    [baseColor.hex, harmonyType]
  );

  const updateBaseFromHex = useCallback((hex: string) => {
    if (isValidHex(hex)) {
      setBaseColor(createColorValue(hex));
    }
  }, []);

  const randomize = useCallback((): string => {
    const hex = randomHexColor();
    setBaseColor(createColorValue(hex));
    return hex;
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    baseColor,
    harmonyType,
    palette,
    setHarmonyType,
    updateBaseFromHex,
    randomize,
    copyToClipboard,
  };
}
