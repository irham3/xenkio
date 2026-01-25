
import { QRConfig } from './types';

export const DEFAULT_QR_CONFIG: QRConfig = {
    value: 'https://xenkio.com',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    includeMargin: true,
};

export const QR_ERROR_LEVELS = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' },
];
