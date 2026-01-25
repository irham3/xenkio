'use client';

import { useState, useCallback, useEffect } from 'react';
import { CarouselConfig, CarouselImage, CarouselLayout, CarouselSize, INSTAGRAM_SIZES } from './types';
import { CarouselPreview } from './carousel-preview';
import { CarouselGeneratorForm } from './carousel-generator-form';
import { CarouselUploader } from './carousel-uploader';
import { CarouselImageControls } from './carousel-image-controls';
import { recalculateLayout, generateCarouselDownloads } from './carousel-utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';

export function CarouselGenerator() {
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

    // Update base scales when canvas size changes
    useEffect(() => {
        // ... (Logic kept simple for now, relying on initial Upload calculation)
    }, [config.size]);

    const handleImagesSelected = useCallback(async (files: File[]) => {
        const { height, width } = INSTAGRAM_SIZES[config.size];

        const newImagesPromises = files.map(async (file, index) => {
            const url = URL.createObjectURL(file);

            const img = new Image();
            img.src = url;
            await new Promise((resolve) => { img.onload = resolve; });

            let baseScale = (height * 0.8) / img.naturalHeight;

            return {
                id: Math.random().toString(36).substr(2, 9),
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
    }, [config.images.length, config.layout, config.size]);

    const handleConfigChange = (updates: Partial<CarouselConfig>) => {
        setConfig(current => {
            const nextConfig = { ...current, ...updates };
            if (updates.layout && updates.layout !== current.layout) {
                return recalculateLayout(nextConfig);
            }
            return nextConfig;
        });
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

    useEffect(() => {
        return () => {
            // Cleanup
        };
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)] min-h-[600px]">
            {/* Left Sidebar: Controls */}
            <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide bg-muted/30 p-4 rounded-2xl border">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight mb-1 text-primary">Configuration</h2>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Design Editor</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset Upload</Label>
                        <CarouselUploader onImagesSelected={handleImagesSelected} />
                    </div>

                    {selectedImageId && config.images.find(img => img.id === selectedImageId) ? (
                        <CarouselImageControls
                            image={config.images.find(img => img.id === selectedImageId)!}
                            onChange={(updates) => {
                                const newImages = config.images.map(img =>
                                    img.id === selectedImageId ? { ...img, ...updates } : img
                                );
                                setConfig({ ...config, images: newImages });
                            }}
                            onDelete={() => {
                                const newImages = config.images.filter(img => img.id !== selectedImageId);
                                setConfig({ ...config, images: newImages });
                                setSelectedImageId(null);
                            }}
                            onLayerChange={handleLayerChange}
                        />
                    ) : (
                        <CarouselGeneratorForm config={config} onChange={handleConfigChange} />
                    )}

                    <div className="pt-6 border-t border-border/50">
                        <Button
                            size="lg"
                            className="w-full font-bold shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] active:scale-95 transition-all h-14 text-lg rounded-xl"
                            onClick={handleDownload}
                            disabled={isExporting || config.images.length === 0}
                        >
                            {isExporting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Download className="mr-2 h-6 w-6" />}
                            Export Carousel
                        </Button>
                        <p className="text-[10px] text-center mt-3 text-muted-foreground font-medium uppercase tracking-tighter">
                            Ready for Instagram &bull; ZIP Format
                        </p>
                    </div>
                </div>
            </div>

            {/* Right/Center: Preview */}
            <div className="lg:col-span-9 h-full">
                <CarouselPreview
                    config={config}
                    onChange={handleConfigChange}
                    selectedImageId={selectedImageId}
                    onSelectImage={setSelectedImageId}
                />
            </div>
        </div>
    );
}
