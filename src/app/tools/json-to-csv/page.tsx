
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { JsonToCsvClient } from './client';
import { JsonToCsvContent } from '@/features/json-to-csv';
import { notFound } from 'next/navigation';

const SLUG = 'json-to-csv';

export const metadata: Metadata = {
    title: 'JSON to CSV Converter - Free Online Tool',
    description: 'Convert JSON to CSV format instantly with table preview. Flatten nested objects, custom delimiters, and secure client-side processing.',
    openGraph: {
        title: 'JSON to CSV Converter | Xenkio',
        description: 'Professional JSON to CSV converter with support for flattening nested objects and table preview.',
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
    keywords: ['json to csv', 'json converter', 'csv converter', 'json formatter', 'developer tools', 'json table preview'],
};

export default function JsonToCsvPage() {
    const tool = TOOLS.find(t => t.slug === SLUG);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JSON to CSV Converter",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Flatten nested JSON objects",
            "Table Preview Mode",
            "Custom delimiters (comma, semicolon, tab, pipe)",
            "Drag & Drop File Upload",
            "Client-side processing (secure)",
            "Download CSV",
            "Copy to Clipboard"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Tool Header */}
            <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    {tool.title}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {tool.description}
                </p>
            </div>

            {/* Feature UI - Interactive Tool */}
            <JsonToCsvClient />

            {/* Content Section - Explanation & Features */}
            <div className="mt-8">
                <JsonToCsvContent />
            </div>
        </div>
    );
}
