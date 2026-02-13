'use client';

import { useCallback, useRef } from 'react';
import { useSvgToPng } from '../hooks/use-svg-to-png';
import { SCALE_OPTIONS } from '../constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Upload,
  Download,
  Maximize2,
  Lock,
  Unlock,
  Image,
  X,
  FileCode,
} from 'lucide-react';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SvgToPngConverter() {
  const {
    config,
    svgDimensions,
    result,
    isConverting,
    updateConfig,
    updateCustomWidth,
    updateCustomHeight,
    updateScale,
    toggleAspectRatio,
    setSvgFromFile,
    setSvgFromCode,
    convert,
    download,
    reset,
  } = useSvgToPng();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) setSvgFromFile(file);
    },
    [setSvgFromFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setSvgFromFile(file);
      e.target.value = '';
    },
    [setSvgFromFile]
  );

  const hasSvg = config.svgContent.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-7 space-y-8">
        {/* Section 1: SVG Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">
              1
            </span>
            SVG Input
          </h2>

          {/* Upload Zone */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Upload SVG File
            </Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                'hover:border-primary-400 hover:bg-primary-50/50',
                hasSvg
                  ? 'border-primary-300 bg-primary-50/30'
                  : 'border-gray-300 bg-gray-50'
              )}
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Drag & drop SVG file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports .svg files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Or divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs font-medium text-gray-400 uppercase">
                or
              </span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* SVG Code Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Paste SVG Code
              </Label>
              <textarea
                value={config.svgContent}
                onChange={(e) => setSvgFromCode(e.target.value)}
                placeholder="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; ...>&#10;  ...&#10;</svg>"
                className={cn(
                  'w-full h-40 rounded-lg border border-gray-300 px-3 py-2',
                  'font-mono text-sm resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'placeholder:text-gray-400'
                )}
              />
            </div>

            {hasSvg && (
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="text-gray-500"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Section 2: Output Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">
              2
            </span>
            Output Settings
          </h2>

          <div className="space-y-6">
            {/* Scale Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Scale</Label>
              <div className="flex gap-2">
                {SCALE_OPTIONS.map((s) => (
                  <Button
                    key={s}
                    variant={
                      !config.useCustomSize && config.scale === s
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => {
                      updateScale(s);
                      updateConfig({ useCustomSize: false });
                    }}
                    className="flex-1"
                  >
                    {s}x
                  </Button>
                ))}
              </div>
              {svgDimensions && !config.useCustomSize && (
                <p className="text-xs text-gray-500">
                  Output: {Math.round(svgDimensions.width * config.scale)} ×{' '}
                  {Math.round(svgDimensions.height * config.scale)}px
                </p>
              )}
            </div>

            {/* Custom Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Custom Size
                </Label>
                <Button
                  variant={config.useCustomSize ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateConfig({ useCustomSize: !config.useCustomSize })
                  }
                >
                  {config.useCustomSize ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {config.useCustomSize && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-gray-500">Width (px)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={8192}
                      value={config.customWidth}
                      onChange={(e) =>
                        updateCustomWidth(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="font-mono text-sm"
                    />
                  </div>

                  <button
                    onClick={toggleAspectRatio}
                    className={cn(
                      'mt-5 p-2 rounded-md border transition-colors',
                      config.aspectRatioLocked
                        ? 'border-primary-300 bg-primary-50 text-primary-600'
                        : 'border-gray-300 text-gray-400 hover:text-gray-600'
                    )}
                    title={
                      config.aspectRatioLocked
                        ? 'Unlock aspect ratio'
                        : 'Lock aspect ratio'
                    }
                  >
                    {config.aspectRatioLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-gray-500">
                      Height (px)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={8192}
                      value={config.customHeight}
                      onChange={(e) =>
                        updateCustomHeight(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Background */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Background
              </Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={config.transparentBackground}
                    onChange={() =>
                      updateConfig({ transparentBackground: true })
                    }
                    className="accent-primary-600"
                  />
                  <span className="text-sm text-gray-700">Transparent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!config.transparentBackground}
                    onChange={() =>
                      updateConfig({ transparentBackground: false })
                    }
                    className="accent-primary-600"
                  />
                  <span className="text-sm text-gray-700">Custom Color</span>
                </label>
              </div>
              {!config.transparentBackground && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) =>
                      updateConfig({ backgroundColor: e.target.value })
                    }
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) =>
                      updateConfig({ backgroundColor: e.target.value })
                    }
                    className="w-28 font-mono text-sm uppercase"
                    maxLength={7}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Convert Button */}
        <Button
          onClick={convert}
          disabled={!hasSvg || isConverting}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isConverting ? (
            'Converting...'
          ) : (
            <>
              <Image className="w-5 h-5 mr-2" />
              Convert to PNG
            </>
          )}
        </Button>
      </div>

      {/* Preview Column (Sticky) */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          {/* SVG Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-gray-500" />
              SVG Preview
            </h2>
            {hasSvg ? (
              <div
                className="w-full rounded-lg border border-gray-100 overflow-hidden bg-[length:20px_20px]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                  backgroundPosition:
                    '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              >
                <div
                  className="w-full flex items-center justify-center p-4 min-h-[200px]"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(config.svgContent) }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <FileCode className="w-12 h-12 mb-2" />
                <p className="text-sm">No SVG loaded</p>
              </div>
            )}
            {svgDimensions && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                Original: {Math.round(svgDimensions.width)} ×{' '}
                {Math.round(svgDimensions.height)}px
              </p>
            )}
          </div>

          {/* PNG Result */}
          {result && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-gray-500" />
                PNG Result
              </h2>
              <div
                className="w-full rounded-lg border border-gray-100 overflow-hidden bg-[length:20px_20px] mb-4"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                  backgroundPosition:
                    '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="Converted PNG"
                  className="w-full h-auto"
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Dimensions</span>
                  <span className="font-mono">
                    {result.width} × {result.height}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>File Size</span>
                  <span className="font-mono">
                    {formatFileSize(result.fileSize)}
                  </span>
                </div>
              </div>

              <Button onClick={download} className="w-full" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download PNG
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function sanitizeSvg(svgContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return '';

  // Remove dangerous elements
  const dangerousTags = svgEl.querySelectorAll('script, foreignObject, iframe, embed, object');
  dangerousTags.forEach((el) => el.remove());

  const allElements = svgEl.querySelectorAll('*');
  allElements.forEach((el) => {
    const attrs = Array.from(el.attributes);
    attrs.forEach((attr) => {
      // Remove event handlers
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
      // Remove javascript: URLs in href/xlink:href
      if ((attr.name === 'href' || attr.name === 'xlink:href') &&
          attr.value.trim().toLowerCase().startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Ensure SVG scales in preview
  svgEl.setAttribute('width', '100%');
  svgEl.setAttribute('height', '100%');
  svgEl.style.maxWidth = '100%';
  svgEl.style.height = 'auto';

  return svgEl.outerHTML;
}
