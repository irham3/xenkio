
import { PixelCrop } from 'react-image-crop';

export const TO_RADIANS = Math.PI / 180;

export async function canvasPreview(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop,
    scale = 1,
    rotate = 0,
) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    // devicePixelRatio slightly increases sharpness on retina devices
    // at the expense of slightly slower render times and needing to
    // size the image back down if you want to download/upload and be
    // true to the images natural size.
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = rotate * TO_RADIANS;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    // 5) Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY);
    // 4) Move the origin to the center of the original position
    ctx.translate(centerX, centerY);
    // 3) Rotate around the origin
    ctx.rotate(rotateRads);
    // 2) Scale the image
    ctx.scale(scale, scale);
    // 1) Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
    );

    ctx.restore();
}

/**
 * Helper to download the cropped image
 */
export async function downloadCrop(
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName = 'cropped-image.png',
    scale = 1,
    rotate = 0,
    quality = 0.9
) {
    const canvas = document.createElement('canvas');
    await canvasPreview(image, canvas, crop, scale, rotate); // Ensure wait if async logic added later

    // Determine mime type based on filename extension or default to png
    const mimeType = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';

    canvas.toBlob((blob) => {
        if (!blob) {
            console.error('Canvas is empty');
            return;
        }
        const previewUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.download = fileName;
        anchor.href = previewUrl;
        anchor.click();
        URL.revokeObjectURL(previewUrl);
    }, mimeType, quality);
}

/**
 * Center the crop on the new media dimensions
 */
export function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

// Re-export required functions from library if needed, or implement simple versions if tree-shaking issue
import { centerCrop, makeAspectCrop } from 'react-image-crop';
