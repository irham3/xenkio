'use client';

import { QRConfig } from '../types';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QrPreviewProps {
    config: QRConfig;
    onDownload: (format: 'png' | 'svg' | 'pdf') => void;
}

export function QrPreview({ config, onDownload }: QrPreviewProps) {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div
                className="relative flex items-center justify-center rounded-lg border border-gray-100 p-4 bg-white"
                style={{
                    width: 300,
                    height: 300,
                }}
            >
                <QRCodeSVG
                    value={config.value || 'https://xenkio.com'}
                    size={200}
                    bgColor={config.bgColor}
                    fgColor={config.fgColor}
                    level={config.level}
                    includeMargin={false}
                    imageSettings={config.imageSettings?.src ? config.imageSettings : undefined}
                />
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
                <Button onClick={() => onDownload('png')} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    PNG
                </Button>
                <Button onClick={() => onDownload('svg')} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    SVG
                </Button>
            </div>
        </div>
    );
}
