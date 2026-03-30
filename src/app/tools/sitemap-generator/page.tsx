import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import SitemapGeneratorClient from './client';

const slug = 'sitemap-generator';

export const metadata: Metadata = {
    title: 'Sitemap Generator - Create XML Sitemap Instantly | Xenkio',
    description: 'Generate valid XML sitemaps for search engines in seconds. Add URLs, set priority and change frequency, then copy or download sitemap.xml locally.',
    keywords: [
        'sitemap generator',
        'xml sitemap generator',
        'create sitemap.xml',
        'seo sitemap tool',
        'website sitemap builder',
        'google sitemap generator',
        'sitemap.xml creator',
    ],
    openGraph: {
        title: 'Sitemap Generator | Xenkio',
        description: 'Generate valid XML sitemaps for search engines. Free, fast, and privacy-focused.',
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

export default function SitemapGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Sitemap Generator',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'XML sitemap generation',
            'Bulk URL path import',
            'Priority and change frequency controls',
            'Optional last modified dates',
            'Quick presets for common site structures',
            'Instant copy and download as sitemap.xml',
            'Real-time preview',
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
                    Sitemap Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Build a valid XML sitemap for your website in seconds. Add your page paths,
                    customize SEO hints, and export a ready-to-upload sitemap.xml file.
                </p>
            </div>

            <SitemapGeneratorClient />
        </div>
    );
}
