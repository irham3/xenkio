/**
 * Helper function to apply the mask to the original image standard canvas operations.
 * This runs on the main thread because it involves standard Canvas API which is fast enough
 * once we have the mask, and easier to handle DOM Image objects.
 */
export async function applyMask(originalUrl: string, maskBlob: Blob): Promise<Blob> {
    const [originalImg, maskImg] = await Promise.all([
        loadImage(originalUrl),
        loadImage(URL.createObjectURL(maskBlob))
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not create canvas context');

    // 1. Draw original image
    ctx.drawImage(originalImg, 0, 0);

    // 2. Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 3. Draw mask to a temporary canvas to get pixel data
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error('Could not create mask context');

    maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

    // 4. Apply mask to alpha channel
    // The mask is grayscale, lighter = Keep, darker = Remove
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Use the red channel of the mask as the alpha value
        // Standard RMBG masks: White (255) = Foreground, Black (0) = Background
        imageData.data[i + 3] = maskData.data[i];
    }

    // 5. Put combined data back
    ctx.putImageData(imageData, 0, 0);

    // 6. Return as Blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
        }, 'image/png');
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}
