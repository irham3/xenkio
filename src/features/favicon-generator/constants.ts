import { FaviconSize } from './types';

export const FAVICON_SIZES: FaviconSize[] = [
  { width: 16, height: 16, label: '16×16' },
  { width: 32, height: 32, label: '32×32' },
  { width: 48, height: 48, label: '48×48' },
  { width: 64, height: 64, label: '64×64' },
  { width: 128, height: 128, label: '128×128' },
  { width: 180, height: 180, label: '180×180', isAppleTouch: true },
  { width: 192, height: 192, label: '192×192' },
  { width: 512, height: 512, label: '512×512' },
];

export const ICO_SIZES = [16, 32, 48];

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.svg';
