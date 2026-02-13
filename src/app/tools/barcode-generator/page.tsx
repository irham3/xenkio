import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { BarcodeGeneratorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'barcode-generator';

export const metadata: Metadata = {
    title: 'Barcode Generator - Create Barcodes Online for Free',
    description:
        'Generate barcodes in various formats including EAN-13, UPC-A, Code128, Code39, ITF-14, and more. Download as PNG or SVG. 100% free.',
    openGraph: {
        title: 'Barcode Generator | Xenkio',
        description:
            'Professional barcode generator with multiple format support.',
    },
};

export default function BarcodeGeneratorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Barcode Generator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Multiple barcode formats (CODE128, EAN-13, UPC-A, CODE39, ITF-14, MSI, Pharmacode)',
            'Customizable dimensions and colors',
            'Download as PNG or SVG',
            'Free to use',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    {tool.title}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {tool.description}
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <BarcodeGeneratorClient />
        </div>
    );
}
