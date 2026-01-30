
import { useState } from 'react';
import { QRConfig } from '../types';
import { DEFAULT_QR_CONFIG } from '../constants';

export function useQrGenerator() {
    const [config, setConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);

    const updateConfig = (updates: Partial<QRConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    const downloadQr = async (format: 'png' | 'svg' | 'pdf', elementId: string) => {
        const svgElement = document.getElementById(elementId) as unknown as SVGSVGElement;

        if (!svgElement) {
            console.error('QR Code SVG element not found');
            return;
        }

        try {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);

            // Ensure XML declaration and correct namespace
            if (!source.includes('http://www.w3.org/2000/svg')) {
                source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }

            // Add fixed dimensions for rendering if missing
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
                link.download = `qrcode-${Date.now()}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else if (format === 'png') {
                const canvas = document.createElement('canvas');

                // Professional resolution (e.g., 2000px)
                const targetSize = 2048;

                canvas.width = targetSize;
                canvas.height = targetSize;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const img = new Image();
                img.crossOrigin = 'anonymous'; // Just in case
                img.onload = () => {
                    // Fill background first (some transparent SVGs need this, but our SVG has a rect)
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const pngUrl = canvas.toDataURL('image/png', 1.0);

                    const link = document.createElement('a');
                    link.href = pngUrl;
                    link.download = `qrcode-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            } else {
                alert('PDF download not implemented yet');
            }
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download QR code');
        }
    };

    return {
        config,
        updateConfig,
        downloadQr,
    };
}
