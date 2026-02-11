
export const runtime = 'edge';

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { UUIDGeneratorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'uuid-generator';

export const metadata: Metadata = {
    title: 'UUID/GUID Generator (v1-v7) - Xenkio',
    description: 'Generate secure and RFC-compliant UUIDs (v1, v3, v4, v5, v6, v7). Supports bulk generation, custom formatting, and deterministic IDs. Fast, free, and privacy-focused.',
    keywords: [
        'uuid generator',
        'guid generator',
        'uuid v7 generator',
        'uuid v6 generator',
        'uuid v4',
        'rfc 4122',
        'bulk uuid online',
        'uuid tool'
    ],
    openGraph: {
        title: 'UUID/GUID Generator (v1-v7) | Xenkio',
        description: 'Generate RFC-compliant UUIDs from v1 to v7 in various formats. Secure and fast.',
        type: 'website',
    }
};

export default function UUIDGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug || t.id === '21');

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "UUID Generator",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Full UUID support (v1, v3, v4, v5, v6, v7)",
            "Bulk generation (up to 50)",
            "Professional clean interface",
            "Uppercase formatting",
            "Raw (no-hyphen) format",
            "History tracking"
        ]
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
                    UUID Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Generate secure and unique identifiers compliant with RFC standards.
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <UUIDGeneratorClient />
        </div>
    );
}
