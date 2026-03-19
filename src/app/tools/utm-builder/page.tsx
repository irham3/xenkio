import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import UTMBuilderClient from './client';

const slug = 'utm-builder';

export const metadata: Metadata = {
    title: 'UTM Builder - Create Campaign Tracking URLs Instantly | Xenkio',
    description: 'Build UTM parameters for campaign URLs in seconds. Add source, medium, campaign, term, and content with instant preview, copy, and export.',
    keywords: [
        'utm builder',
        'utm parameter generator',
        'campaign url builder',
        'google analytics utm',
        'marketing url tracker',
        'utm source medium campaign',
    ],
    openGraph: {
        title: 'UTM Builder | Xenkio',
        description: 'Create trackable campaign URLs using UTM parameters. Fast, free, and privacy-focused.',
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

export default function UTMBuilderPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'UTM Builder',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'Generate complete UTM tracking URLs',
            'Add utm_source, utm_medium, utm_campaign, utm_term, and utm_content',
            'Quick presets for common campaign channels',
            'Instant URL and query preview',
            'Copy and download result',
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
                    UTM Builder
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Build campaign tracking URLs with UTM parameters in seconds.
                    Fill source, medium, and campaign, then copy the final link instantly.
                </p>
            </div>

            <UTMBuilderClient />
        </div>
    );
}
