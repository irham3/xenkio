export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiQrConfig {
    ssid: string;
    password: string;
    encryption: WifiEncryption;
    hidden: boolean;
    size: number;
    fgColor: string;
    bgColor: string;
    level: 'L' | 'M' | 'Q' | 'H';
    includeMargin: boolean;
}
