import type { Metadata } from 'next';
import FontPairingClient from './client';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';

const slug = 'font-pairing';

export const metadata: Metadata = {
    title: 'Font Pairing Tool | Find Perfect Google Font Combinations',
    description: 'Discover beautiful Google Font pairings for your designs. Preview combinations in real-time, copy CSS snippets, and find the perfect typography for headings and body text.',
    keywords: 'font pairing, google fonts, font combination, typography tool, font matcher, heading body font, web fonts, css fonts',
    openGraph: {
        title: 'Font Pairing Tool | Xenkio Tools',
        description: 'Find perfect Google Font combinations for your designs. Preview and copy CSS instantly.',
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

export default function FontPairingPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': tool.title,
        'description': tool.description,
        'applicationCategory': 'DesignApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'featureList': [
            'Curated Google Font pairings',
            'Real-time font preview',
            'Multiple preview layouts',
            'CSS snippet export',
            'Category-based filtering',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            <div className="space-y-16">
                <FontPairingClient />
            </div>
        </div>
    );
}
