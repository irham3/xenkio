export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'ico' | 'svg' | 'gif' | 'tiff' | 'avif' | 'heic';

export interface ImageFile {
    id: string;
    file: File;
    name: string;
    size: number;
    preview: string;
    width: number;
    height: number;
    status: 'idle' | 'converting' | 'done' | 'error';
    convertedUrl?: string; // Blob URL of converted file
    convertedSize?: number;
    error?: string;
}

export interface ConversionOptions {
    targetFormat: ImageFormat;
    quality: number; // 0.1 to 1.0 (for jpeg/webp)
    width?: number; // Optional resize
    height?: number; // Optional resize
    maintainAspectRatio: boolean;
}
