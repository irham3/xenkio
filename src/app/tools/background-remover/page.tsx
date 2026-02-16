import { Metadata } from 'next';
import { BackgroundRemoverClient } from './client';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';

const slug = 'background-remover';

export const metadata: Metadata = {
    title: 'AI Background Remover - Remove Background from Image Free',
    description: 'Remove image backgrounds instantly with AI. Free online background remover for JPG, PNG, and WebP images. High precision, no signup required.',
    openGraph: {
        title: 'Free AI Background Remover | Xenkio',
        description: 'Remove backgrounds from images instantly with AI. 100% free and secure.',
    }
};

export default function BackgroundRemoverPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AI Background Remover",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Remove image backgrounds instantly with AI. Free online background remover for JPG, PNG, and WebP images.",
        "featureList": [
            "AI-powered precision",
            "Instant background removal",
            "Support for JPG, PNG, WebP",
            "100% Client-side privacy",
            "Download as transparent PNG"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BackgroundRemoverClient />
        </div>
    );
}
