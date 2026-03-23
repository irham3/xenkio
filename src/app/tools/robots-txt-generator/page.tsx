import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import RobotsTxtGeneratorClient from './client';

const slug = 'robots-txt-generator';

export const metadata: Metadata = {
    title: 'Robots.txt Generator - Create robots.txt Instantly | Xenkio',
    description: 'Generate robots.txt files visually with presets for WordPress, e-commerce, and AI bot blocking. Download instantly — free, fast, and privacy-focused.',
    keywords: [
        'robots.txt generator',
        'robots.txt creator',
        'robots txt builder',
        'robots.txt maker',
        'create robots.txt',
        'robots.txt file generator',
        'seo robots.txt',
        'block ai bots robots.txt',
        'web crawler control',
    ],
    openGraph: {
        title: 'Robots.txt Generator | Xenkio',
        description: 'Generate robots.txt files visually with presets for WordPress, e-commerce, and AI bot blocking. Free, fast, and privacy-focused.',
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

export default function RobotsTxtGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Robots.txt Generator',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'Visual robots.txt builder',
            'Quick presets (WordPress, E-Commerce, Block AI Bots)',
            'Multiple user-agent rule support',
            'Sitemap URL management',
            'Common user-agent autocomplete',
            'Instant download as robots.txt file',
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
                    Robots.txt Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Create robots.txt files visually to control how search engines crawl your website.
                    Choose a preset or build custom rules for any crawler.
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <RobotsTxtGeneratorClient />
        </div>
    );
}
