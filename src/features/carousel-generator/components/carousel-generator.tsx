'use client';

import { useCarouselGenerator } from '../hooks/use-carousel-generator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';
import { CarouselUploader } from './carousel-uploader';
import { CarouselImageControls } from './carousel-image-controls';
import { CarouselGeneratorForm } from './carousel-generator-form';
import { CarouselPreview } from './carousel-preview';

export function CarouselGenerator() {
  const {
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
  } = useCarouselGenerator();

  const selectedImage = config.images.find(img => img.id === selectedImageId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)] min-h-[600px]">
      {/* Left Sidebar: Controls */}
      <aside className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide bg-muted/30 p-4 rounded-2xl border">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black tracking-tight mb-1 text-primary">Configuration</h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Design Editor</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset Upload</Label>
            <CarouselUploader onImagesSelected={handleImagesSelected} />
          </div>

          {selectedImage ? (
            <CarouselImageControls
              image={selectedImage}
              onChange={(updates) => updateImage(selectedImage.id, updates)}
              onDelete={() => deleteImage(selectedImage.id)}
              onLayerChange={handleLayerChange}
            />
          ) : (
            <CarouselGeneratorForm config={config} onChange={updateConfig} />
          )}

          <div className="pt-6 border-t border-border/50">
            <Button
              size="lg"
              className="w-full font-bold shadow-xl bg-linear-to-r from-primary to-primary/80 hover:scale-[1.02] active:scale-95 transition-all h-14 text-lg rounded-xl"
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
      </aside>

      {/* Right/Center: Preview */}
      <div className="lg:col-span-9 h-full">
        <CarouselPreview
          config={config}
          onChange={updateConfig}
          selectedImageId={selectedImageId}
          onSelectImage={setSelectedImageId}
        />
      </div>
    </div >
  );
}
