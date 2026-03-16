import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import MetaTagGeneratorClient from './client';

const slug = 'meta-tag-generator';

export const metadata: Metadata = {
    title: 'Meta Tag Generator - Create SEO Meta Tags Instantly | Xenkio',
    description: 'Generate SEO-optimized meta tags for your website including Open Graph, Twitter Card, and basic SEO tags. Free, fast, and privacy-focused — no data sent anywhere.',
    keywords: [
        'meta tag generator',
        'seo meta tags',
        'open graph generator',
        'twitter card generator',
        'og tags generator',
        'meta description generator',
        'html meta tags',
        'seo tools',
        'social media meta tags',
    ],
    openGraph: {
        title: 'Meta Tag Generator | Xenkio',
        description: 'Generate SEO-optimized meta tags for your website including Open Graph, Twitter Card, and basic SEO. Free, fast, and privacy-focused.',
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

export default function MetaTagGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Meta Tag Generator',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'SEO meta tag generation',
            'Open Graph tags for Facebook and LinkedIn',
            'Twitter Card tags for X',
            'Google search preview',
            'Character count with SEO recommendations',
            'Quick presets for common page types',
            'Instant copy and download',
            'Real-time preview',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Tool Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Meta Tag Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Generate SEO-optimized meta tags for your website. Includes Open Graph,
                    Twitter Card, and essential SEO tags with a live Google preview.
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <MetaTagGeneratorClient />
        </div>
    );
}
