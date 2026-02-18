import type { Metadata } from 'next';
import { ColorPaletteGeneratorContent } from '@/features/color-palette-generator';
import ColorPaletteClient from './client';

export const metadata: Metadata = {
    title: 'Color Palette Generator | Create Beautiful Color Schemes',
    description: 'Generate harmonious color palettes for your designs instantly. Lock colors, copy HEX codes, and export to CSS or JSON. A free tool for designers and developers.',
    keywords: 'color palette generator, color scheme, color picker, hex code generator, design tools, css variables generator',
    openGraph: {
        title: 'Color Palette Generator | Xenkio Tools',
        description: 'Generate harmonious color palettes for your designs instantly.',
        type: 'website',
    }
};

export default function ColorPalettePage() {
    return (
        <div className="container py-12 space-y-16">
            <ColorPaletteClient />
            <ColorPaletteGeneratorContent />
        </div>
    );
}
