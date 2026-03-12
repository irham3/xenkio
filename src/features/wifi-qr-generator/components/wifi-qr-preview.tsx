'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WifiQRConfig } from '../types';
import { generateWifiString } from '../lib/wifi-qr-utils';
import { Button } from '@/components/ui/button';
import { FileImage, FileCode, CheckCircle2, XCircle, Loader2, Wifi } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';

interface WifiQrPreviewProps {
    config: WifiQRConfig;
    onDownload: (format: 'png' | 'svg', elementId: string) => void;
}

export function WifiQrPreview({ config, onDownload }: WifiQrPreviewProps) {
    const svgId = 'wifi-qr-preview-svg';
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [matrix, setMatrix] = useState<boolean[][]>([]);
    const [isScannable, setIsScannable] = useState<boolean | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const wifiString = generateWifiString(config.wifi);
    const hasSSID = config.wifi.ssid.trim().length > 0;

    const extractMatrix = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvas.width;
        const imageData = ctx.getImageData(0, 0, size, size).data;

        let firstBlack = -1;
        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i] < 128) {
                firstBlack = i / 4;
                break;
            }
        }

        if (firstBlack === -1) return;

        const startX = firstBlack % size;
        const startY = Math.floor(firstBlack / size);

        let finderWidth = 0;
        for (let i = startX; i < size; i++) {
            const idx = (startY * size + i) * 4;
            if (imageData[idx] < 128) finderWidth++;
            else break;
        }

        const modSize = finderWidth / 7;
        const modulesCount = Math.round((size - startX * 2) / modSize);

        const newMatrix: boolean[][] = [];
        for (let r = 0; r < modulesCount; r++) {
            const row: boolean[] = [];
            for (let c = 0; c < modulesCount; c++) {
                const x = Math.floor(startX + (c + 0.5) * modSize);
                const y = Math.floor(startY + (r + 0.5) * modSize);
                const idx = (y * size + x) * 4;
                row.push(imageData[idx] < 128);
            }
            newMatrix.push(row);
        }
        return newMatrix;
    }, []);

    useEffect(() => {
        if (!hasSSID) return;
        const rafId = requestAnimationFrame(() => {
            const newMatrix = extractMatrix();
            if (newMatrix) {
                setMatrix(newMatrix);
            }
        });
        return () => cancelAnimationFrame(rafId);
    }, [wifiString, config.level, hasSSID, extractMatrix]);

    // Scannability check
    useEffect(() => {
        if (!hasSSID) {
            const rafId = requestAnimationFrame(() => setIsScannable(null));
            return () => cancelAnimationFrame(rafId);
        }

        const svg = document.getElementById(svgId) as SVGSVGElement | null;
        if (!svg) return;

        const rafId = requestAnimationFrame(() => setIsValidating(true));
        const timeoutId = setTimeout(() => {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            const svgSize = 350;
            canvas.width = svgSize;
            canvas.height = svgSize;

            img.onload = () => {
                if (!ctx) return;
                ctx.fillStyle = config.bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                setIsScannable(!!code);
                setIsValidating(false);
            };

            const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
            img.src = base64;
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
        };
    }, [config, hasSSID, svgId]);

    const SIZE = 350;
    const QR_SIZE = 220;
    const OFFSET = (SIZE - QR_SIZE) / 2;

    const renderDots = () => {
        if (matrix.length === 0) return null;

        const moduleCount = matrix.length;
        const mSize = QR_SIZE / moduleCount;
        const dots: React.ReactNode[] = [];

        const isCorner = (r: number, c: number) => {
            if (r < 7 && c < 7) return true;
            if (r < 7 && c >= moduleCount - 7) return true;
            if (r >= moduleCount - 7 && c < 7) return true;
            return false;
        };

        matrix.forEach((row, r) => {
            row.forEach((isOn, c) => {
                if (!isOn || isCorner(r, c)) return;
                const x = c * mSize;
                const y = r * mSize;
                dots.push(
                    <rect key={`d-${r}-${c}`} x={x} y={y} width={mSize} height={mSize} />
                );
            });
        });

        return dots;
    };

    const renderCorners = () => {
        if (matrix.length === 0) return null;
        const moduleCount = matrix.length;
        const mSize = QR_SIZE / moduleCount;
        const corners: React.ReactNode[] = [];

        const drawCorner = (x: number, y: number, key: string) => {
            const outerSize = 7 * mSize;
            const innerSize = 3 * mSize;
            const innerOffset = 2 * mSize;
            const radius = mSize * 1.5;

            corners.push(
                <g key={key} transform={`translate(${x}, ${y})`}>
                    <path
                        d={`M ${radius} 0 L ${outerSize - radius} 0 A ${radius} ${radius} 0 0 1 ${outerSize} ${radius} L ${outerSize} ${outerSize - radius} A ${radius} ${radius} 0 0 1 ${outerSize - radius} ${outerSize} L ${radius} ${outerSize} A ${radius} ${radius} 0 0 1 0 ${outerSize - radius} L 0 ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z
                               M ${mSize + radius / 2} ${mSize} A ${radius / 2} ${radius / 2} 0 0 0 ${mSize} ${mSize + radius / 2} L ${mSize} ${outerSize - mSize - radius / 2} A ${radius / 2} ${radius / 2} 0 0 0 ${mSize + radius / 2} ${outerSize - mSize} L ${outerSize - mSize - radius / 2} ${outerSize - mSize} A ${radius / 2} ${radius / 2} 0 0 0 ${outerSize - mSize} ${outerSize - mSize - radius / 2} L ${outerSize - mSize} ${mSize + radius / 2} A ${radius / 2} ${radius / 2} 0 0 0 ${outerSize - mSize - radius / 2} ${mSize} Z`}
                        fill={config.fgColor}
                        fillRule="evenodd"
                    />
                    <rect
                        x={innerOffset}
                        y={innerOffset}
                        width={innerSize}
                        height={innerSize}
                        rx={radius / 3}
                        ry={radius / 3}
                        fill={config.fgColor}
                    />
                </g>
            );
        };

        drawCorner(0, 0, 'c1');
        drawCorner((moduleCount - 7) * mSize, 0, 'c2');
        drawCorner(0, (moduleCount - 7) * mSize, 'c3');

        return corners;
    };

    // Empty state
    if (!hasSSID) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
                    <Wifi className="w-10 h-10 text-gray-300" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-gray-500">Enter your WiFi details</p>
                    <p className="text-xs text-gray-400">QR code will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm">
            {/* Hidden canvas for matrix extraction */}
            <div className="hidden">
                <QRCodeCanvas
                    ref={canvasRef}
                    value={wifiString}
                    size={128}
                    level={config.level}
                    marginSize={0}
                />
            </div>

            <div className="relative flex items-center justify-center bg-white p-4 rounded-xl shadow-sm overflow-hidden">
                {/* Scannability Badge */}
                <div className="absolute top-2 right-2 z-10">
                    {isValidating ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Validating...
                        </div>
                    ) : isScannable ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            Safe to Scan
                        </div>
                    ) : isScannable === false ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider border border-red-100 shadow-sm">
                            <XCircle className="w-3 h-3" />
                            Unscannable
                        </div>
                    ) : null}
                </div>

                <svg
                    id={svgId}
                    width={SIZE}
                    height={SIZE}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect x="0" y="0" width={SIZE} height={SIZE} fill={config.bgColor} rx="12" />
                    <g
                        transform={`translate(${OFFSET}, ${OFFSET})`}
                        fill={config.fgColor}
                    >
                        {renderDots()}
                        {renderCorners()}
                    </g>
                </svg>
            </div>

            {/* WiFi Info Summary */}
            <div className="w-full max-w-xs space-y-1 text-center">
                <p className="text-sm font-medium text-gray-700 truncate">
                    {config.wifi.ssid}
                </p>
                <p className="text-xs text-gray-400">
                    {config.wifi.encryption === 'nopass' ? 'Open Network' : config.wifi.encryption}
                    {config.wifi.hidden ? ' · Hidden' : ''}
                </p>
            </div>

            {/* Download Buttons */}
            <div className="grid w-full grid-cols-2 gap-3 max-w-xs">
                <Button onClick={() => onDownload('png', svgId)} className="w-full">
                    <FileImage className="mr-2 h-4 w-4" />
                    PNG
                </Button>
                <Button onClick={() => onDownload('svg', svgId)} variant="outline" className="w-full">
                    <FileCode className="mr-2 h-4 w-4" />
                    SVG
                </Button>
            </div>
        </div>
    );
}
