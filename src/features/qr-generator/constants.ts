
import { QRConfig } from './types';

export const DEFAULT_QR_CONFIG: QRConfig = {
    value: 'https://xenkio.pages.dev',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    includeMargin: true,
    dotStyle: 'square',
    cornerStyle: 'square',
    gradient: {
        enabled: false,
        startColor: '#000000',
        endColor: '#0EA5E9',
        rotation: 45,
    },
    frame: {
        style: 'none',
        text: 'SCAN ME',
        color: '#000000',
    },
};

export const QR_ERROR_LEVELS = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' },
];
