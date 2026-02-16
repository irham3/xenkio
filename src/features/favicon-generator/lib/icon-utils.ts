
import { FaviconSettings } from '../types';

export const FAVICON_SIZES = [
    { name: 'favicon-16x16.png', size: 16, type: 'png' as const },
    { name: 'favicon-32x32.png', size: 32, type: 'png' as const },
    { name: 'apple-touch-icon.png', size: 180, type: 'png' as const },
    { name: 'android-chrome-192x192.png', size: 192, type: 'png' as const },
    { name: 'android-chrome-512x512.png', size: 512, type: 'png' as const },
];

/**
 * Creates a resized version of an image on a canvas with optional padding and border radius.
 */
export async function processIcon(
    originalImage: HTMLImageElement,
    size: number,
    settings: FaviconSettings
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Calculate dimensions with padding
    const padding = (settings.padding / 100) * size;
    const drawSize = size - padding * 2;
    const x = padding;
    const y = padding;

    // Draw background if specified (if the icon has transparency)
    if (settings.backgroundColor && settings.backgroundColor !== 'transparent') {
        ctx.fillStyle = settings.backgroundColor;
        if (settings.borderRadius > 0) {
            const radius = (settings.borderRadius / 100) * size;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(size - radius, 0);
            ctx.quadraticCurveTo(size, 0, size, radius);
            ctx.lineTo(size, size - radius);
            ctx.quadraticCurveTo(size, size, size - radius, size);
            ctx.lineTo(radius, size);
            ctx.quadraticCurveTo(0, size, 0, size - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, size, size);
        }
    }

    // Clip for border radius if not using background (or even if using it)
    if (settings.borderRadius > 0) {
        const radius = (settings.borderRadius / 100) * size;
        ctx.beginPath();
        ctx.moveTo(radius + x, y);
        ctx.lineTo(drawSize - radius + x, y);
        ctx.quadraticCurveTo(drawSize + x, y, drawSize + x, radius + y);
        ctx.lineTo(drawSize + x, drawSize - radius + y);
        ctx.quadraticCurveTo(drawSize + x, drawSize + y, drawSize - radius + x, drawSize + y);
        ctx.lineTo(radius + x, drawSize + y);
        ctx.quadraticCurveTo(x, drawSize + y, x, drawSize - radius + y);
        ctx.lineTo(x, radius + y);
        ctx.quadraticCurveTo(x, y, radius + x, y);
        ctx.closePath();
        ctx.clip();
    }

    // Draw the image
    ctx.drawImage(originalImage, x, y, drawSize, drawSize);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
        }, 'image/png');
    });
}

/**
 * Basic ICO encoder. Creates a 32x32 ICO file from a PNG blob.
 * For a truly "best" tool, we should support multiple sizes in one ICO,
 * but a single 32x32 is often sufficient and highly compatible.
 */
export async function createIco(pngBlob32: Blob): Promise<Blob> {
    const arrayBuffer = await pngBlob32.arrayBuffer();
    const pngData = new Uint8Array(arrayBuffer);

    // Header (6 bytes): 0, 0, 1 (type: ico), 0, 1 (count: 1), 0
    const header = new Uint8Array([0, 0, 1, 0, 1, 0]);

    // Directory Entry (16 bytes):
    // Width (1), Height (1), Colors (1), Reserved (1), Planes (2), BitsPerPixel (2), SizeBytes (4), Offset (4)
    const entry = new Uint8Array(16);
    entry[0] = 32; // Width
    entry[1] = 32; // Height
    entry[2] = 0;  // Palette colors (0 for >= 8bpp)
    entry[3] = 0;  // Reserved
    entry[4] = 1;  // Planes
    entry[5] = 0;
    entry[6] = 32; // Bits per pixel (usually 32 for modern icons)
    entry[7] = 0;

    // Data size (4 bytes, little endian)
    const size = pngData.length;
    entry[8] = size & 0xFF;
    entry[9] = (size >> 8) & 0xFF;
    entry[10] = (size >> 16) & 0xFF;
    entry[11] = (size >> 24) & 0xFF;

    // Data offset (4 bytes, little endian) - Offset is 6 (header) + 16 (1 entry) = 22
    const offset = 22;
    entry[12] = offset & 0xFF;
    entry[13] = (offset >> 8) & 0xFF;
    entry[14] = (offset >> 16) & 0xFF;
    entry[15] = (offset >> 24) & 0xFF;

    const icoData = new Uint8Array(header.length + entry.length + pngData.length);
    icoData.set(header, 0);
    icoData.set(entry, header.length);
    icoData.set(pngData, header.length + entry.length);

    return new Blob([icoData], { type: 'image/x-icon' });
}
