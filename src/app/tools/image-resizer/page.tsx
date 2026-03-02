
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import ImageResizerClient from './client';

const slug = 'image-resizer';

export const metadata: Metadata = {
    title: 'Image Resizer - Resize and Crop Images Online',
    description: 'Free online image resizer. Resize images by pixel or percentage, maintain aspect ratio, and crop photos for social media.',
    openGraph: {
        title: 'Image Resizer | Xenkio',
        description: 'Professional image resizing and cropping tool.',
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

export default function ImageResizerPage() {
    const tool = TOOLS.find(t => t.slug === slug || t.href === `/tools/${slug}`);

    // If not found by slug, fallback check logic or just ensure tools.ts is correct.
    // In our case, tools.ts has href '/tools/image-resizer' for id 14, but no slug field explicitly set.
    // Let's rely on finding by href if slug is missing.

    const targetTool = tool || TOOLS.find(t => t.href === `/tools/${slug}`);

    if (!targetTool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Image Resizer",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": targetTool.description,
        "featureList": [
            "Resize by pixels or percentage",
            "Crop images",
            "Maintain aspect ratio",
            "Download optimized images"
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
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{targetTool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{targetTool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <ImageResizerClient />
        </div>
    );
}
