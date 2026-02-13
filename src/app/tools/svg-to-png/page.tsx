import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { SvgToPngClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'svg-to-png';

export const metadata: Metadata = {
    title: 'SVG to PNG Converter - Convert Vector to Raster for Free',
    description: 'Convert SVG vector graphics to high-quality PNG raster images. Supports custom sizes, retina scaling, and transparent backgrounds. 100% free and client-side.',
    openGraph: {
        title: 'SVG to PNG Converter | Xenkio',
        description: 'Convert SVG to PNG with custom sizes and retina scaling.',
    }
};

export default function SvgToPngPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "SVG to PNG Converter",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Upload or paste SVG",
            "Custom output dimensions",
            "Retina scaling (1x-4x)",
            "Transparent or custom background",
            "Client-side processing"
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
            <SvgToPngClient />
        </div>
    );
}
