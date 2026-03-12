'use client';

import { WifiQrConfig } from '../types';
import { Button } from '@/components/ui/button';
import { FileImage, Copy, Check, Wifi } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import { buildWifiString } from '../hooks/use-wifi-qr-generator';

interface WifiQrPreviewProps {
    config: WifiQrConfig;
    onDownload: (format: 'png' | 'svg', elementId: string) => void;
}

export function WifiQrPreview({ config, onDownload }: WifiQrPreviewProps) {
    const [copied, setCopied] = useState(false);
    const canvasId = 'wifi-qr-canvas';
    const wifiString = buildWifiString(config);
    const hasContent = config.ssid.length > 0;

    const handleCopyString = async () => {
        if (!wifiString) return;
        try {
            await navigator.clipboard.writeText(wifiString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = wifiString;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm">
            <div className="relative flex items-center justify-center bg-white p-6 rounded-xl shadow-sm">
                {hasContent ? (
                    <QRCodeCanvas
                        id={canvasId}
                        value={wifiString}
                        size={config.size}
                        fgColor={config.fgColor}
                        bgColor={config.bgColor}
                        level={config.level}
                        marginSize={config.includeMargin ? 2 : 0}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-[256px] h-[256px] text-gray-400">
                        <Wifi className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-sm text-center">Enter your WiFi details to generate a QR code</p>
                    </div>
                )}
            </div>

            {hasContent && (
                <>
                    {/* WiFi String Display */}
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">WiFi String</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-3">
                            <code className="flex-1 text-xs text-gray-700 break-all font-mono">
                                {wifiString}
                            </code>
                            <button
                                type="button"
                                onClick={handleCopyString}
                                className="shrink-0 p-1.5 rounded-md hover:bg-gray-200 transition-colors text-gray-500"
                                title="Copy WiFi string"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="w-full max-w-xs">
                        <Button
                            onClick={() => onDownload('png', canvasId)}
                            className="w-full"
                        >
                            <FileImage className="mr-2 h-4 w-4" />
                            Download PNG
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
