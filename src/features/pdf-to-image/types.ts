export type ImageFormat = 'jpg' | 'png';

export interface ConversionOptions {
    scale: number; // e.g., 1.0, 1.5, 2.0
    format: ImageFormat;
    quality: number; // 0.1 to 1.0 (for jpg)
}

export interface PagePreview {
    pageNumber: number;
    width: number;
    height: number;
    imageUrl: string; // Data URL or Blob URL
    blob: Blob;
}

export interface ConversionResult {
    images: PagePreview[];
    zipBlob: Blob | null; // Null if only one page maybe? Or always provide zip.
    zipFileName: string;
}

export type ConversionStatus = 'idle' | 'processing' | 'completed' | 'error';
