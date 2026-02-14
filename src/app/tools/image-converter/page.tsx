

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import { ImageConverterClient } from './client';

const slug = 'image-converter';

export const metadata: Metadata = {
    title: 'Image Converter - Convert JPG, PNG, WebP, GIF Online Free',
    description: 'Free online image converter. Convert images between JPG, PNG, WebP, and BMP formats. Batch processing and client-side privacy.',
    openGraph: {
        title: 'Image Converter | Xenkio',
        description: 'Convert between JPG, PNG, WebP, GIF, and other formats instantly.',
    }
};

export default function ImageConverterPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Image Converter",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Convert JPG/PNG/WebP/BMP/ICO",
            "Batch processing",
            "Custom quality settings",
            "Secure client-side conversion"
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
            <ImageConverterClient />
        </div>
    );
}
