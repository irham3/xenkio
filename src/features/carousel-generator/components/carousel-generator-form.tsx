'use client';

import { CarouselConfig, INSTAGRAM_SIZES, CarouselLayout, CarouselSize } from '../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CarouselGeneratorFormProps {
  config: CarouselConfig;
  onChange: (updates: Partial<CarouselConfig>) => void;
}

export function CarouselGeneratorForm({ config, onChange }: CarouselGeneratorFormProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Size Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Canvas Format</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(INSTAGRAM_SIZES) as [CarouselSize, { label: string }][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => onChange({ size: key })}
                className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                    ${config.size === key
                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50 text-gray-600'}
                `}
              >
                <span className="font-bold text-sm">{info.label.split(' ')[0]}</span>
                <span className="text-[10px] opacity-80 mt-1 font-medium tracking-wide uppercase">{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Mode */}
        <div className="space-y-3">
          <Label htmlFor="layout-mode-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Layout Style</Label>
          <div className="relative">
            <select
              id="layout-mode-select"
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer hover:border-gray-300"
              value={config.layout}
              onChange={(e) => onChange({ layout: e.target.value as CarouselLayout })}
            >
              <option value="grid">Grid (Auto-Place)</option>
              <option value="split">Panorama (Seamless)</option>
              <option value="collage">Collage (Layered)</option>
              <option value="freeform">Freeform (Manual)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed px-1">
            {config.layout === 'grid' && 'Automatically places images into a uniform grid.'}
            {config.layout === 'split' && 'Perfect for panoramic photos that span across multiple slides.'}
            {config.layout === 'collage' && 'Create artistic layouts with overlapping images.'}
            {config.layout === 'freeform' && 'Complete freedom to place images anywhere on the canvas.'}
          </p>
        </div>

        {/* Background Color */}
        <div className="space-y-3">
          <Label htmlFor="bg-color-hex" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Background</Label>
          <div className="flex gap-2 items-center p-2 rounded-xl border border-gray-200 bg-gray-50/50">
            <div className="relative group shrink-0">
              <input
                id="bg-color"
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer overflow-hidden appearance-none bg-transparent shadow-sm"
              />
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5 pointer-events-none" />
            </div>
            <Input
              id="bg-color-hex"
              type="text"
              value={config.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="flex-1 font-mono uppercase bg-transparent border-none focus-visible:ring-0 h-9 text-gray-700 bg-white rounded-md shadow-sm"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Slide Count control */}
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Canvas Length</Label>
            <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
              <Button
                variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md text-gray-600"
                onClick={() => onChange({ slideCount: Math.max(1, config.slideCount - 1) })}
              >-</Button>
              <span className="text-sm font-bold w-10 text-center text-gray-900">{config.slideCount}</span>
              <Button
                variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md text-gray-600"
                onClick={() => onChange({ slideCount: Math.min(10, config.slideCount + 1) })}
              >+</Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Label htmlFor="slide-gap-input" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slide Gap</Label>
            <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">{config.gap}px</span>
          </div>
          <input
            id="slide-gap-input"
            type="range"
            min="0"
            max="100"
            step="10"
            value={config.gap}
            onChange={(e) => onChange({ gap: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-600"
          />
        </div>
      </div>
    </div>
  );
}

