import { hexToRgb } from '@/features/color-picker/lib/color-utils';
import { WcagResult, ContrastResult } from '../types';
import { WCAG_THRESHOLDS } from '../constants';

/** Linearize an sRGB channel value (0–255) to linear light. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Calculate relative luminance per WCAG 2.1 specification. */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Calculate contrast ratio between two hex colors (returns value ≥ 1). */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Check WCAG compliance levels for a given contrast ratio. */
export function checkWcagCompliance(ratio: number): WcagResult {
  return {
    aaNormal: ratio >= WCAG_THRESHOLDS.aaNormal,
    aaLarge: ratio >= WCAG_THRESHOLDS.aaLarge,
    aaaNormal: ratio >= WCAG_THRESHOLDS.aaaNormal,
    aaaLarge: ratio >= WCAG_THRESHOLDS.aaaLarge,
  };
}

/** Calculate full contrast result for two hex colors. */
export function calculateContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const wcag = checkWcagCompliance(ratio);
  return { ratio, wcag };
}

/**
 * Suggest the closest accessible foreground color by adjusting lightness.
 * Returns the original color if already passing, otherwise finds the nearest
 * color that meets the target contrast ratio against the background.
 */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  targetRatio: number = WCAG_THRESHOLDS.aaNormal
): string {
  const currentRatio = getContrastRatio(foreground, background);
  if (currentRatio >= targetRatio) return foreground;

  const bgRgb = hexToRgb(background);
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Try darkening first, then lightening
  const directions: Array<'darken' | 'lighten'> = bgLuminance > 0.5
    ? ['darken', 'lighten']
    : ['lighten', 'darken'];

  for (const direction of directions) {
    const result = findAccessibleShade(foreground, background, targetRatio, direction);
    if (result) return result;
  }

  return foreground;
}

function findAccessibleShade(
  foreground: string,
  background: string,
  targetRatio: number,
  direction: 'darken' | 'lighten'
): string | null {
  const fgRgb = hexToRgb(foreground);
  let { r, g, b } = fgRgb;

  for (let i = 0; i < 256; i++) {
    const step = direction === 'darken' ? -1 : 1;
    r = Math.min(255, Math.max(0, r + step));
    g = Math.min(255, Math.max(0, g + step));
    b = Math.min(255, Math.max(0, b + step));

    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    const ratio = getContrastRatio(hex, background);

    if (ratio >= targetRatio) return hex;

    // Hit the boundary without finding accessible color
    if (direction === 'darken' && r === 0 && g === 0 && b === 0) return null;
    if (direction === 'lighten' && r === 255 && g === 255 && b === 255) return null;
  }

  return null;
}
