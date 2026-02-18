import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Color } from '../types';
import { getContrastColor } from '../lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PaletteStripProps {
    color: Color;
    onToggleLock: (id: string) => void;
}

export const PaletteStrip: React.FC<PaletteStripProps> = ({ color, onToggleLock }) => {
    // Determine text colors based on contrast
    const isWhite = getContrastColor(color.hex) === 'white';

    // Explicitly define text/hover colors for better visibility
    const textColor = isWhite ? 'text-white' : 'text-slate-900';
    const subtleColor = isWhite ? 'text-white/60 hover:text-white' : 'text-slate-900/60 hover:text-slate-900';
    const bgHover = isWhite ? 'hover:bg-white/10' : 'hover:bg-black/5';

    const handleCopy = () => {
        navigator.clipboard.writeText(color.hex);
        toast.success(`Copied ${color.hex}`);
    };

    return (
        <div
            className="group relative flex-1 flex flex-col items-center justify-center min-h-[120px] md:min-h-0 transition-[flex-grow] duration-300 ease-in-out hover:flex-[1.5] md:hover:flex-[1.2]"
            style={{ backgroundColor: color.hex }}
        >
            {/* Color Hex & Actions - Visible on Hover (Desktop) / Always (Mobile, slightly different) */}
            <div className={cn(
                "flex flex-col items-center gap-3 transition-opacity duration-200",
                "opacity-100 md:opacity-0 md:group-hover:opacity-100", // Always visible on mobile, hover on desktop
                textColor
            )}>

                {/* Lock Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-full h-10 w-10 transition-colors", bgHover, subtleColor)}
                    onClick={(e) => { e.stopPropagation(); onToggleLock(color.id); }}
                    title={color.locked ? "Unlock" : "Lock"}
                >
                    {color.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </Button>

                {/* Hex Code (Click to Copy) */}
                <button
                    onClick={handleCopy}
                    className="text-xl md:text-2xl font-bold uppercase tracking-widest font-mono hover:scale-105 transition-transform select-all active:scale-95"
                    title="Click to copy"
                >
                    {color.hex.replace('#', '')}
                </button>

                <span className={cn("text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium opacity-60 pointer-events-none", textColor)}>HEX</span>
            </div>

            {/* Always visible lock indicator if locked and not hovering on desktop */}
            {color.locked && (
                <div className={cn(
                    "absolute bottom-3 right-3 md:top-6 md:right-6 pointer-events-none transition-opacity duration-200",
                    "opacity-40 md:group-hover:opacity-0", // Hide on hover when main controls appear
                    textColor
                )}>
                    <Lock className="w-4 h-4 md:w-5 md:h-5" />
                </div>
            )}
        </div>
    );
};
