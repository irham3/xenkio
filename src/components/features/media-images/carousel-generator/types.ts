export type CarouselSize = '1080x1080' | '1080x1350' | '1080x566';
export type CarouselLayout = 'grid' | 'collage' | 'split' | 'freeform';

export interface CarouselImage {
    id: string;
    file: File;
    url: string;
    width: number; // Natural width
    height: number; // Natural height
    // Position/Transform data
    x: number;
    y: number;
    scale: number; // User defined zoom
    baseScale: number; // Normalization factor
    rotation: number;
    order: number;
}

export interface CarouselConfig {
    size: CarouselSize;
    layout: CarouselLayout;
    backgroundColor: string;
    images: CarouselImage[];
    // Canvas settings
    slideCount: number; // calculated or manual
    gap: number; // gap between images in grid mode
}

export const INSTAGRAM_SIZES = {
    '1080x1080': { width: 1080, height: 1080, label: 'Square (1:1)' },
    '1080x1350': { width: 1080, height: 1350, label: 'Portrait (4:5)' },
    '1080x566': { width: 1080, height: 566, label: 'Landscape (1.91:1)' },
};
