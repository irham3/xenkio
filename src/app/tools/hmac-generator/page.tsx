
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { HmacGeneratorClient } from './client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'HMAC Generator - Create Secure Hash-based Message Authentication Codes',
    description: 'Generate HMAC signatures (MD5, SHA256, SHA512) instantly. Secure, client-side tool for developers to debug API webhooks and verify data integrity.',
    keywords: ['hmac generator', 'hmac sha256', 'hmac md5', 'hmac online', 'jwt signature', 'api security tool'],
    openGraph: {
        title: 'HMAC Generator | Xenkio',
        description: 'Secure, instant HMAC generation for developers.',
        type: 'website',
    }
};

export default function HmacGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === 'hmac-generator');

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "HMAC Generator",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Support for MD5, SHA-1, SHA-256, SHA-512",
            "Hex and Base64 output",
            "Client-side processing (Secure)",
            "Instant results"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    Security Tools
                </div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150 relative z-10">
                    HMAC Generator
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 font-medium">
                    Create secure Hash-based Message Authentication Codes instantly. Supports all standard algorithms (SHA256, SHA512, MD5).
                </p>
            </div>

            <HmacGeneratorClient />
        </div>
    );
}
