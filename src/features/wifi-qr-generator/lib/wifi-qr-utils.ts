
import { WifiConfig } from '../types';

/**
 * Escapes special characters in WiFi QR code string fields.
 * Characters that need escaping: \ ; , " :
 */
function escapeWifiField(value: string): string {
    return value.replace(/([\\;,":])/, '\\$1');
}

/**
 * Generates the WiFi QR code string in the standard format:
 * WIFI:T:<encryption>;S:<ssid>;P:<password>;H:<hidden>;;
 */
export function generateWifiString(config: WifiConfig): string {
    const parts: string[] = ['WIFI:'];

    parts.push(`T:${config.encryption};`);
    parts.push(`S:${escapeWifiField(config.ssid)};`);

    if (config.encryption !== 'nopass' && config.password) {
        parts.push(`P:${escapeWifiField(config.password)};`);
    }

    if (config.hidden) {
        parts.push('H:true;');
    }

    parts.push(';');

    return parts.join('');
}
