import { CarouselConfig, CarouselImage, INSTAGRAM_SIZES } from './types';
import JSZip from 'jszip';

// Helper to load image for canvas
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
};

export async function generateCarouselDownloads(config: CarouselConfig): Promise<void> {
    const { width, height } = INSTAGRAM_SIZES[config.size];
    const totalWidth = width * config.slideCount;
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error("Could not get canvas context");

    // 1. Draw Background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, totalWidth, height);

    // 2. Draw Images
    // We sort by order to ensure z-index correctness
    const sortedImages = [...config.images].sort((a, b) => a.order - b.order);

    for (const imgData of sortedImages) {
        try {
            const img = await loadImage(imgData.url);

            ctx.save();

            const finalScale = (imgData.baseScale || 1) * imgData.scale;
            const drawWidth = img.naturalWidth * finalScale;
            const drawHeight = img.naturalHeight * finalScale;

            // Transform aligned with CSS 'transform-origin: 0 0' (Top-Left)
            // 1. Translate to the top-left position (which is the rotation pivot)
            ctx.translate(imgData.x, imgData.y);

            // 2. Rotate
            ctx.rotate((imgData.rotation * Math.PI) / 180);

            // 3. Draw at 0,0 (relative to translated origin) with scaled size
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

            ctx.restore();
        } catch (e) {
            console.error("Failed to load image", imgData.id, e);
        }
    }

    // 3. Slice and Zip
    const zip = new JSZip();
    const folder = zip.folder("instagram-carousel");

    for (let i = 0; i < config.slideCount; i++) {
        const slideCanvas = document.createElement('canvas');
        slideCanvas.width = width;
        slideCanvas.height = height;
        const slideCtx = slideCanvas.getContext('2d');

        if (slideCtx) {
            // Draw slice
            slideCtx.drawImage(
                canvas,
                i * width, 0, width, height, // source
                0, 0, width, height // dest
            );

            // Convert to blob
            const blob = await new Promise<Blob | null>(resolve => slideCanvas.toBlob(resolve, 'image/jpeg', 0.95));
            if (blob && folder) {
                folder.file(`slide-${i + 1}.jpg`, blob);
            }
        }
    }

    // Generate Zip
    const content = await zip.generateAsync({ type: "blob" });

    // Download Zip
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `carousel-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Layout Calculation Logic
export function recalculateLayout(config: CarouselConfig): CarouselConfig {
    const { width, height } = INSTAGRAM_SIZES[config.size];
    const newImages = [...config.images];
    let slideCount = config.slideCount;

    if (config.layout === 'grid') {
        slideCount = Math.max(1, newImages.length);
    }
    else if (config.layout === 'split') {
        if (slideCount < 2) slideCount = 3;
    }

    return {
        ...config,
        images: newImages,
        slideCount
    };
}
