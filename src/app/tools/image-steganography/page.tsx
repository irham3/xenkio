
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { SteganographyClient } from './client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Image Steganography - Hide Text in Images Secretly',
    description: 'Hide confidential messages inside images invisibly using LSB steganography. Encode and decode secret data without visual traces. 100% Client-side.',
    keywords: ['image steganography', 'hide text in image', 'lsb steganography', 'secret message image', 'image encoder decoder'],
    openGraph: {
        title: 'Image Steganography | Xenkio',
        description: 'Hide secret messages in images securely.',
        type: 'website',
    }
};

export default function SteganographyPage() {
    const tool = TOOLS.find(t => t.slug === 'image-steganography');

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Image Steganography",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Hide text in PNG images",
            "lsb algorithm (Least Significant Bit)",
            "Client-side processing",
            "Lossless encoding"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Header - Plain Title as Requested */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    Privacy Tools
                </div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150 relative z-10">
                    Image Steganography
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 font-medium">
                    Hide secret text messages inside images without changing their appearance. Using advanced LSB encoding for invisible data storage.
                </p>
            </div>

            <SteganographyClient />
        </div>
    );
}
