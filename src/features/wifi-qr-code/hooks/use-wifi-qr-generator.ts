import { useState, useCallback } from 'react';
import { WifiQrConfig } from '../types';
import { DEFAULT_WIFI_QR_CONFIG } from '../constants';

function escapeSpecialChars(str: string): string {
    return str.replace(/([\\;,:"'])/g, '\\$1');
}

export function buildWifiString(config: WifiQrConfig): string {
    const ssid = escapeSpecialChars(config.ssid);
    const password = escapeSpecialChars(config.password);
    const encryption = config.encryption;
    const hidden = config.hidden ? 'H:true' : '';

    if (!config.ssid) return '';

    const parts = [
        `T:${encryption}`,
        `S:${ssid}`,
        encryption !== 'nopass' ? `P:${password}` : '',
        hidden,
    ].filter(Boolean);

    return `WIFI:${parts.join(';')};;`;
}

export function useWifiQrGenerator() {
    const [config, setConfig] = useState<WifiQrConfig>(DEFAULT_WIFI_QR_CONFIG);

    const updateConfig = useCallback((updates: Partial<WifiQrConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    }, []);

    const wifiString = buildWifiString(config);

    const downloadQr = useCallback(async (format: 'png' | 'svg', elementId: string) => {
        const canvas = document.getElementById(elementId) as HTMLCanvasElement | null;
        if (!canvas) return;

        if (format === 'png') {
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `wifi-qr-${config.ssid || 'code'}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'svg') {
            // For SVG, we re-render using a temporary SVG approach via canvas data
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `wifi-qr-${config.ssid || 'code'}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [config.ssid]);

    const resetConfig = useCallback(() => {
        setConfig(DEFAULT_WIFI_QR_CONFIG);
    }, []);

    return {
        config,
        updateConfig,
        wifiString,
        downloadQr,
        resetConfig,
    };
}
