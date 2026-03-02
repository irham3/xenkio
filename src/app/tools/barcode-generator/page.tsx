import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { BarcodeGeneratorClient } from './client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Free Barcode Generator - Create Custom Barcodes Online | Xenkio',
    description: 'Generate customizable barcodes in various formats including CODE128, EAN13, and UPC. Download as PNG or SVG instantly.',
    keywords: ['barcode generator', 'free barcode maker', 'online barcode', 'code128 generator', 'ean13 generator', 'upc generator'],
    openGraph: {
        title: 'Free Barcode Generator - Custom Design & Formats',
        description: 'Create professional barcodes instantly. Support for all major formats. No signup required.',
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

    }
};

export default function BarcodeGeneratorPage() {
    const tool = TOOLS.find(t => t.href === '/tools/barcode-generator');

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Barcode Generator",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Support for EAN, UPC, Code128 and more",
            "Customizable width, height and colors",
            "High resolution PNG and SVG download",
            "Real-time preview"
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
            <BarcodeGeneratorClient />
        </div>
    );
}
