import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/data/tools';
import OpenGraphGeneratorClient from './client';

const slug = 'og-generator';

export const metadata: Metadata = {
    title: 'Open Graph Generator - Create OG Tags for Social Sharing | Xenkio',
    description: 'Generate Open Graph and Twitter Card meta tags for social media previews. Free, fast, and privacy-first in your browser.',
    keywords: [
        'open graph generator',
        'og tags generator',
        'social meta tags',
        'twitter card generator',
        'facebook link preview',
    ],
    openGraph: {
        title: 'Open Graph Generator | Xenkio',
        description: 'Create Open Graph and Twitter Card tags instantly for better social sharing previews.',
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
};

export default function OpenGraphGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Open Graph Generator',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'Open Graph meta tags generation',
            'Twitter Card tags generation',
            'Quick presets for website, article, and product pages',
            'Instant copy and download',
            'Live generated output',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Open Graph Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Generate Open Graph and Twitter Card tags for better social media previews.
                    Live output, fast workflow, and privacy-first processing.
                </p>
            </div>

            <OpenGraphGeneratorClient />
        </div>
    );
}
