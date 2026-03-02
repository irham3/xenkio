import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { PdfReaderClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'pdf-reader';

export const metadata: Metadata = {
    title: 'PDF Reader with Hand Gesture Navigation | Free Online AI PDF Viewer',
    description:
        'Read PDF documents in your browser with AI-powered hand gesture page navigation. Swipe your hand in front of your camera to flip pages. No uploads, 100% private.',
    keywords: [
        'pdf reader',
        'pdf viewer online',
        'gesture control pdf',
        'hand gesture navigation',
        'tensorflow js pdf',
        'ai pdf reader',
        'swipe pdf pages',
        'online pdf reader',
        'free pdf viewer',
        'hands-free pdf reader',
    ],
    openGraph: {
        title: 'PDF Reader with Gesture Navigation | Xenkio Tools',
        description:
            'Read PDFs with AI-powered hand gesture page navigation. Swipe in front of your camera to flip pages — 100% browser-based.',
        type: 'website',
    },
};

export default function PdfReaderPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'PDF Reader with Hand Gesture Navigation',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'PDF rendering in browser',
            'Hand gesture page navigation',
            'TensorFlow.js AI hand detection',
            'Keyboard and button navigation',
            'Zoom controls',
            'Webcam preview with hand landmarks',
            '100% client-side processing',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            {tool.title}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {tool.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-5xl pb-16">
                <PdfReaderClient />
            </section>
        </div>
    );
}
