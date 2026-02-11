import { CompressionSettings } from './types';

export const DEFAULT_SETTINGS: CompressionSettings = {
    level: 'medium',
    removeMetadata: true,
    compressImages: true,
    imageQuality: 0.7,
};

export const COMPRESSION_LEVELS: Record<string, Partial<CompressionSettings>> = {
    low: {
        imageQuality: 0.9,
    },
    medium: {
        imageQuality: 0.6,
    },
    high: {
        imageQuality: 0.3,
    },
};
