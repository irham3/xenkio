import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { QrGeneratorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'qr-code-generator';

export const metadata: Metadata = {
    title: 'QR Code Generator - Create Custom QR Codes for Free',
    description: 'Create custom QR codes with logos, colors, and multiple export formats including PNG, and SVG. 100% free and secure.',
    openGraph: {
        title: 'QR Code Generator | Xenkio',
        description: 'Professional QR code generator with customization options.',
    }
};

export default function QrGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QR Code Generator",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Custom colors and logos",
            "High resolution download",
            "Multiple formats (PNG, SVG)",
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
            <QrGeneratorClient />
        </div>
    );
}
