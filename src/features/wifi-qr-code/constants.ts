import { WifiQrConfig, WifiEncryption } from './types';

export const DEFAULT_WIFI_QR_CONFIG: WifiQrConfig = {
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    includeMargin: true,
};

export const ENCRYPTION_OPTIONS: { value: WifiEncryption; label: string }[] = [
    { value: 'WPA', label: 'WPA/WPA2/WPA3' },
    { value: 'WEP', label: 'WEP' },
    { value: 'nopass', label: 'None (Open Network)' },
];
