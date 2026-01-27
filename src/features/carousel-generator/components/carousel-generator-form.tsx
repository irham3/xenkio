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
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instagram Size</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(INSTAGRAM_SIZES) as [CarouselSize, { label: string }][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => onChange({ size: key })}
                className={`
                                    flex flex-col items-center justify-center p-3 rounded-xl border-2 text-sm transition-all duration-200
                                    ${config.size === key
                    ? 'border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]'
                    : 'border-border bg-background hover:border-primary/30 hover:bg-muted/30'}
                                `}
              >
                <span className="font-bold">{info.label.split(' ')[0]}</span>
                <span className="text-[10px] opacity-70 mt-1 font-medium">{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Mode */}
        <div className="space-y-3">
          <Label htmlFor="layout-mode-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layout Mode</Label>
          <select
            id="layout-mode-select"
            className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            value={config.layout}
            onChange={(e) => onChange({ layout: e.target.value as CarouselLayout })}
          >
            <option value="grid">Grid (Auto)</option>
            <option value="split">Split (Panorama)</option>
            <option value="collage">Collage</option>
            <option value="freeform">Freeform (Manual)</option>
          </select>
          <p className="text-xs text-muted-foreground leading-relaxed px-1">
            {config.layout === 'grid' && 'Images are placed one per slide automatically.'}
            {config.layout === 'split' && 'Images span across multiple slides (great for seamless panoramas).'}
            {config.layout === 'collage' && 'Arranges images in artistic, overlapping layouts.'}
            {config.layout === 'freeform' && 'Full manual control over every image position.'}
          </p>
        </div>

        {/* Background Color */}
        <div className="space-y-3">
          <Label htmlFor="bg-color-hex" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Background Design</Label>
          <div className="flex gap-2 items-center p-2 rounded-lg border-2 bg-muted/20">
            <div className="relative group">
              <input
                id="bg-color"
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer overflow-hidden appearance-none bg-transparent"
              />
              <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10 pointer-events-none" />
            </div>
            <Input
              id="bg-color-hex"
              type="text"
              value={config.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="flex-1 font-mono uppercase bg-transparent border-none focus-visible:ring-0 h-8"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Slide Count control */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slide Count</Label>
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
              <Button
                variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-background rounded-md"
                onClick={() => onChange({ slideCount: Math.max(1, config.slideCount - 1) })}
              >-</Button>
              <span className="text-xs font-bold w-8 text-center">{config.slideCount}</span>
              <Button
                variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-background rounded-md"
                onClick={() => onChange({ slideCount: Math.min(10, config.slideCount + 1) })}
              >+</Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground px-1 italic">
            Total slides for the carousel (Max 10).
          </p>
        </div>

        {/* Gap Control */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="slide-gap-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slide Gap</Label>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-secondary">{config.gap}px</span>
          </div>
          <input
            id="slide-gap-input"
            type="range"
            min="0"
            max="100"
            step="10"
            value={config.gap}
            onChange={(e) => onChange({ gap: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>
    </div>
  );
}
