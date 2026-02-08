'use client';

import { CarouselImage } from '../types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Trash2, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  BringToFront, SendToBack, RefreshCw
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CarouselImageControlsProps {
  image: CarouselImage;
  onChange: (updates: Partial<CarouselImage>) => void;
  onDelete: () => void;
  onLayerChange: (direction: 'front' | 'back' | 'forward' | 'backward') => void;
}

export function CarouselImageControls({ image, onChange, onDelete, onLayerChange }: CarouselImageControlsProps) {
  return (
    <div className="p-1 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900">
            Image Properties
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">Fine-tune your selection</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Layer Controls */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Arrangement</Label>
        <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <span className="text-xs font-semibold ml-2 text-gray-600">Layer Order</span>
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all rounded-lg" onClick={() => onLayerChange('back')}>
                    <SendToBack size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send to Back</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all rounded-lg" onClick={() => onLayerChange('front')}>
                    <BringToFront size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bring to Front</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <Label htmlFor="image-scale-input" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Size & Scale</Label>
          <div className="flex items-center gap-2">
            <span className="text-primary-600 font-bold font-mono bg-primary-50 px-1.5 py-0.5 rounded text-[11px]">{Math.round(image.scale * 100)}%</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full" onClick={() => onChange({ scale: 1 })}>
                    <RefreshCw size={10} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Scale</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <input
          id="image-scale-input"
          type="range"
          min="0.1"
          max="3"
          step="0.05"
          value={image.scale}
          onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-600"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-4">
        <div className="flex justify-between text-xs">
          <Label htmlFor="image-rotation-input" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rotation</Label>
          <span className="text-primary-600 font-bold font-mono bg-primary-50 px-1.5 py-0.5 rounded text-[11px]">{image.rotation}°</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="image-rotation-input"
            type="range"
            min="-180"
            max="180"
            step="1"
            value={image.rotation}
            onChange={(e) => onChange({ rotation: parseInt(e.target.value) })}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-600"
          />
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-500" onClick={() => onChange({ rotation: 0 })}>
            <RotateCw size={14} />
          </Button>
        </div>
      </div>

      {/* Nudge Controls */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Precision Move</Label>
        <div className="grid grid-cols-3 gap-1.5 w-fit mx-auto bg-gray-50 p-2 rounded-xl border border-gray-200">
          <div />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all" onClick={() => onChange({ y: image.y - 1 })}>
            <ArrowUp size={14} />
          </Button>
          <div />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all" onClick={() => onChange({ x: image.x - 1 })}>
            <ArrowLeft size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all" onClick={() => onChange({ y: image.y + 1 })}>
            <ArrowDown size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all" onClick={() => onChange({ x: image.x + 1 })}>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

