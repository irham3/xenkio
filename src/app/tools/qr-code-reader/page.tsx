import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { QrCodeReaderClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'qr-code-reader';

export const metadata: Metadata = {
    title: 'QR Code Reader - Scan & Decode QR Codes for Free',
    description: 'Scan and decode QR codes from images instantly. Upload, drag and drop, or paste from clipboard. 100% free, private, and secure.',
    openGraph: {
        title: 'QR Code Reader | Xenkio',
        description: 'Scan and decode QR codes from images instantly.',
    }
};

export default function QrReaderPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QR Code Reader",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Upload image to decode",
            "Drag and drop support",
            "Paste from clipboard",
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
            <QrCodeReaderClient />
        </div>
    );
}
