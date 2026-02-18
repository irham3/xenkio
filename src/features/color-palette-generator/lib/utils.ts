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
 * Determine if text should be black or white based on background brightness
 * Returns 'black' or 'white'
 */
export function getContrastColor(hex: string): 'black' | 'white' {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'black';
    // Calculate brightness (YIQ)
    const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

/**
 * Generate a harmonious palette based on a base hue or completely random
 * For simplicity, we'll start with random robust colors using HSL logic
 */
export function generatePalette(count: number = 5, existingPalette: Color[] = []): Color[] {
    const newPalette: Color[] = [];

    // Simple strategy: If existing palette has locked colors, keep them.
    // If empty or no locks, generate completely random.
    // Enhanced strategy: Use HSL to pick colors that look somewhat good together (same saturation/lightness with different hues)

    // Pick a random base hue
    const baseHue = Math.floor(Math.random() * 360);

    for (let i = 0; i < count; i++) {
        // If index exists and is locked, keep it
        if (existingPalette[i] && existingPalette[i].locked) {
            newPalette.push(existingPalette[i]);
            continue;
        }

        // Generate new color
        // Simple random for now, can be improved with HSL math
        const hex = generateRandomHex();

        newPalette.push({
            id: crypto.randomUUID(), // Unique ID for keys
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
