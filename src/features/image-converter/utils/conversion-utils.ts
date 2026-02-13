// @ts-expect-error utif does not have types
import UTIF from 'utif';
// @ts-expect-error gif.js does not have types
import GIF from 'gif.js';

export async function convertToBmp(imageData: ImageData): Promise<Blob> {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const fileSize = 54 + rowSize * height;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // Bitmap Header (14 bytes)
    view.setUint16(0, 0x4D42, false); // BM
    view.setUint32(2, fileSize, true); // File size
    view.setUint32(6, 0, true); // Reserved
    view.setUint32(10, 54, true); // Offset to pixel data

    // DIB Header (40 bytes)
    view.setUint32(14, 40, true); // DIB header size
    view.setInt32(18, width, true); // Width
    view.setInt32(22, -height, true); // Height (negative for top-down)
    view.setUint16(26, 1, true); // Planes
    view.setUint16(28, 24, true); // Bits per pixel (RGB)
    view.setUint32(30, 0, true); // Compression (BI_RGB)
    view.setUint32(34, rowSize * height, true); // Image size
    view.setInt32(38, 2835, true); // X pixels per meter (72 DPI)
    view.setInt32(42, 2835, true); // Y pixels per meter (72 DPI)
    view.setUint32(46, 0, true); // Colors in palette
    view.setUint32(50, 0, true); // Important colors

    let pos = 54;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            // Write B, G, R (BMP uses BGR)
            view.setUint8(pos++, data[index + 2]); // B
            view.setUint8(pos++, data[index + 1]); // G
            view.setUint8(pos++, data[index]);     // R
        }
        // Paddington (row must be multiple of 4 bytes)
        const padding = rowSize - (width * 3);
        pos += padding;
    }

    return new Blob([buffer], { type: 'image/bmp' });
}

export async function convertToIco(canvas: HTMLCanvasElement): Promise<Blob> {
    // ICO format can store PNG content directly since Windows Vista
    const pngBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!pngBlob) throw new Error('Failed to create PNG blob for ICO');

    const pngArrayBuffer = await pngBlob.arrayBuffer();
    const pngData = new Uint8Array(pngArrayBuffer);

    const imageSize = pngData.length;
    const offset = 22; // 6 (header) + 16 (on directory entry)
    const fileSize = offset + imageSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // ICONDIR (6 bytes)
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // Type (1 for icon)
    view.setUint16(4, 1, true); // Number of images (1)

    // ICONDIRENTRY (16 bytes)
    const w = canvas.width > 255 ? 0 : canvas.width;
    const h = canvas.height > 255 ? 0 : canvas.height;
    view.setUint8(6, w); // Width
    view.setUint8(7, h); // Height
    view.setUint8(8, 0); // Palette color count
    view.setUint8(9, 0); // Reserved
    view.setUint16(10, 1, true); // Color planes
    view.setUint16(12, 32, true); // Bits per pixel
    view.setUint32(14, imageSize, true); // Size of image data
    view.setUint32(18, offset, true); // Offset to image data

    // Write PNG data
    const u8 = new Uint8Array(buffer);
    u8.set(pngData, offset);

    return new Blob([buffer], { type: 'image/x-icon' });
}

export async function convertToTiff(imageData: ImageData): Promise<Blob> {
    // Basic TIFF implementation using UTIF
    const tiffBytes = UTIF.encodeImage(imageData.data, imageData.width, imageData.height);
    return new Blob([tiffBytes], { type: 'image/tiff' });
}

export async function convertToGif(canvas: HTMLCanvasElement, quality: number = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            // Map 0.1 - 1.0 (quality) to 30 - 1 (gif.js quality parameter where lower is better)
            const gifQuality = Math.max(1, Math.min(30, Math.round(31 - (quality * 30))));

            const gif = new GIF({
                workers: 2,
                quality: gifQuality,
                workerScript: '/gif.worker.js',
                width: canvas.width,
                height: canvas.height
            });

            gif.addFrame(canvas, { copy: true, delay: 200 });

            gif.on('finished', (blob: Blob) => {
                resolve(blob);
            });

            gif.render();
        } catch (e) {
            reject(e);
        }
    });
}

export async function convertToSvg(imageData: ImageData, options: Record<string, unknown> = {}): Promise<Blob> {
    // @ts-expect-error imagetracerjs does not have types
    const ImageTracer = (await import('imagetracerjs')).default || (await import('imagetracerjs'));

    return new Promise((resolve, reject) => {
        try {
            // Options for tracing - balancing quality and performance
            const tracingOptions = {
                // Tracing
                corsenabled: false,
                ltres: 1, // Linear error threshold (lower is more detailed)
                qtres: 1, // Quadratic error threshold (lower is more detailed)
                pathomit: 8, // Path omission settings
                rightangleenhance: true, // Enhance right angles

                // Color quantization
                colorsampling: 2, // 0: disabled, 1: random, 2: deterministic
                numberofcolors: 16, // Number of colors to use (higher = more detailed but larger file)
                mincolorratio: 0,
                colorquantcycles: 3,

                // SVG rendering
                scale: 1,
                simplify: 0, // Simplify paths
                roundcoords: 1, // Round coordinates to 1 decimal place
                lcpr: 0,
                qcpr: 0,
                desc: false, // Show description
                viewbox: true, // Use viewBox
                ...options
            };

            const svgString = ImageTracer.imagedataToSVG(imageData, tracingOptions);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            resolve(blob);
        } catch (e) {
            reject(e);
        }
    });
}
