import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/data/tools';
import SchemaGeneratorClient from './client';

const slug = 'schema-generator';

export const metadata: Metadata = {
    title: 'Schema Markup Generator - Create JSON-LD Structured Data | Xenkio',
    description: 'Generate schema markup in JSON-LD format for Organization, Website, Article, and FAQ pages. Improve rich results with a fast, privacy-focused tool.',
    keywords: [
        'schema markup generator',
        'json ld generator',
        'structured data generator',
        'faq schema generator',
        'article schema',
        'organization schema',
        'seo schema tool',
    ],
    openGraph: {
        title: 'Schema Markup Generator | Xenkio',
        description: 'Create JSON-LD structured data for rich search results. Free, instant, and privacy-focused.',
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

export default function SchemaGeneratorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Schema Markup Generator',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'JSON-LD output for Organization schema',
            'Website schema with SearchAction markup',
            'Article schema fields for SEO metadata',
            'FAQ schema builder with dynamic question items',
            'Instant copy and download',
            'Real-time schema preview',
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
                    Schema Markup Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Build valid JSON-LD schema markup for rich results. Choose a schema type,
                    fill your content fields, and export production-ready structured data instantly.
                </p>
            </div>

            <SchemaGeneratorClient />
        </div>
    );
}
