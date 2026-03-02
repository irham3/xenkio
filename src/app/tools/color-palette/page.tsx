import type { Metadata } from 'next';
import ColorPaletteClient from './client';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';

const slug = 'color-palette';

export const metadata: Metadata = {
    title: 'Color Palette Generator | Create Beautiful Color Schemes',
    description: 'Generate harmonious color palettes for your designs instantly. Lock colors, copy HEX codes, and export to CSS or JSON. A free tool for designers and developers.',
    keywords: 'color palette generator, color scheme, color picker, hex code generator, design tools, css variables generator',
    openGraph: {
        title: 'Color Palette Generator | Xenkio Tools',
        description: 'Generate harmonious color palettes for your designs instantly.',
        type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Xenkio | Free Browser-Based Tools',
          type: 'image/jpeg',
        },
      ],

    }
};

export default function ColorPalettePage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            <div className="space-y-16">
                <ColorPaletteClient />
            </div>
        </div>
    );
}
