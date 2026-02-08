

'use client';

import {
  useCarouselGenerator,
  CarouselUploader,
  CarouselGeneratorForm,
  CarouselImageControls,
  CarouselPreview
} from '@/features/carousel-generator';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Settings, Layers, Image as ImageIcon, LayoutGrid, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-[calc(100vh-12rem)] min-h-[600px]">

      {/* Left Sidebar: Tools & Settings */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-soft flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="assets" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 pt-5 pb-2">
              <TabsList className="w-full grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="assets" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">Assets</TabsTrigger>
                <TabsTrigger value="layout" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">Layout</TabsTrigger>
                <TabsTrigger value="export" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">Export</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <TabsContent value="assets" className="mt-0 space-y-6 h-full data-[state=inactive]:hidden">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="p-1.5 rounded-md bg-primary-50 text-primary-600">
                      <ImageIcon size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-gray-800">Media Library</h3>
                  </div>

                  <CarouselUploader onImagesSelected={handleImagesSelected} />

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {config.images.map(img => (
                      <div
                        key={img.id}
                        className={`
                                            relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 group
                                            ${selectedImageId === img.id
                            ? 'border-primary-500 ring-2 ring-primary-100 shadow-md'
                            : 'border-gray-100 hover:border-primary-200'
                          }
                                        `}
                        onClick={() => setSelectedImageId(img.id)}
                      >
                        <div className={`absolute inset-0 bg-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity ${selectedImageId === img.id ? 'opacity-0' : ''}`} />
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {config.images.length === 0 && (
                      <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400">
                        <ImageIcon className="w-8 h-8 opacity-20 mb-2" />
                        <span className="text-xs font-medium">No assets yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="mt-0 space-y-6 data-[state=inactive]:hidden">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="p-1.5 rounded-md bg-primary-50 text-primary-600">
                      <LayoutGrid size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-gray-800">Canvas Settings</h3>
                  </div>
                  <CarouselGeneratorForm config={config} onChange={updateConfig} />
                </div>
              </TabsContent>

              <TabsContent value="export" className="mt-0 space-y-6 data-[state=inactive]:hidden">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="p-1.5 rounded-md bg-primary-50 text-primary-600">
                      <Share2 size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-gray-800">Export & Save</h3>
                  </div>

                  <div className="p-5 bg-gradient-to-b from-primary-50/50 to-white rounded-2xl border border-primary-100/50 shadow-sm">
                    <div className="mb-4 space-y-1">
                      <h4 className="text-sm font-semibold text-gray-900">Ready to post?</h4>
                      <p className="text-xs text-gray-500">
                        Generates {config.slideCount} high-quality slices in a ZIP file.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="w-full font-bold shadow-primary text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all h-12 rounded-xl"
                      onClick={handleDownload}
                      disabled={isExporting || config.images.length === 0}
                    >
                      {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                      Export Carousel
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="lg:col-span-9 h-full flex flex-col">
        <div className="flex-1 bg-gray-100/50 rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative group">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          <CarouselPreview
            config={config}
            onChange={updateConfig}
            selectedImageId={selectedImageId}
            onSelectImage={setSelectedImageId}
          />

          {/* Contextual Floating Panel - Only shows when image selected */}
          {selectedImage && (
            <div className="absolute top-6 right-6 w-80 max-h-[calc(100%-3rem)] overflow-y-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-large rounded-2xl z-20 transition-all animate-in slide-in-from-right-8 duration-300">
              <CarouselImageControls
                image={selectedImage}
                onChange={(updates) => updateImage(selectedImage.id, updates)}
                onDelete={() => deleteImage(selectedImage.id)}
                onLayerChange={handleLayerChange}
              />
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-3 flex items-center justify-between px-3">
          <div className="flex items-center gap-0.5 text-xs font-medium text-gray-500 bg-white shadow-soft border border-gray-100 px-3 py-1.5 rounded-full">
            <span className="flex items-center gap-1.5 px-2">
              <Settings className="w-3.5 h-3.5 text-gray-400" />
              <span>{config.size}</span>
            </span>
            <span className="w-px h-3 bg-gray-200 mx-1" />
            <span className="flex items-center gap-1.5 px-2">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>{config.slideCount} Slides</span>
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold opacity-60">
            Seamless Scroll Studio
          </p>
        </div>
      </div>
    </div>
  );
}
