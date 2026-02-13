import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { FaviconGeneratorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'favicon-generator';

export const metadata: Metadata = {
    title: 'Favicon Generator - Create Favicons for Your Website for Free',
    description: 'Generate favicon.ico and PNG favicons in all sizes from any image. Free online favicon generator with multiple sizes, ICO format, and HTML tags.',
    openGraph: {
        title: 'Favicon Generator | Xenkio',
        description: 'Create favicons in all sizes from any image. Free and secure.',
    }
};

export default function FaviconGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Favicon Generator",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Multiple favicon sizes",
            "ICO format generation",
            "PNG download",
            "ZIP download",
            "HTML tags generation",
            "Free to use"
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
            <FaviconGeneratorClient />
        </div>
    );
}
