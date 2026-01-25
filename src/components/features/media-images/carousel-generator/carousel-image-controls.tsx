'use client';

import { CarouselImage } from './types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Trash2, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    BringToFront, SendToBack, Layers, RefreshCw
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
        <div className="bg-primary/5 p-5 rounded-2xl border-2 border-primary/20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-wider text-primary">
                        Configuration
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-bold">IMAGE SETTINGS</p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-white hover:bg-destructive rounded-full transition-all shadow-sm" onClick={onDelete}>
                    <Trash2 size={18} />
                </Button>
            </div>

            {/* Layer Controls */}
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Depth / Order</Label>
                <div className="flex items-center justify-between bg-background/80 backdrop-blur-sm p-2 rounded-xl border-2 border-primary/10 shadow-sm">
                    <span className="text-xs font-medium ml-2">Stack Position</span>
                    <div className="flex items-center gap-1">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onLayerChange('back')}>
                                        <SendToBack size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send to Back</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onLayerChange('front')}>
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
            <div className="space-y-3 pt-2 border-t border-primary/10">
                <div className="flex items-center justify-between text-xs">
                    <Label className="font-bold uppercase tracking-widest text-muted-foreground/80 text-[10px]">Scale</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-primary font-black font-mono">{Math.round(image.scale * 100)}%</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10" onClick={() => onChange({ scale: 1 })}>
                                        <RefreshCw size={12} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reset Scale</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.05"
                    value={image.scale}
                    onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            {/* Rotation */}
            <div className="space-y-3">
                <div className="flex justify-between text-xs">
                    <Label className="font-bold uppercase tracking-widest text-muted-foreground/80 text-[10px]">Rotation</Label>
                    <span className="text-primary font-black font-mono">{image.rotation}°</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={image.rotation}
                        onChange={(e) => onChange({ rotation: parseInt(e.target.value) })}
                        className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-2" onClick={() => onChange({ rotation: 0 })}>
                        <RotateCw size={16} />
                    </Button>
                </div>
            </div>

            {/* Nudge Controls */}
            <div className="space-y-4 pt-2 border-t border-primary/10">
                <Label className="font-bold uppercase tracking-widest text-muted-foreground/80 text-[10px]">Micro Positioning</Label>
                <div className="grid grid-cols-3 gap-2 w-fit mx-auto bg-background/40 p-3 rounded-2xl border border-primary/5">
                    <div />
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-2 hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => onChange({ y: image.y - 1 })}>
                        <ArrowUp size={16} />
                    </Button>
                    <div />
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-2 hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => onChange({ x: image.x - 1 })}>
                        <ArrowLeft size={16} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-2 hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => onChange({ y: image.y + 1 })}>
                        <ArrowDown size={16} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-2 hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => onChange({ x: image.x + 1 })}>
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
