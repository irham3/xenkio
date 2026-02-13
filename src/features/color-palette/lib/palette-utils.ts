import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  createColorValue,
} from '@/features/color-picker/lib/color-utils';
import { HarmonyType, PaletteColor, ColorValue } from '../types';

function hslColor(h: number, s: number, l: number): ColorValue {
  const normalizedH = ((h % 360) + 360) % 360;
  const rgb = hslToRgb(normalizedH, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return createColorValue(hex);
}

function getBaseHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

export function generatePalette(hex: string, harmony: HarmonyType): PaletteColor[] {
  const { h, s, l } = getBaseHsl(hex);

  switch (harmony) {
    case 'complementary':
      return [
        { color: hslColor(h, s, l), name: 'Base' },
        { color: hslColor(h + 180, s, l), name: 'Complement' },
      ];

    case 'analogous':
      return [
        { color: hslColor(h - 30, s, l), name: 'Analogous 1' },
        { color: hslColor(h, s, l), name: 'Base' },
        { color: hslColor(h + 30, s, l), name: 'Analogous 2' },
      ];

    case 'triadic':
      return [
        { color: hslColor(h, s, l), name: 'Base' },
        { color: hslColor(h + 120, s, l), name: 'Triadic 1' },
        { color: hslColor(h + 240, s, l), name: 'Triadic 2' },
      ];

    case 'split-complementary':
      return [
        { color: hslColor(h, s, l), name: 'Base' },
        { color: hslColor(h + 150, s, l), name: 'Split 1' },
        { color: hslColor(h + 210, s, l), name: 'Split 2' },
      ];

    case 'tetradic':
      return [
        { color: hslColor(h, s, l), name: 'Base' },
        { color: hslColor(h + 90, s, l), name: 'Tetradic 1' },
        { color: hslColor(h + 180, s, l), name: 'Tetradic 2' },
        { color: hslColor(h + 270, s, l), name: 'Tetradic 3' },
      ];

    case 'monochromatic':
      return [
        { color: hslColor(h, s, Math.max(l - 30, 5)), name: 'Dark' },
        { color: hslColor(h, s, Math.max(l - 15, 10)), name: 'Medium Dark' },
        { color: hslColor(h, s, l), name: 'Base' },
        { color: hslColor(h, s, Math.min(l + 15, 90)), name: 'Medium Light' },
        { color: hslColor(h, s, Math.min(l + 30, 95)), name: 'Light' },
      ];

    default:
      return [{ color: hslColor(h, s, l), name: 'Base' }];
  }
}

export function paletteToCssVariables(palette: PaletteColor[]): string {
  const lines = palette.map((item, i) => {
    return `  --palette-${i + 1}: ${item.color.hex};`;
  });
  return `:root {\n${lines.join('\n')}\n}`;
}

export function paletteToTailwindColors(palette: PaletteColor[]): string {
  const entries = palette.map((item, i) => {
    const key = `palette-${i + 1}`;
    return `    '${key}': '${item.color.hex}',`;
  });
  return `colors: {\n${entries.join('\n')}\n}`;
}

export function randomHexColor(): string {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `#${hex.toUpperCase()}`;
}
