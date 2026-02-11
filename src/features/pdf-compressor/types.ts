export type CompressionLevel = 'low' | 'medium' | 'high';

export interface CompressionSettings {
    level: CompressionLevel;
    removeMetadata: boolean;
    compressImages: boolean;
    imageQuality: number; // 0.1 to 1.0
}

export interface CompressionResult {
    originalSize: number;
    compressedSize: number;
    savings: number;
    url: string;
}
