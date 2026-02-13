import { useState, useRef, useEffect, useCallback } from 'react';
import { BarcodeConfig } from '../types';
import { DEFAULT_BARCODE_CONFIG } from '../constants';
import { toast } from 'sonner';

export function useBarcodeGenerator() {
    const [config, setConfig] = useState<BarcodeConfig>(DEFAULT_BARCODE_CONFIG);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const updateConfig = (updates: Partial<BarcodeConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    const renderBarcode = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas || !config.value) {
            setError(null);
            return;
        }

        try {
            const JsBarcode = (await import('jsbarcode')).default;
            JsBarcode(canvas, config.value, {
                format: config.format,
                width: config.width,
                height: config.height,
                displayValue: config.displayValue,
                fontSize: config.fontSize,
                textMargin: config.textMargin,
                background: config.background,
                lineColor: config.lineColor,
                margin: 10,
            });
            setError(null);
        } catch {
            setError('Invalid value for the selected barcode format.');
        }
    }, [config]);

    useEffect(() => {
        renderBarcode();
    }, [renderBarcode]);

    const downloadBarcode = async (format: 'png' | 'svg') => {
        const canvas = canvasRef.current;
        if (!canvas || error) {
            toast.error('Cannot download: fix barcode errors first.');
            return;
        }

        if (format === 'png') {
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `barcode-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('PNG downloaded successfully!');
        } else {
            try {
                const JsBarcode = (await import('jsbarcode')).default;
                const SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                JsBarcode(SVG, config.value, {
                    format: config.format,
                    width: config.width,
                    height: config.height,
                    displayValue: config.displayValue,
                    fontSize: config.fontSize,
                    textMargin: config.textMargin,
                    background: config.background,
                    lineColor: config.lineColor,
                    margin: 10,
                    xmlDocument: document,
                });

                const serializer = new XMLSerializer();
                let source = serializer.serializeToString(SVG);
                if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
                    source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                }
                const finalSvg = '<?xml version="1.0" standalone="no"?>\r\n' + source;
                const blob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `barcode-${Date.now()}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success('SVG downloaded successfully!');
            } catch {
                toast.error('Failed to generate SVG. Try PNG instead.');
            }
        }
    };

    return {
        config,
        updateConfig,
        canvasRef,
        error,
        downloadBarcode,
    };
}
