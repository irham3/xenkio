import { useState, useCallback } from 'react';
import { CarouselConfig, CarouselImage, INSTAGRAM_SIZES } from '../types';
import { recalculateLayout, generateCarouselDownloads } from '../lib/carousel-utils';

export function useCarouselGenerator() {
  const [config, setConfig] = useState<CarouselConfig>({
    size: '1080x1080',
    layout: 'grid',
    backgroundColor: '#FFFFFF',
    images: [],
    slideCount: 3,
    gap: 0
  });
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleImagesSelected = useCallback(async (files: File[]) => {
    const { height } = INSTAGRAM_SIZES[config.size];

    const newImagesPromises = files.map(async (file, index) => {
      const url = URL.createObjectURL(file);

      const img = new Image();
      img.src = url;
      await new Promise((resolve) => { img.onload = resolve; });

      const baseScale = (height * 0.8) / img.naturalHeight;

      return {
        id: Math.random().toString(36).substring(2, 11),
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        x: 0,
        y: height * 0.1,
        scale: 1,
        baseScale: baseScale,
        rotation: 0,
        order: config.images.length + index
      } as CarouselImage;
    });

    const newImages = await Promise.all(newImagesPromises);

    setConfig(current => {
      const updated = {
        ...current,
        images: [...current.images, ...newImages]
      };

      if (current.layout === 'grid') {
        return recalculateLayout({
          ...updated,
          slideCount: Math.max(updated.slideCount, updated.images.length)
        });
      }
      return updated;
    });
  }, [config.images.length, config.size]);

  const updateConfig = (updates: Partial<CarouselConfig>) => {
    setConfig(current => {
      const nextConfig = { ...current, ...updates };
      if (updates.layout && updates.layout !== current.layout) {
        return recalculateLayout(nextConfig);
      }
      return nextConfig;
    });
  };

  const updateImage = (imageId: string, updates: Partial<CarouselImage>) => {
    setConfig(current => ({
      ...current,
      images: current.images.map(img =>
        img.id === imageId ? { ...img, ...updates } : img
      )
    }));
  };

  const deleteImage = (imageId: string) => {
    setConfig(current => ({
      ...current,
      images: current.images.filter(img => img.id !== imageId)
    }));
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  };

  const handleLayerChange = (direction: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedImageId) return;

    setConfig(current => {
      const images = [...current.images];
      const index = images.findIndex(img => img.id === selectedImageId);
      if (index === -1) return current;

      const img = images[index];
      const newImages = [...images];
      newImages.splice(index, 1);

      if (direction === 'front') {
        newImages.push(img);
      } else if (direction === 'back') {
        newImages.unshift(img);
      }

      const newImagesWithOrder = newImages.map((img, idx) => ({ ...img, order: idx }));
      return { ...current, images: newImagesWithOrder };
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await generateCarouselDownloads(config);
    } catch (error) {
      console.error("Export failed", error);
      alert("Export failed. See console.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    config,
    selectedImageId,
    setSelectedImageId,
    isExporting,
    handleImagesSelected,
    updateConfig,
    updateImage,
    deleteImage,
    handleLayerChange,
    handleDownload
  };
}
