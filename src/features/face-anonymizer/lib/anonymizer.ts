import type { AnonymizationMode } from '../types';

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

    for (const face of faces) {
        // Source region in natural image pixels
        const sx = Math.max(0, face.x);
        const sy = Math.max(0, face.y);
        const sw = Math.min(face.width, image.naturalWidth - sx);
        const sh = Math.min(face.height, image.naturalHeight - sy);

        if (sw <= 0 || sh <= 0) continue;

        // Destination region in canvas pixels
        const dx = sx * scaleX;
        const dy = sy * scaleY;
        const dw = sw * scaleX;
        const dh = sh * scaleY;

        if (mode === 'blur') {
            const blurRadius = intensity * 2;
            ctx.save();
            ctx.beginPath();
            ctx.rect(dx, dy, dw, dh);
            ctx.clip();
            ctx.filter = `blur(${blurRadius}px)`;
            // Draw a slightly larger area so blur covers edges
            ctx.drawImage(
                image,
                Math.max(0, sx - 2),
                Math.max(0, sy - 2),
                Math.min(sw + 4, image.naturalWidth - Math.max(0, sx - 2)),
                Math.min(sh + 4, image.naturalHeight - Math.max(0, sy - 2)),
                dx - 2 * scaleX,
                dy - 2 * scaleY,
                dw + 4 * scaleX,
                dh + 4 * scaleY,
            );
            ctx.filter = 'none';
            ctx.restore();
        } else {
            // Pixelate: downscale to a few pixels then upscale without smoothing
            const pixelSize = Math.max(2, intensity);
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
