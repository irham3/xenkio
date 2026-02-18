import React from 'react';
import { Lock, Unlock, Copy, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { Color } from '../types';
import { getContrastColor, getContrastRatio } from '../lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PaletteStripProps {
    color: Color;
    onToggleLock: (id: string) => void;
}

export const PaletteStrip: React.FC<PaletteStripProps> = ({ color, onToggleLock }) => {
    // Determine text colors based on contrast
    const isWhite = getContrastColor(color.hex) === 'white';

    // Calculate contrast ratios
    const contrastWhite = getContrastRatio(color.hex, '#ffffff').toFixed(2);
    const contrastBlack = getContrastRatio(color.hex, '#000000').toFixed(2);

    // Explicitly define text/hover colors for better visibility
    const textColor = isWhite ? 'text-white' : 'text-slate-900';
    const bgHover = isWhite ? 'hover:bg-white/10' : 'hover:bg-black/5';

    const handleCopy = () => {
        navigator.clipboard.writeText(color.hex);
        toast.success(`HEX ${color.hex.toUpperCase()} copied!`);
    };

    const handleCopyRGB = () => {
        // Simple RGB conversion for copy
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            navigator.clipboard.writeText(`rgb(${r}, ${g}, ${b})`);
            toast.success(`RGB copied!`);
        }
    };

    return (
        <div
            className="group relative flex-1 flex flex-col items-center justify-center min-h-[120px] md:min-h-0 transition-all duration-500 ease-in-out hover:flex-2"
            style={{ backgroundColor: color.hex }}
        >
            {/* Overlay for visual depth */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-white pointer-events-none" />

            {/* Main Controls */}
            <div className={cn(
                "flex flex-col items-center gap-6 transition-all duration-300 transform",
                "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-4 md:group-hover:translate-y-0",
                textColor
            )}>
                {/* Top Action Bar */}
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("rounded-full h-10 w-10 transition-all hover:scale-110", bgHover, textColor)}
                                    onClick={(e) => { e.stopPropagation(); onToggleLock(color.id); }}
                                >
                                    {color.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5 opacity-40 group-hover:opacity-100" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{color.locked ? "Unlock" : "Lock Color"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn("rounded-full h-10 w-10", bgHover, textColor)} onClick={handleCopyRGB} title="Copy RGB">
                                    <Hash className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy RGB</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn("rounded-full h-10 w-10", bgHover, textColor)} onClick={handleCopy} title="Copy HEX">
                                    <Copy className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy HEX</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Hex Code Area */}
                <div className="flex flex-col items-center gap-1 group/hex">
                    <button
                        onClick={handleCopy}
                        className="text-2xl md:text-3xl font-black uppercase tracking-tighter font-mono hover:scale-105 transition-transform active:scale-95"
                    >
                        {color.hex.replace('#', '')}
                    </button>
                    <div className={cn("h-1 w-0 group-hover/hex:w-full transition-all duration-300 rounded-full", isWhite ? "bg-white" : "bg-black")} />
                </div>

                {/* Accessibility Indicators (WCAG Contrast) */}
                <div className="flex flex-col items-center gap-2 px-4 py-2 rounded-2xl bg-black/5 backdrop-blur-sm group/acc">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 opacity-60">Text Readability</span>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest opacity-80">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center gap-0.5 cursor-help">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-white border border-black/10" />
                                            <span>{contrastWhite}:1</span>
                                        </div>
                                        <span className={cn("text-[8px]", parseFloat(contrastWhite) >= 4.5 ? "text-green-500" : "text-red-500")}>
                                            {parseFloat(contrastWhite) >= 4.5 ? 'PASS' : 'FAIL'}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-[10px]">Contrast ratio for white text</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="w-px h-6 bg-current opacity-10" />

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center gap-0.5 cursor-help">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-black border border-white/10" />
                                            <span>{contrastBlack}:1</span>
                                        </div>
                                        <span className={cn("text-[8px]", parseFloat(contrastBlack) >= 4.5 ? "text-green-500" : "text-red-500")}>
                                            {parseFloat(contrastBlack) >= 4.5 ? 'PASS' : 'FAIL'}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-[10px]">Contrast ratio for black text</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Secondary Labels (Visible when not hovering) */}
            <div className={cn(
                "absolute bottom-8 left-0 right-0 flex flex-col items-center transition-opacity duration-300 md:group-hover:opacity-0",
                textColor
            )}>
                {color.locked && <Lock className="w-4 h-4 mb-2 opacity-60" />}
                <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{color.hex}</span>
            </div>
        </div>
    );
};
