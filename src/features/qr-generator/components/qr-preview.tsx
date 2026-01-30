'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRConfig } from '../types';
import { Button } from '@/components/ui/button';
import { FileImage, FileCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface QrPreviewProps {
  config: QRConfig;
  onDownload: (format: 'png' | 'svg' | 'pdf', elementId: string) => void;
}

// FrameLayer component moved outside to avoid "creating components during render" error
function FrameLayer({ config, SIZE }: { config: QRConfig; SIZE: number }) {
  if (!config.frame || config.frame.style === 'none') return null;

  const { style, text, color } = config.frame;
  const CENTER = SIZE / 2;

  if (style === 'simple') {
    return (
      <g>
        <rect x="10" y="10" width={SIZE - 20} height={SIZE - 20} rx="24" ry="24" fill="none" stroke={color} strokeWidth="8" />
        <rect x={CENTER - 80} y={SIZE - 55} width="160" height="40" rx="8" fill="white" stroke={color} strokeWidth="2" />
        <text x={CENTER} y={SIZE - 28} textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
          {text}
        </text>
      </g>
    );
  }

  if (style === 'modern') {
    return (
      <g>
        <rect x="0" y="0" width={SIZE} height={SIZE} rx="40" ry="40" fill={color} fillOpacity="0.08" />
        <rect x={CENTER - 90} y="15" width="180" height="40" rx="20" fill={color} />
        <text x={CENTER} y="41" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="black" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
          {text}
        </text>
      </g>
    );
  }

  if (style === 'badge') {
    return (
      <g>
        <rect x="0" y="0" width={SIZE} height={SIZE} rx="20" ry="20" fill="white" stroke="#f3f4f6" strokeWidth="2" />
        <path d={`M 0 20 A 20 20 0 0 1 20 0 L ${SIZE - 20} 0 A 20 20 0 0 1 ${SIZE} 20 L ${SIZE} 60 L 0 60 Z`} fill={color} />
        <text x={CENTER} y="38" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '3px' }}>
          {text}
        </text>
        <rect x="20" y="80" width={SIZE - 40} height={SIZE - 100} rx="12" fill={color} fillOpacity="0.03" />
      </g>
    );
  }

  return null;
}

export function QrPreview({ config, onDownload }: QrPreviewProps) {
  // Use state lazy initializer for stable ID, which is pure
  const [gradientId] = useState(() => `qr-gradient-${Math.random().toString(36).substring(2, 11)}`);
  const svgId = 'qr-preview-svg';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matrix, setMatrix] = useState<boolean[][]>([]);

  // Memoized function to extract matrix from canvas
  const extractMatrix = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const imageData = ctx.getImageData(0, 0, size, size).data;

    // 1. Find the first black pixel (start of top-left finder pattern)
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

    // 2. Measure the finder pattern (7 modules wide)
    let finderWidth = 0;
    for (let i = startX; i < size; i++) {
      const idx = (startY * size + i) * 4;
      if (imageData[idx] < 128) finderWidth++;
      else break;
    }

    // 3. Precise module size
    const modSize = finderWidth / 7;
    const modulesCount = Math.round((size - startX * 2) / modSize);

    const newMatrix: boolean[][] = [];
    for (let r = 0; r < modulesCount; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < modulesCount; c++) {
        // Sample the center of the module
        const x = Math.floor(startX + (c + 0.5) * modSize);
        const y = Math.floor(startY + (r + 0.5) * modSize);
        const idx = (y * size + x) * 4;
        row.push(imageData[idx] < 128);
      }
      newMatrix.push(row);
    }
    return newMatrix;
  }, []);

  // Capture the matrix from a hidden canvas
  useEffect(() => {
    // Use requestAnimationFrame to defer state update
    const rafId = requestAnimationFrame(() => {
      const newMatrix = extractMatrix();
      if (newMatrix) {
        setMatrix(newMatrix);
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [config.value, config.level, extractMatrix]);

  // Fixed canvas size for display
  const SIZE = 350;
  const QR_SIZE = 220;
  const OFFSET = (SIZE - QR_SIZE) / 2;

  const renderDots = () => {
    if (matrix.length === 0) return null;

    const moduleCount = matrix.length;
    const mSize = QR_SIZE / moduleCount;
    const dots: React.ReactNode[] = [];

    // Helper to check if a module is part of the 3 main corners
    const isCorner = (r: number, c: number) => {
      // Top-left: (0,0) to (6,6)
      if (r < 7 && c < 7) return true;
      // Top-right: (0, N-7) to (6, N-1)
      if (r < 7 && c >= moduleCount - 7) return true;
      // Bottom-left: (N-7, 0) to (N-1, 6)
      if (r >= moduleCount - 7 && c < 7) return true;
      return false;
    };

    // Helper to check if a module is masked by the logo
    const isMaskedByLogo = (r: number, c: number) => {
      if (!config.imageSettings?.excavate) return false;
      const logoSize = config.imageSettings.width;
      const logoModules = (logoSize / QR_SIZE) * moduleCount;
      const center = moduleCount / 2;
      const half = logoModules / 2 + 0.5;
      return r > center - half && r < center + half && c > center - half && c < center + half;
    };

    matrix.forEach((row, r) => {
      row.forEach((isOn, c) => {
        if (!isOn || isCorner(r, c) || isMaskedByLogo(r, c)) return;

        const x = c * mSize;
        const y = r * mSize;

        if (config.dotStyle === 'dots') {
          dots.push(<circle key={`d-${r}-${c}`} cx={x + mSize / 2} cy={y + mSize / 2} r={mSize / 2 * 0.85} />);
        } else if (config.dotStyle === 'rounded') {
          dots.push(<rect key={`d-${r}-${c}`} x={x + 0.5} y={y + 0.5} width={mSize - 1} height={mSize - 1} rx={mSize / 3} ry={mSize / 3} />);
        } else {
          dots.push(<rect key={`d-${r}-${c}`} x={x} y={y} width={mSize} height={mSize} />);
        }
      });
    });

    return dots;
  };

  const renderCorners = () => {
    if (matrix.length === 0) return null;
    const moduleCount = matrix.length;
    const mSize = QR_SIZE / moduleCount;
    const corners: React.ReactNode[] = [];

    const fallbackFill = config.gradient?.enabled ? `url(#${gradientId})` : config.fgColor;

    const drawCorner = (x: number, y: number, key: string) => {
      const outerSize = 7 * mSize;
      const innerSize = 3 * mSize;
      const innerOffset = 2 * mSize;

      let radius = 0;
      if (config.cornerStyle === 'rounded') radius = mSize * 1.5;
      if (config.cornerStyle === 'extra-rounded') radius = mSize * 3;

      corners.push(
        <g key={key} transform={`translate(${x}, ${y})`}>
          {/* Outer square */}
          <path
            d={`M ${radius} 0 L ${outerSize - radius} 0 A ${radius} ${radius} 0 0 1 ${outerSize} ${radius} L ${outerSize} ${outerSize - radius} A ${radius} ${radius} 0 0 1 ${outerSize - radius} ${outerSize} L ${radius} ${outerSize} A ${radius} ${radius} 0 0 1 0 ${outerSize - radius} L 0 ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z
                       M ${mSize + radius / 2} ${mSize} A ${radius / 2} ${radius / 2} 0 0 0 ${mSize} ${mSize + radius / 2} L ${mSize} ${outerSize - mSize - radius / 2} A ${radius / 2} ${radius / 2} 0 0 0 ${mSize + radius / 2} ${outerSize - mSize} L ${outerSize - mSize - radius / 2} ${outerSize - mSize} A ${radius / 2} ${radius / 2} 0 0 0 ${outerSize - mSize} ${outerSize - mSize - radius / 2} L ${outerSize - mSize} ${mSize + radius / 2} A ${radius / 2} ${radius / 2} 0 0 0 ${outerSize - mSize - radius / 2} ${mSize} Z`}
            fill={config.cornerColor || fallbackFill}
            fillRule="evenodd"
          />
          {/* Inner square */}
          <rect
            x={innerOffset}
            y={innerOffset}
            width={innerSize}
            height={innerSize}
            rx={radius / 3}
            ry={radius / 3}
            fill={config.cornerDotColor || fallbackFill}
          />
        </g>
      );
    };

    drawCorner(0, 0, 'c1');
    drawCorner((moduleCount - 7) * mSize, 0, 'c2');
    drawCorner(0, (moduleCount - 7) * mSize, 'c3');

    return corners;
  };

  const renderLogo = () => {
    if (!config.imageSettings?.src) return null;
    const { src, width, opacity, borderRadius, borderSize, borderColor } = config.imageSettings;
    const size = width;
    const x = (QR_SIZE - size) / 2;
    const y = (QR_SIZE - size) / 2;

    return (
      <g transform={`translate(${x}, ${y})`}>
        {borderSize && borderSize > 0 && (
          <rect
            x={-borderSize}
            y={-borderSize}
            width={size + borderSize * 2}
            height={size + borderSize * 2}
            rx={(borderRadius || 0) + borderSize}
            fill={borderColor || config.bgColor}
          />
        )}
        <defs>
          <clipPath id="logo-clip">
            <rect x="0" y="0" width={size} height={size} rx={borderRadius || 0} />
          </clipPath>
        </defs>
        <image
          href={src}
          width={size}
          height={size}
          opacity={opacity ?? 1}
          clipPath="url(#logo-clip)"
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm">

      {/* Hidden QRCodeCanvas to extract matrix */}
      <div className="hidden">
        <QRCodeCanvas
          ref={canvasRef}
          value={config.value || 'https://xenkio.com'}
          size={128} // Use fixed small size for matrix extraction
          level={config.level}
          marginSize={0}
        />
      </div>

      <div className="flex items-center justify-center bg-white p-4 rounded-xl shadow-sm overflow-hidden">
        <svg
          id={svgId}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {config.gradient?.enabled && (
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform={`rotate(${config.gradient.rotation})`}>
                <stop offset="0%" stopColor={config.gradient.startColor} />
                <stop offset="100%" stopColor={config.gradient.endColor} />
              </linearGradient>
            )}
          </defs>

          {/* Background */}
          <rect x="0" y="0" width={SIZE} height={SIZE} fill={config.bgColor} rx="12" />

          {/* Frame Layer */}
          <FrameLayer config={config} SIZE={SIZE} />

          {/* QR Code and Logo */}
          <g
            transform={`translate(${OFFSET}, ${OFFSET})`}
            fill={config.gradient?.enabled ? `url(#${gradientId})` : config.fgColor}
          >
            {renderDots()}
            {renderCorners()}
            {renderLogo()}
          </g>
        </svg>
      </div>

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
