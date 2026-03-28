import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import LinkShortenerClient from './client';

const slug = 'link-shortener';

export const metadata: Metadata = {
    title: 'Link Shortener - Create Short URLs Instantly | Xenkio',
    description: 'Shorten long URLs into compact, shareable links with optional custom aliases. Free, fast, and browser-based using is.gd and v.gd.',
    keywords: [
        'link shortener',
        'url shortener',
        'short url',
        'custom alias url',
        'is.gd',
        'v.gd',
        'shorten link',
        'free url shortener',
    ],
    openGraph: {
        title: 'Link Shortener | Xenkio',
        description: 'Shorten any URL into a compact shareable link with optional custom alias. Free and instant.',
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

export default function LinkShortenerPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Link Shortener',
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'Shorten long URLs into compact links',
            'Optional custom alias support',
            'Multiple provider options (is.gd, v.gd)',
            'Link history stored locally in your browser',
            'One-click copy for shortened links',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Link Shortener
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Turn long, unwieldy URLs into short, shareable links.
                    Add a custom alias to make them memorable — no account required.
                </p>
            </div>

            <LinkShortenerClient />
        </div>
    );
}
