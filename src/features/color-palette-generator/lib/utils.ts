import { Color } from '../types';

/**
 * Generate a random HEX color
 */
export function generateRandomHex(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calculate relative luminance of a color
 * Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 */
export function getContrastRatio(c1: string, c2: string): number {
    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Determine if text should be black or white based on background brightness
 * Returns 'black' or 'white'
 */
export function getContrastColor(hex: string): 'black' | 'white' {
    const luminance = getLuminance(hex);
    return luminance > 0.179 ? 'black' : 'white';
}

/**
 * Convert HEX to HSL
 */
export function hexToHsl(hex: string): { h: number, s: number, l: number } {
    const rgb = hexToRgb(hex);
    if (!rgb) return { h: 0, s: 0, l: 0 };

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to HEX
 */
export function hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Generate a harmonious palette based on a base hue or completely random
 */
export function generatePalette(count: number = 5, existingPalette: Color[] = []): Color[] {
    const lockedColors = existingPalette.filter(c => c.locked);
    let baseHsl = { h: Math.random() * 360, s: 40 + Math.random() * 40, l: 30 + Math.random() * 40 };

    // If we have locked colors, use the first one as our anchor
    if (lockedColors.length > 0) {
        baseHsl = hexToHsl(lockedColors[0].hex);
    }

    const harmonies = ['analogous', 'monochromatic', 'triadic', 'complementary', 'split-complementary', 'shades'];
    const selectedHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];

    const result: Color[] = [];

    for (let i = 0; i < count; i++) {
        // Keep existing locked colors at their positions
        if (existingPalette[i]?.locked) {
            result.push({ ...existingPalette[i], id: existingPalette[i].id || crypto.randomUUID() });
            continue;
        }

        let newH = baseHsl.h;
        let newS = baseHsl.s;
        let newL = baseHsl.l;

        // Apply harmony rules
        switch (selectedHarmony) {
            case 'analogous':
                newH = (baseHsl.h + ((i + 1) * 20)) % 360;
                break;
            case 'monochromatic':
                newS = Math.max(20, baseHsl.s - (i * 10));
                newL = (baseHsl.l + (i * 12)) % 100;
                break;
            case 'shades':
                newL = Math.max(10, Math.min(90, baseHsl.l + (i * 15) - 30));
                break;
            case 'triadic':
                if (i % 3 === 1) newH = (baseHsl.h + 120) % 360;
                if (i % 3 === 2) newH = (baseHsl.h + 240) % 360;
                break;
            case 'complementary':
                if (i % 2 === 1) newH = (baseHsl.h + 180) % 360;
                break;
            case 'split-complementary':
                if (i % 3 === 1) newH = (baseHsl.h + 150) % 360;
                if (i % 3 === 2) newH = (baseHsl.h + 210) % 360;
                break;
        }

        // Final polishing for variety
        if (selectedHarmony !== 'monochromatic' && selectedHarmony !== 'shades') {
            newL = Math.min(90, Math.max(10, baseHsl.l + (Math.random() * 30 - 15)));
            newS = Math.min(100, Math.max(10, baseHsl.s + (Math.random() * 20 - 10)));
        }

        result.push({
            id: crypto.randomUUID(),
            hex: hslToHex(newH, newS, newL),
            locked: false
        });
    }

    return result;
}

/**
 * Helper to validate HEX color
 */
export function isValidHex(hex: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}
