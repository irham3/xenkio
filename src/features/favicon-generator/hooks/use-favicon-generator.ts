'use client';

import { useState, useCallback } from 'react';
import { FaviconSize, GeneratedFavicon } from '../types';
import { FAVICON_SIZES, ICO_SIZES, ACCEPTED_IMAGE_TYPES } from '../constants';

function resizeImage(
  img: HTMLImageElement,
  size: FaviconSize
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size.width, size.height);
    const dataUrl = canvas.toDataURL('image/png');
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({ dataUrl, blob });
      } else {
        reject(new Error('Could not create blob'));
      }
    }, 'image/png');
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Builds an ICO file from PNG blobs. Each entry embeds the raw PNG data. */
function createIcoBlob(images: { size: number; blob: Blob }[]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const count = images.length;
    // ICO header: 6 bytes + 16 bytes per entry
    const headerSize = 6 + count * 16;

    const readPromises = images.map(
      ({ blob }) =>
        new Promise<ArrayBuffer>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as ArrayBuffer);
          reader.onerror = rej;
          reader.readAsArrayBuffer(blob);
        })
    );

    Promise.all(readPromises)
      .then((buffers) => {
        let totalSize = headerSize;
        for (const buf of buffers) {
          totalSize += buf.byteLength;
        }

        const ico = new ArrayBuffer(totalSize);
        const view = new DataView(ico);

        // ICO header
        view.setUint16(0, 0, true); // reserved
        view.setUint16(2, 1, true); // type: 1 = ICO
        view.setUint16(4, count, true); // image count

        let dataOffset = headerSize;
        for (let i = 0; i < count; i++) {
          const size = images[i].size;
          const bufLen = buffers[i].byteLength;
          const entryOffset = 6 + i * 16;

          view.setUint8(entryOffset, size < 256 ? size : 0); // width
          view.setUint8(entryOffset + 1, size < 256 ? size : 0); // height
          view.setUint8(entryOffset + 2, 0); // color palette
          view.setUint8(entryOffset + 3, 0); // reserved
          view.setUint16(entryOffset + 4, 1, true); // color planes
          view.setUint16(entryOffset + 6, 32, true); // bits per pixel
          view.setUint32(entryOffset + 8, bufLen, true); // image size
          view.setUint32(entryOffset + 12, dataOffset, true); // data offset

          const src = new Uint8Array(buffers[i]);
          const dst = new Uint8Array(ico, dataOffset, bufLen);
          dst.set(src);
          dataOffset += bufLen;
        }

        resolve(new Blob([ico], { type: 'image/x-icon' }));
      })
      .catch(reject);
  });
}

export function useFaviconGenerator() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>(
    FAVICON_SIZES.map((s) => s.width)
  );
  const [generatedFavicons, setGeneratedFavicons] = useState<GeneratedFavicon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = useCallback((file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSourceImage(result);
      setSourceFileName(file.name);
      setGeneratedFavicons([]);
    };
    reader.readAsDataURL(file);
    return true;
  }, []);

  const clearImage = useCallback(() => {
    setSourceImage(null);
    setSourceFileName(null);
    setGeneratedFavicons([]);
  }, []);

  const toggleSize = useCallback((size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const selectAllSizes = useCallback(() => {
    setSelectedSizes(FAVICON_SIZES.map((s) => s.width));
  }, []);

  const deselectAllSizes = useCallback(() => {
    setSelectedSizes([]);
  }, []);

  const generateFavicons = useCallback(async () => {
    if (!sourceImage || selectedSizes.length === 0) return;
    setIsGenerating(true);
    try {
      const img = await loadImage(sourceImage);
      const sizesToGenerate = FAVICON_SIZES.filter((s) =>
        selectedSizes.includes(s.width)
      );
      const results: GeneratedFavicon[] = [];
      for (const size of sizesToGenerate) {
        const { dataUrl, blob } = await resizeImage(img, size);
        results.push({ size, dataUrl, blob });
      }
      setGeneratedFavicons(results);
    } catch {
      setGeneratedFavicons([]);
    } finally {
      setIsGenerating(false);
    }
  }, [sourceImage, selectedSizes]);

  const downloadFavicon = useCallback((favicon: GeneratedFavicon) => {
    const link = document.createElement('a');
    link.href = favicon.dataUrl;
    link.download = `favicon-${favicon.size.width}x${favicon.size.height}.png`;
    link.click();
  }, []);

  const downloadAllAsZip = useCallback(async () => {
    if (generatedFavicons.length === 0) return;
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    const zip = new JSZip();
    for (const favicon of generatedFavicons) {
      zip.file(
        `favicon-${favicon.size.width}x${favicon.size.height}.png`,
        favicon.blob
      );
    }
    // Generate ICO from available ICO sizes
    const icoFavicons = generatedFavicons.filter((f) =>
      ICO_SIZES.includes(f.size.width)
    );
    if (icoFavicons.length > 0) {
      const icoImages = icoFavicons.map((f) => ({
        size: f.size.width,
        blob: f.blob,
      }));
      try {
        const icoBlob = await createIcoBlob(icoImages);
        zip.file('favicon.ico', icoBlob);
      } catch {
        // Skip ICO if generation fails
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'favicons.zip');
  }, [generatedFavicons]);

  const downloadIco = useCallback(async () => {
    const icoFavicons = generatedFavicons.filter((f) =>
      ICO_SIZES.includes(f.size.width)
    );
    if (icoFavicons.length === 0) return;
    const icoImages = icoFavicons.map((f) => ({
      size: f.size.width,
      blob: f.blob,
    }));
    try {
      const icoBlob = await createIcoBlob(icoImages);
      const url = URL.createObjectURL(icoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'favicon.ico';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail
    }
  }, [generatedFavicons]);

  const getHtmlTags = useCallback(() => {
    return generatedFavicons
      .map((f) => {
        if (f.size.isAppleTouch) {
          return `<link rel="apple-touch-icon" sizes="${f.size.width}x${f.size.height}" href="/apple-touch-icon.png">`;
        }
        return `<link rel="icon" type="image/png" sizes="${f.size.width}x${f.size.height}" href="/favicon-${f.size.width}x${f.size.height}.png">`;
      })
      .join('\n');
  }, [generatedFavicons]);

  const copyHtmlTags = useCallback(async (): Promise<boolean> => {
    try {
      const tags = getHtmlTags();
      await navigator.clipboard.writeText(tags);
      return true;
    } catch {
      return false;
    }
  }, [getHtmlTags]);

  return {
    sourceImage,
    sourceFileName,
    selectedSizes,
    generatedFavicons,
    isGenerating,
    handleFileUpload,
    clearImage,
    toggleSize,
    selectAllSizes,
    deselectAllSizes,
    generateFavicons,
    downloadFavicon,
    downloadAllAsZip,
    downloadIco,
    getHtmlTags,
    copyHtmlTags,
  };
}
