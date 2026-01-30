import { RGBColor, HSLColor, ColorValue } from '../types';

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): RGBColor {
  const sanitized = hex.replace('#', '');
  const fullHex = sanitized.length === 3
    ? sanitized.split('').map(c => c + c).join('')
    : sanitized;
  
  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1/6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1/2) return q;
    if (tNorm < 2/3) return p + (q - p) * (2/3 - tNorm) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255),
  };
}

/**
 * Create a complete ColorValue from HEX
 */
export function colorFromHex(hex: string): ColorValue {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl,
  };
}

/**
 * Create a complete ColorValue from RGB
 */
export function colorFromRgb(rgb: RGBColor): ColorValue {
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  return { hex, rgb, hsl };
}

/**
 * Create a complete ColorValue from HSL
 */
export function colorFromHsl(hsl: HSLColor): ColorValue {
  const rgb = hslToRgb(hsl);
  const hex = rgbToHex(rgb);
  return { hex, rgb, hsl };
}

/**
 * Validate HEX color string
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Format color for display
 */
export function formatRgb(rgb: RGBColor): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHsl(hsl: HSLColor): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Get contrasting text color (black or white) based on background
 */
export function getContrastColor(rgb: RGBColor): string {
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
