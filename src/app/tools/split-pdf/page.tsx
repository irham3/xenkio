

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { SplitPdfClient } from './client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Split PDF Online Free - Extract Pages from PDF | Xenkio',
    description: 'Split PDF files online for free. Extract specific pages or split PDF by ranges. Fast, secure, and easy to use PDF splitter tool.',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'cut pdf', 'pdf splitter', 'free pdf splitter', 'online pdf tool'],
    openGraph: {
        title: 'Split PDF Online Free - Extract Pages | Xenkio',
        description: 'Split PDF documents instantly. Extract pages or separate by range. No file upload required - secure local processing.',
        type: 'website',
    }
};

export default function SplitPdfPage() {
    const tool = TOOLS.find(t => t.href === '/tools/split-pdf');

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Split PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Split PDF by page ranges",
            "Extract specific pages",
            "Instant download",
            "Secure processing"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <SplitPdfClient />
        </div>
    );
}
