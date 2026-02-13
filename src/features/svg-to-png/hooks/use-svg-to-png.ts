'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { SvgToPngConfig, SvgDimensions, ConversionResult, ScaleOption } from '../types';
import { DEFAULT_CONFIG, MAX_CANVAS_SIZE } from '../constants';

function parseSvgDimensions(svgContent: string): SvgDimensions | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return null;

  const widthAttr = svgEl.getAttribute('width');
  const heightAttr = svgEl.getAttribute('height');
  const viewBox = svgEl.getAttribute('viewBox');

  if (widthAttr && heightAttr) {
    const w = parseFloat(widthAttr);
    const h = parseFloat(heightAttr);
    if (w > 0 && h > 0) return { width: w, height: h };
  }

  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }

  return { width: 300, height: 150 };
}

function isValidSvg(content: string): boolean {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'image/svg+xml');
  const parseError = doc.querySelector('parsererror');
  const svgEl = doc.querySelector('svg');
  return !parseError && svgEl !== null;
}

export function useSvgToPng() {
  const [config, setConfig] = useState<SvgToPngConfig>(DEFAULT_CONFIG);
  const [svgDimensions, setSvgDimensions] = useState<SvgDimensions | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [fileName, setFileName] = useState('');
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  const updateConfig = useCallback((updates: Partial<SvgToPngConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };

      if (updates.svgContent !== undefined) {
        const dims = parseSvgDimensions(updates.svgContent);
        setSvgDimensions(dims);
        if (dims) {
          next.customWidth = Math.round(dims.width);
          next.customHeight = Math.round(dims.height);
        }
      }

      return next;
    });
    setResult(null);
  }, []);

  const updateCustomWidth = useCallback((width: number) => {
    setConfig(prev => {
      const next = { ...prev, customWidth: width };
      if (prev.aspectRatioLocked && svgDimensions && svgDimensions.width > 0) {
        const ratio = svgDimensions.height / svgDimensions.width;
        next.customHeight = Math.round(width * ratio);
      }
      return next;
    });
    setResult(null);
  }, [svgDimensions]);

  const updateCustomHeight = useCallback((height: number) => {
    setConfig(prev => {
      const next = { ...prev, customHeight: height };
      if (prev.aspectRatioLocked && svgDimensions && svgDimensions.height > 0) {
        const ratio = svgDimensions.width / svgDimensions.height;
        next.customWidth = Math.round(height * ratio);
      }
      return next;
    });
    setResult(null);
  }, [svgDimensions]);

  const updateScale = useCallback((scale: ScaleOption) => {
    setConfig(prev => ({ ...prev, scale }));
    setResult(null);
  }, []);

  const toggleAspectRatio = useCallback(() => {
    setConfig(prev => ({ ...prev, aspectRatioLocked: !prev.aspectRatioLocked }));
  }, []);

  const setSvgFromFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      toast.error('Please upload a valid SVG file');
      return;
    }

    setFileName(file.name.replace(/\.svg$/i, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!isValidSvg(content)) {
        toast.error('Invalid SVG file');
        return;
      }
      updateConfig({ svgContent: content });
      toast.success('SVG file loaded successfully');
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsText(file);
  }, [updateConfig]);

  const setSvgFromCode = useCallback((code: string) => {
    if (code && !isValidSvg(code)) {
      updateConfig({ svgContent: code });
      return;
    }
    updateConfig({ svgContent: code });
    if (code) {
      setFileName('svg-export');
    }
  }, [updateConfig]);

  const convert = useCallback(async () => {
    if (!config.svgContent) {
      toast.error('Please provide SVG content first');
      return;
    }

    if (!isValidSvg(config.svgContent)) {
      toast.error('Invalid SVG content');
      return;
    }

    setIsConverting(true);

    try {
      const dims = parseSvgDimensions(config.svgContent);
      if (!dims) {
        toast.error('Could not parse SVG dimensions');
        return;
      }

      let outputWidth: number;
      let outputHeight: number;

      if (config.useCustomSize) {
        outputWidth = config.customWidth;
        outputHeight = config.customHeight;
      } else {
        outputWidth = Math.round(dims.width * config.scale);
        outputHeight = Math.round(dims.height * config.scale);
      }

      if (outputWidth > MAX_CANVAS_SIZE || outputHeight > MAX_CANVAS_SIZE) {
        toast.error(`Output size exceeds maximum of ${MAX_CANVAS_SIZE}px`);
        return;
      }

      if (outputWidth <= 0 || outputHeight <= 0) {
        toast.error('Output dimensions must be greater than 0');
        return;
      }

      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(config.svgContent);

      const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          if (!config.transparentBackground) {
            ctx.fillStyle = config.backgroundColor;
            ctx.fillRect(0, 0, outputWidth, outputHeight);
          }

          ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create PNG blob'));
          }, 'image/png');
        };
        img.onerror = () => reject(new Error('Failed to load SVG as image'));
        img.src = svgDataUrl;
      });

      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;

      setResult({
        blob,
        url,
        width: outputWidth,
        height: outputHeight,
        fileSize: blob.size,
      });

      toast.success('Conversion successful!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      toast.error(message);
    } finally {
      setIsConverting(false);
    }
  }, [config]);

  const download = useCallback(() => {
    if (!result) return;
    const name = fileName || 'converted';
    saveAs(result.blob, `${name}.png`);
    toast.success('PNG downloaded!');
  }, [result, fileName]);

  const reset = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setConfig(DEFAULT_CONFIG);
    setSvgDimensions(null);
    setResult(null);
    setFileName('');
  }, []);

  return {
    config,
    svgDimensions,
    result,
    isConverting,
    fileName,
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
  };
}
