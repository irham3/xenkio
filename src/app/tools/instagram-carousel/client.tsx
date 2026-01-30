'use client';

import {
  useCarouselGenerator,
  CarouselUploader,
  CarouselGeneratorForm,
  CarouselImageControls,
  CarouselPreview
} from '@/features/carousel-generator';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Settings, Layers } from 'lucide-react';

export function InstagramCarouselClient() {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-4 space-y-6">
        {/* Step 1: Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
            Upload Assets
          </h2>
          <div className="space-y-4">
            <CarouselUploader onImagesSelected={handleImagesSelected} />
            <p className="text-xs text-muted-foreground">
              Upload images to start creating your carousel.
            </p>
          </div>
        </div>

        {/* Step 2: Configuration or Image Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {selectedImage ? (
            <>
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
                Image Controls
              </h2>
              <CarouselImageControls
                image={selectedImage}
                onChange={(updates) => updateImage(selectedImage.id, updates)}
                onDelete={() => deleteImage(selectedImage.id)}
                onLayerChange={handleLayerChange}
              />
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
                Layout Settings
              </h2>
              <CarouselGeneratorForm config={config} onChange={updateConfig} />
            </>
          )}
        </div>

        {/* Step 3: Export */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">3</span>
            Download
          </h2>
          <Button
            size="lg"
            className="w-full font-bold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all h-12 rounded-xl"
            onClick={handleDownload}
            disabled={isExporting || config.images.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            Export Carousel
          </Button>
          <p className="text-[12px] text-center mt-3 text-muted-foreground font-medium">
            Slices will be exported in a ZIP file.
          </p>
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-8">
        <div className="sticky top-24">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Preview
              </h2>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <span className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  {config.size}
                </span>
                <span className="flex items-center gap-1 border-l pl-4">
                  <Layers className="w-3 h-3" />
                  {config.slideCount} Slides
                </span>
              </div>
            </div>

            <div className="aspect-video lg:aspect-auto lg:h-[600px] w-full bg-muted/20 rounded-lg overflow-hidden relative border border-gray-100">
              <CarouselPreview
                config={config}
                onChange={updateConfig}
                selectedImageId={selectedImageId}
                onSelectImage={setSelectedImageId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
