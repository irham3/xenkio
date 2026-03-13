
import { useState, useCallback } from 'react';
import { WifiQRConfig, WifiConfig } from '../types';
import { DEFAULT_WIFI_QR_CONFIG } from '../constants';

export function useWifiQrGenerator() {
    const [config, setConfig] = useState<WifiQRConfig>(DEFAULT_WIFI_QR_CONFIG);

    const updateWifi = useCallback((updates: Partial<WifiConfig>) => {
        setConfig((prev) => ({
            ...prev,
            wifi: { ...prev.wifi, ...updates },
        }));
    }, []);

    const updateConfig = useCallback((updates: Partial<WifiQRConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    }, []);

    const downloadQr = useCallback(async (format: 'png' | 'svg', elementId: string) => {
        const svgElement = document.getElementById(elementId) as unknown as SVGSVGElement;
        if (!svgElement) return;

        try {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);

            if (!source.includes('http://www.w3.org/2000/svg')) {
                source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }

            const viewBox = svgElement.viewBox.baseVal;
            const width = viewBox.width || 350;
            const height = viewBox.height || 350;

            if (!source.includes('width="')) {
                source = source.replace('<svg', `<svg width="${width}" height="${height}"`);
            }

            const finalSvg = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            const blob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            if (format === 'svg') {
                const link = document.createElement('a');
                link.href = url;
                link.download = `wifi-qr-${Date.now()}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                const canvas = document.createElement('canvas');
                const targetSize = 2048;
                canvas.width = targetSize;
                canvas.height = targetSize;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const pngUrl = canvas.toDataURL('image/png', 1.0);
                    const link = document.createElement('a');
                    link.href = pngUrl;
                    link.download = `wifi-qr-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            }
        } catch (err) {
            console.error('Download failed:', err);
        }
    }, []);

    return {
        config,
        updateWifi,
        updateConfig,
        downloadQr,
    };
}
