import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { WifiQrCodeClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'wifi-qr-code';

export const metadata: Metadata = {
    title: 'WiFi QR Code Generator - Share WiFi Instantly | Xenkio',
    description: 'Create QR codes to share WiFi access without typing passwords. Guests scan the code and connect instantly. Free, private, and secure.',
    keywords: ['wifi qr code', 'wifi qr generator', 'share wifi qr', 'wifi password qr code', 'qr code wifi', 'free wifi qr code generator'],
    openGraph: {
        title: 'WiFi QR Code Generator | Xenkio',
        description: 'Create QR codes to share WiFi access instantly. No typing passwords. Free and secure.',
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

export default function WifiQrCodePage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "WiFi QR Code Generator",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Generate WiFi QR codes instantly",
            "Support for WPA, WEP, and open networks",
            "Customizable colors and error correction",
            "Download as PNG",
            "100% client-side processing"
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
            <WifiQrCodeClient />
        </div>
    );
}
