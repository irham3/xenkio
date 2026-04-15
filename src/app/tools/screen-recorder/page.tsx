import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { ScreenRecorderClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'screen-recorder';

export const metadata: Metadata = {
    title: 'Screen Recorder | Free Online, No Upload Required',
    description: 'Record your screen, window, or browser tab directly in your browser. Include microphone and system audio. No installation, no upload, 100% private.',
    keywords: [
        'screen recorder',
        'screen recorder online',
        'free screen recorder',
        'screen recording tool',
        'record screen online',
        'browser screen recorder',
        'screen capture',
        'screen record no install',
        'rekam layar online',
        'screen recorder gratis',
    ],
    openGraph: {
        title: 'Screen Recorder | Xenkio Tools',
        description: 'Record your screen directly in the browser. No installation, no upload. 100% client-side and private.',
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
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Screen Recorder | Free Online Tool',
        description: 'Record your screen, window, or tab in your browser. No upload, no watermarks.',
        images: ['/og-image.jpg'],
    },
};

export default function ScreenRecorderPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Screen Recorder',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Record entire screen, window, or browser tab',
            'Include microphone audio',
            'Include system audio',
            'Pause and resume recording',
            'WebM and MP4 output formats',
            'Adjustable video quality (1-5 Mbps)',
            'No server upload | 100% client-side',
            'Instant download, no watermarks',
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
                <ScreenRecorderClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How It Works
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">1. Choose Source:</strong>{' '}
                                    Click &quot;Start Recording&quot; and select what to capture — your entire screen, a specific window, or a browser tab.
                                </p>
                                <p>
                                    <strong className="text-gray-800">2. Record:</strong>{' '}
                                    Your recording starts immediately. Pause and resume anytime. Optionally include microphone or system audio.
                                </p>
                                <p>
                                    <strong className="text-gray-800">3. Download:</strong>{' '}
                                    Stop the recording and preview it instantly. Download your video in WebM or MP4 format with no watermarks.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Why Use This Tool?
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">100% Private:</strong>{' '}
                                    Your recording never leaves your device. Everything happens directly in your browser using native APIs.
                                </p>
                                <p>
                                    <strong className="text-gray-800">No Installation:</strong>{' '}
                                    No extensions, no desktop apps. Just open this page and start recording instantly in any modern browser.
                                </p>
                                <p>
                                    <strong className="text-gray-800">No Limits:</strong>{' '}
                                    No time limits, no watermarks, no sign-up required. Record as many videos as you need.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
