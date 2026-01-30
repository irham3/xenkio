
import { type Crop, type PixelCrop } from 'react-image-crop';

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export interface ResizeConfig {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
    quality: number; // 0-100
    format: ImageFormat;
}

export interface ImageState {
    src: string | null;
    originalWidth: number;
    originalHeight: number;
    file: File | null;
    crop?: Crop;
    completedCrop?: PixelCrop;
    rotation: number;
}

export const DEFAULT_RESIZE_CONFIG: ResizeConfig = {
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    quality: 90,
    format: 'png',
};
