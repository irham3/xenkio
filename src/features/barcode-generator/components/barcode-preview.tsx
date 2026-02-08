'use client';

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { BarcodeConfig } from '../types';
import { Button } from '@/components/ui/button';
import { Download, FileCode, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodePreviewProps {
    config: BarcodeConfig;
}

export function BarcodePreview({ config }: BarcodePreviewProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Use a timeout to avoid synchronous state updates during render
        const timeoutId = setTimeout(() => {
            if (!svgRef.current) return;

            // Clear previous states
            setError(null);
            svgRef.current.innerHTML = '';

            try {
                // Remove all whitespace
                const safeValue = config.value.replace(/\s/g, '');

                if (!safeValue) {
                    setError("Please enter a value.");
                    return;
                }

                JsBarcode(svgRef.current, safeValue, {
                    format: config.format,
                    width: config.width,
                    height: config.height,
                    displayValue: config.displayValue,
                    text: safeValue,
                    fontOptions: config.fontOptions,
                    font: config.font,
                    textAlign: config.textAlign,
                    textPosition: config.textPosition,
                    textMargin: config.textMargin,
                    fontSize: config.fontSize,
                    background: config.background,
                    lineColor: config.lineColor,
                    margin: config.margin,
                    valid: (valid) => {
                        if (!valid) {
                            let msg = `Invalid value for ${config.format}.`;
                            const len = safeValue.length;

                            // Detailed feedback for common strict formats
                            if (config.format === 'EAN13') {
                                if (!/^\d+$/.test(safeValue)) msg = "EAN-13 requires only digits (0-9).";
                                else if (len !== 12 && len !== 13) msg = `EAN-13 must be exactly 12 or 13 digits (Current: ${len}).`;
                                else msg = "EAN-13: Invalid check digit or sequence.";
                            } else if (config.format === 'EAN8') {
                                if (!/^\d+$/.test(safeValue)) msg = "EAN-8 requires only digits (0-9).";
                                else if (len !== 7 && len !== 8) msg = `EAN-8 must be 7 or 8 digits (Current: ${len}).`;
                                else msg = "EAN-8: Invalid check digit.";
                            } else if (config.format === 'UPC') {
                                if (!/^\d+$/.test(safeValue)) msg = "UPC requires only digits (0-9).";
                                else if (len !== 11 && len !== 12) msg = `UPC requires 11 or 12 digits (Current: ${len}).`;
                                else msg = "UPC: Invalid check digit.";
                            } else if (config.format === 'CODE128C') {
                                if (!/^\d+$/.test(safeValue)) msg = "CODE128C requires only digits (0-9).";
                                else if (len % 2 !== 0) msg = `CODE128C requires an even amount of digits (Current: ${len}).`;
                            } else if (config.format === 'ITF14') {
                                if (!/^\d+$/.test(safeValue)) msg = "ITF-14 requires only digits (0-9).";
                                else if (len !== 13) msg = `ITF-14 requires exactly 13 digits (Current: ${len}).`;
                            }

                            setError(msg);
                        } else {
                            setError(null);
                        }
                    }
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Invalid value for this format');
            }
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [config]);

    const downloadPng = () => {
        try {
            const canvas = document.createElement('canvas');
            const safeValue = config.value.replace(/\s/g, '');
            JsBarcode(canvas, safeValue, {
                format: config.format,
                width: config.width,
                height: config.height,
                displayValue: config.displayValue,
                text: safeValue,
                fontOptions: config.fontOptions,
                font: config.font,
                textAlign: config.textAlign,
                textPosition: config.textPosition,
                textMargin: config.textMargin,
                fontSize: config.fontSize,
                background: config.background,
                lineColor: config.lineColor,
                margin: config.margin,
            });

            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `barcode-${safeValue}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch {
            toast.error('Failed to generate PNG. Please check input value.');
        }
    };

    const downloadSvg = () => {
        if (!svgRef.current) return;

        try {
            const svgData = new XMLSerializer().serializeToString(svgRef.current);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const safeValue = config.value.replace(/\s/g, '');

            const a = document.createElement('a');
            a.href = url;
            a.download = `barcode-${safeValue}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch {
            toast.error('Failed to download SVG.');
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            {/* Visual Preview Area */}
            <div className="w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-8 min-h-[300px] overflow-hidden relative">
                {error && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/95 text-red-500 p-4 text-center">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p className="font-medium text-lg">Invalid Data</p>
                        <p className="text-sm">{error}</p>
                        <p className="text-xs text-gray-400 mt-2 max-w-xs">
                            Please check the input value according to the {config.format} format.
                        </p>
                    </div>
                )}
                <svg ref={svgRef} className="max-w-full h-auto shadow-sm" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Button
                    variant="outline"
                    className="w-full h-12 gap-2"
                    onClick={downloadSvg}
                    disabled={!!error}
                >
                    <FileCode className="w-4 h-4" />
                    Download SVG
                </Button>
                <Button
                    className="w-full h-12 gap-2 bg-primary-600 hover:bg-primary-700"
                    onClick={downloadPng}
                    disabled={!!error}
                >
                    <Download className="w-4 h-4" />
                    Download PNG
                </Button>
            </div>

            <p className="text-xs text-gray-500 text-center px-4">
                Looking for custom formats? Try changing the &quot;Format&quot; option in the configuration panel.
            </p>
        </div>
    );
}
