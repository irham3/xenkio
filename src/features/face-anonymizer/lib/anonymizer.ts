import type { AnonymizationMode } from '../types';
import { MAX_BLUR_INTENSITY, MIN_PIXEL_SIZE } from '../constants';

export interface FaceRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Apply anonymization to the given face regions on the provided canvas context.
 * The image is drawn at (0,0) with the given dimensions, and each face region
 * is anonymized using either blur or pixelate in natural-image coordinates.
 */
export function applyAnonymization(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    faces: FaceRegion[],
    mode: AnonymizationMode,
    intensity: number,
    canvasWidth: number,
    canvasHeight: number,
): void {
    // Clear and draw the full image
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    if (faces.length === 0) return;

    const scaleX = canvasWidth / image.naturalWidth;
    const scaleY = canvasHeight / image.naturalHeight;

    const regions = faces
        .map((face) => {
            // Source region in natural image pixels
            const sx = Math.max(0, face.x);
            const sy = Math.max(0, face.y);
            const sw = Math.min(face.width, image.naturalWidth - sx);
            const sh = Math.min(face.height, image.naturalHeight - sy);

            if (sw <= 0 || sh <= 0) return null;

            // Destination region in canvas pixels
            const dx = sx * scaleX;
            const dy = sy * scaleY;
            const dw = sw * scaleX;
            const dh = sh * scaleY;

            return { sx, sy, sw, sh, dx, dy, dw, dh };
        })
        .filter((region): region is NonNullable<typeof region> => region !== null);

    if (regions.length === 0) return;

    if (mode === 'blur') {
        const normalizedIntensity = Math.min(
            1,
            Math.max(0, (intensity - 1) / Math.max(1, MAX_BLUR_INTENSITY - 1)),
        );
        // Deterministic blur via downscale-upscale avoids non-monotonic behavior of large canvas filters.
        const downscaleFactor = 1 + Math.round(normalizedIntensity * normalizedIntensity * 30);

        for (const { sx, sy, sw, sh, dx, dy, dw, dh } of regions) {
            if (dw <= 0 || dh <= 0 || sw <= 0 || sh <= 0) continue;

            const sampleW = Math.max(1, Math.round(dw / downscaleFactor));
            const sampleH = Math.max(1, Math.round(dh / downscaleFactor));

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = sampleW;
            tempCanvas.height = sampleH;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) continue;

            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'low';
            tempCtx.drawImage(image, sx, sy, sw, sh, 0, 0, sampleW, sampleH);

            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(tempCanvas, 0, 0, sampleW, sampleH, dx, dy, dw, dh);
            ctx.restore();
        }
        return;
    }

    for (const { sx, sy, sw, sh, dx, dy, dw, dh } of regions) {
        // Pixelate: downscale to a few pixels then upscale without smoothing
        const pixelSize = Math.max(MIN_PIXEL_SIZE, intensity);
        const smallW = Math.max(1, Math.ceil(dw / pixelSize));
        const smallH = Math.max(1, Math.ceil(dh / pixelSize));

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = smallW;
        tempCanvas.height = smallH;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) continue;

        tempCtx.drawImage(image, sx, sy, sw, sh, 0, 0, smallW, smallH);

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, dx, dy, dw, dh);
        ctx.imageSmoothingEnabled = true;
        ctx.restore();
    }
}

/**
 * Render the full-resolution processed image to a new canvas and return it as a Blob.
 */
export async function renderToBlob(
    image: HTMLImageElement,
    faces: FaceRegion[],
    mode: AnonymizationMode,
    intensity: number,
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    applyAnonymization(ctx, image, faces, mode, intensity, image.naturalWidth, image.naturalHeight);

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to create blob'));
            },
            'image/png',
        );
    });
}
