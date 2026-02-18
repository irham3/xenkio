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
 * Generate a harmonious palette based on a base hue or completely random
 */
export function generatePalette(count: number = 5, existingPalette: Color[] = []): Color[] {
    const newPalette: Color[] = [];

    for (let i = 0; i < count; i++) {
        // If index exists and is locked, keep it
        if (existingPalette[i] && existingPalette[i].locked) {
            newPalette.push(existingPalette[i]);
            continue;
        }

        // Generate new color
        const hex = generateRandomHex();

        newPalette.push({
            id: crypto.randomUUID(),
            hex: hex,
            locked: false
        });
    }

    return newPalette;
}

/**
 * Helper to validate HEX color
 */
export function isValidHex(hex: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}
