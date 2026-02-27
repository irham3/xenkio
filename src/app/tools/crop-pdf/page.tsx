

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { CropPdfClient } from './client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Crop PDF Online Free - Trim PDF Pages | Xenkio',
    description: 'Crop PDF pages online for free. Visually trim margins, remove headers/footers, or resize page area. All pages or per-page cropping. No upload required.',
    keywords: ['crop pdf', 'trim pdf', 'pdf cropper', 'remove pdf margins', 'resize pdf pages', 'cut pdf margins', 'free pdf crop tool'],
    openGraph: {
        title: 'Crop PDF Online Free - Trim PDF Pages | Xenkio',
        description: 'Visually crop and trim PDF pages instantly in your browser. No upload needed.',
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
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Crop PDF Online Free - Trim PDF Pages | Xenkio',
        description: 'Visually crop and trim PDF pages instantly in your browser. No upload needed.',
        images: ['/og-image.jpg'],
    },
};

export default function CropPdfPage() {
    const tool = TOOLS.find(t => t.href === '/tools/crop-pdf');

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Crop PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Visual PDF crop editor",
            "Crop all pages or individually",
            "Remove margins and headers",
            "Instant download",
            "100% local processing"
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
            <CropPdfClient />
        </div>
    );
}
