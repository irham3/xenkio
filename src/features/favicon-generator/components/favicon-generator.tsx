'use client';

import { useRef, useState } from 'react';
import { useFaviconGenerator } from '../hooks/use-favicon-generator';
import { FAVICON_SIZES, ICO_SIZES, ACCEPTED_EXTENSIONS } from '../constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, Copy, Check, Image, X, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function FaviconGenerator() {
  const {
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
  } = useFaviconGenerator();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const success = handleFileUpload(file);
      if (!success) {
        toast.error('Unsupported file format. Please upload JPG, PNG, WebP, or SVG.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = handleFileUpload(file);
      if (!success) {
        toast.error('Unsupported file format. Please upload JPG, PNG, WebP, or SVG.');
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleCopyHtml = async () => {
    const success = await copyHtmlTags();
    if (success) {
      setCopiedHtml(true);
      toast.success('HTML tags copied to clipboard!');
      setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleGenerate = async () => {
    await generateFavicons();
    toast.success('Favicons generated successfully!');
  };

  const hasIcoSizes = generatedFavicons.some((f) =>
    ICO_SIZES.includes(f.size.width)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-7 space-y-8">
        {/* Section 1: Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
            Upload Image
          </h2>
          {!sourceImage ? (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drag & drop an image or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports JPG, PNG, WebP, SVG
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={sourceImage}
                  alt="Source"
                  className="max-h-48 rounded-lg border border-gray-200"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">{sourceFileName}</p>
            </div>
          )}
        </div>

        {/* Section 2: Size Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
            Select Sizes
          </h2>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={selectAllSizes}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAllSizes}>
              Deselect All
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FAVICON_SIZES.map((size) => (
              <label
                key={size.width}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedSizes.includes(size.width)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Checkbox
                  checked={selectedSizes.includes(size.width)}
                  onCheckedChange={() => toggleSize(size.width)}
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">{size.label}</span>
                  {size.isAppleTouch && (
                    <span className="block text-xs text-gray-500">Apple Touch</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 3: Generate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">3</span>
            Generate
          </h2>
          <Button
            onClick={handleGenerate}
            disabled={!sourceImage || selectedSizes.length === 0 || isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Favicons'}
          </Button>
        </div>

        {/* Section 4: HTML Tags */}
        {generatedFavicons.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">4</span>
              HTML Tags
            </h2>
            <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-x-auto border border-gray-200 mb-4">
              <code>{getHtmlTags()}</code>
            </pre>
            <Button variant="outline" size="sm" onClick={handleCopyHtml}>
              {copiedHtml ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copiedHtml ? 'Copied!' : 'Copy HTML Tags'}
            </Button>
          </div>
        )}
      </div>

      {/* Preview Column (Sticky) */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Preview</h2>
            {generatedFavicons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Image className="w-12 h-12 mb-3" />
                <p className="text-sm">Generated favicons will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {generatedFavicons.map((favicon) => (
                    <div
                      key={favicon.size.width}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <div className="flex items-center justify-center w-16 h-16">
                        <img
                          src={favicon.dataUrl}
                          alt={`Favicon ${favicon.size.label}`}
                          className="max-w-full max-h-full"
                          style={{
                            width: Math.min(favicon.size.width, 64),
                            height: Math.min(favicon.size.height, 64),
                            imageRendering: favicon.size.width <= 32 ? 'pixelated' : 'auto',
                          }}
                        />
                      </div>
                      <Label className="text-xs text-gray-600">{favicon.size.label}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => downloadFavicon(favicon)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PNG
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                  <Button onClick={downloadAllAsZip} className="w-full">
                    <FileArchive className="w-4 h-4 mr-2" />
                    Download All as ZIP
                  </Button>
                  {hasIcoSizes && (
                    <Button variant="outline" onClick={downloadIco} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download ICO
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
