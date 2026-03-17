import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/data/tools';
import TwitterCardGeneratorClient from './client';

const slug = 'twitter-card';

export const metadata: Metadata = {
    title: 'Twitter Card Generator - Create Twitter/X Card Meta Tags | Xenkio',
    description: 'Generate Twitter Card meta tags for better link previews on Twitter/X. Supports summary, large image, player, and app cards. Free and privacy-first.',
    keywords: [
        'twitter card generator',
        'twitter meta tags',
        'twitter card validator',
        'x card generator',
        'twitter summary card',
        'twitter large image card',
        'social media meta tags',
        'twitter card meta tags generator',
    ],
    openGraph: {
        title: 'Twitter Card Generator | Xenkio',
        description: 'Create Twitter/X Card meta tags instantly for better link previews when shared on Twitter.',
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

export default function TwitterCardGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Twitter Card Generator',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'Summary card generation',
            'Summary large image card generation',
            'Player card generation',
            'App card generation',
            'Live preview of Twitter/X card appearance',
            'Character count validation',
            'Instant copy and download',
            'Real-time generated output',
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
                    Twitter Card Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Generate Twitter/X Card meta tags for rich link previews.
                    Live preview, all card types supported, and privacy-first processing.
                </p>
            </div>

            <TwitterCardGeneratorClient />
        </div>
    );
}
