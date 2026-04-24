import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { SoundRecorderClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'sound-recorder';

export const metadata: Metadata = {
    title: 'Sound Recorder | Free Online, No Upload Required',
    description: 'Record audio from your microphone directly in your browser. Pause, resume, and download as WebM or MP4. No installation, no upload, 100% private.',
    keywords: [
        'sound recorder',
        'voice recorder online',
        'audio recorder',
        'free voice recorder',
        'microphone recorder',
        'record audio online',
        'browser voice recorder',
        'audio recorder no install',
        'rekam suara online',
        'perekam suara gratis',
    ],
    openGraph: {
        title: 'Sound Recorder | Xenkio Tools',
        description: 'Record audio from your microphone in the browser. No installation, no upload. 100% client-side and private.',
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
        title: 'Sound Recorder | Free Online Tool',
        description: 'Record your voice or audio in your browser. No upload, no watermarks.',
        images: ['/og-image.jpg'],
    },
};

export default function SoundRecorderPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Sound Recorder',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Record audio from microphone',
            'Live audio level meter',
            'Pause and resume recording',
            'WebM (Opus) and MP4 (AAC) output formats',
            'Instant audio playback before download',
            'No server upload | 100% client-side',
            'No watermarks, no sign-up',
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
                <SoundRecorderClient />
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
                                    <strong className="text-gray-800">1. Allow Microphone:</strong>{' '}
                                    Click &quot;Start Recording&quot; and grant microphone permission. The live level meter confirms your mic is active.
                                </p>
                                <p>
                                    <strong className="text-gray-800">2. Record:</strong>{' '}
                                    Your audio is captured instantly. Pause and resume whenever you need. The timer tracks your total duration.
                                </p>
                                <p>
                                    <strong className="text-gray-800">3. Download:</strong>{' '}
                                    Stop the recording, preview it with the built-in player, then download your audio file — WebM or MP4.
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
                                    Your audio never leaves your device. Everything is processed locally using the browser&apos;s native MediaRecorder API.
                                </p>
                                <p>
                                    <strong className="text-gray-800">No Installation:</strong>{' '}
                                    No app, no extension. Just open this page and start recording in any modern browser — Chrome, Firefox, Edge, or Safari.
                                </p>
                                <p>
                                    <strong className="text-gray-800">No Limits:</strong>{' '}
                                    No time limits, no watermarks, no sign-up required. Record as many clips as you need, completely free.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
