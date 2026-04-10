import { PageDiffResult, RenderedPage } from '../types';

/**
 * Compares two rendered pages pixel-by-pixel.
 * Produces a diff image where:
 *  - Unchanged pixels are drawn at low opacity (greyscale)
 *  - Changed pixels glow bright red
 */
export function comparePages(
    pageA: RenderedPage,
    pageB: RenderedPage
): PageDiffResult {
    const width = Math.max(pageA.width, pageB.width);
    const height = Math.max(pageA.height, pageB.height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context for diff');

    const diffImageData = ctx.createImageData(width, height);
    const out = diffImageData.data;

    const dataA = pageA.imageData.data;
    const dataB = pageB.imageData.data;
    const wA = pageA.width;
    const wB = pageB.width;

    let diffCount = 0;
    const threshold = 30; // colour distance threshold to count as a difference

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idxOut = (y * width + x) * 4;

            const inBoundsA = x < pageA.width && y < pageA.height;
            const inBoundsB = x < pageB.width && y < pageB.height;

            const idxA = inBoundsA ? (y * wA + x) * 4 : -1;
            const idxB = inBoundsB ? (y * wB + x) * 4 : -1;

            const rA = idxA >= 0 ? dataA[idxA] : 255;
            const gA = idxA >= 0 ? dataA[idxA + 1] : 255;
            const bA = idxA >= 0 ? dataA[idxA + 2] : 255;

            const rB = idxB >= 0 ? dataB[idxB] : 255;
            const gB = idxB >= 0 ? dataB[idxB + 1] : 255;
            const bB = idxB >= 0 ? dataB[idxB + 2] : 255;

            const distance = Math.sqrt(
                (rA - rB) ** 2 + (gA - gB) ** 2 + (bA - bB) ** 2
            );

            if (distance > threshold) {
                // Changed pixel — bright red glow
                out[idxOut] = 220;
                out[idxOut + 1] = 38;
                out[idxOut + 2] = 38;
                out[idxOut + 3] = 255;
                diffCount++;
            } else {
                // Unchanged pixel — greyscale at low opacity to show context
                const grey = Math.round(0.299 * rA + 0.587 * gA + 0.114 * bA);
                out[idxOut] = grey;
                out[idxOut + 1] = grey;
                out[idxOut + 2] = grey;
                out[idxOut + 3] = 180;
            }
        }
    }

    ctx.putImageData(diffImageData, 0, 0);

    return {
        pageNumber: pageA.pageNumber,
        diffPercentage: (diffCount / (width * height)) * 100,
        diffCount,
        totalPixels: width * height,
        diffDataUrl: canvas.toDataURL('image/png'),
    };
}
