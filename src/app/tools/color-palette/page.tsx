import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { ColorPaletteClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'color-palette';

export const metadata: Metadata = {
    title: 'Color Palette Generator - Create Harmonious Color Palettes for Free',
    description: 'Generate beautiful color palettes using color theory harmonies. Complementary, analogous, triadic, and more. Export as CSS, Tailwind, or PNG.',
    openGraph: {
        title: 'Color Palette Generator | Xenkio',
        description: 'Generate harmonious color palettes using color theory.',
    }
};

export default function ColorPalettePage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Color Palette Generator",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Color theory harmonies",
            "CSS variables export",
            "Tailwind colors export",
            "PNG export",
            "Free to use"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <ColorPaletteClient />
        </div>
    );
}
