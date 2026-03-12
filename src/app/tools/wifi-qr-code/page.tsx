import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { WifiQrCodeClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'wifi-qr-code';

export const metadata: Metadata = {
    title: 'WiFi QR Code Generator - Share WiFi Access Instantly | Xenkio',
    description: 'Create QR codes to share WiFi access without typing passwords. Supports WPA, WPA2, WPA3, WEP, and open networks. Free and secure.',
    keywords: ['wifi qr code', 'wifi qr generator', 'share wifi', 'wifi password qr', 'qr code wifi', 'wifi sharing'],
    openGraph: {
        title: 'WiFi QR Code Generator | Xenkio',
        description: 'Create QR codes to share WiFi access without typing passwords.',
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
            "Share WiFi via QR code",
            "Supports WPA/WPA2/WPA3, WEP, and open networks",
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
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>
            <WifiQrCodeClient />
        </div>
    );
}
