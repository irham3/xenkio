import { Metadata } from 'next';
import DataVerifierClient from './client';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Data Verifier | Compare & Sync Excel/CSV Data Online',
    description: 'Verify and synchronize mismatched data between two sources instantly. Paste Excel or CSV data, find differences, and fix errors row-by-row.',
    keywords: ['data verifier', 'excel compare', 'csv compare', 'data matching', 'data synchronization', 'find differences in excel', 'data consolidation tool'],
    openGraph: {
        title: 'Data Verifier | Fast Data Comparison Tool',
        description: 'Find mismatches and synchronize data from two different sources safely in your browser.',
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

export default function DataVerifierPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Data Verifier",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Verify and synchronize mismatched data between two sources instantly. Paste Excel or CSV data, find differences, and fix errors row-by-row.",
        "featureList": [
            "Side-by-side data comparison",
            "Real-time highlighting of mismatched cells",
            "Missing row detection",
            "One-click data synchronization",
            "100% Client-side processing (Privacy focused)"
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12 max-w-7xl">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full text-xs font-medium text-primary-600 mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            100% Secure Client-Side Processing
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Data Verifier
                        </h1>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Easily compare two datasets, find differences, and synchronize them instantly. Perfect for cleaning up Excel sheets, database dumps, or mismatched records.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-7xl mt-8">
                <DataVerifierClient />
            </section>
        </div>
    );
}
