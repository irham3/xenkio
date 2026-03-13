
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiConfig {
    ssid: string;
    password: string;
    encryption: WifiEncryption;
    hidden: boolean;
}

export interface WifiQRConfig {
    wifi: WifiConfig;
    size: number;
    fgColor: string;
    bgColor: string;
    level: 'L' | 'M' | 'Q' | 'H';
    includeMargin: boolean;
}
