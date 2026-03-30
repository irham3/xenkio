import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import SpeedTestClient from './client';

const slug = 'speed-test';

export const metadata: Metadata = {
    title: 'Internet Speed Test — Check Download, Upload & Ping | Xenkio',
    description:
        'Test your internet connection speed instantly. Measure download speed, upload speed, ping, and jitter directly in your browser. No sign-up required.',
    keywords: [
        'internet speed test',
        'speed test',
        'download speed test',
        'upload speed test',
        'ping test',
        'jitter test',
        'broadband speed test',
        'wifi speed test',
        'connection speed checker',
        'network speed test',
        'bandwidth test',
        'internet speed checker',
    ],
    openGraph: {
        title: 'Internet Speed Test | Xenkio',
        description:
            'Check your download speed, upload speed, ping and jitter instantly — no sign-up, fully browser-based.',
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
        title: 'Internet Speed Test — Download, Upload & Ping',
        description:
            'Test your internet speed in seconds. Measures download, upload, ping and jitter. 100% free.',
        images: ['/og-image.jpg'],
    },
};

export default function SpeedTestPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Internet Speed Test',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Real-time download speed measurement',
            'Real-time upload speed measurement',
            'Ping (latency) measurement',
            'Jitter measurement',
            'Speed quality ratings',
            'No installation or sign-up required',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Internet Speed Test
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Measure your download speed, upload speed, ping, and jitter — instantly, right in your browser
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-5xl">
                <SpeedTestClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">What Does a Speed Test Measure?</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    An internet speed test measures the performance of your connection between
                                    your device and a test server. It gives you four key metrics: download speed,
                                    upload speed, ping, and jitter.
                                </p>
                                <p>
                                    Results can vary depending on your current network load, Wi-Fi interference,
                                    time of day, and how far you are from the test server. For the most accurate
                                    results, close other apps and run the test multiple times.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Understanding the Metrics</h2>
                            <div className="space-y-2 text-sm text-gray-600">
                                {[
                                    { term: 'Download', desc: 'How fast data travels from the internet to your device (Mbps)' },
                                    { term: 'Upload', desc: 'How fast data travels from your device to the internet (Mbps)' },
                                    { term: 'Ping', desc: 'Round-trip latency to the test server in milliseconds (ms)' },
                                    { term: 'Jitter', desc: 'Variation in ping over time — lower is more stable (ms)' },
                                ].map(({ term, desc }) => (
                                    <div key={term} className="flex items-baseline gap-2">
                                        <span className="inline-block font-bold font-mono text-primary-700 bg-primary-50 px-1.5 rounded text-xs shrink-0">
                                            {term}
                                        </span>
                                        <span>{desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Speed Reference Guide</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Streaming Video</h3>
                                <p className="text-sm text-gray-600">
                                    HD Netflix requires ~5 Mbps. 4K Ultra HD needs 25 Mbps or more. Live
                                    streaming to platforms like YouTube needs 10+ Mbps upload.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Online Gaming</h3>
                                <p className="text-sm text-gray-600">
                                    Gaming needs low ping (under 50 ms) and low jitter more than raw speed.
                                    A 10 Mbps connection with 20 ms ping beats 100 Mbps with 80 ms ping.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Video Calls</h3>
                                <p className="text-sm text-gray-600">
                                    HD Zoom or Teams calls need around 3 Mbps download and 3 Mbps upload.
                                    Group calls require 10+ Mbps for the best quality.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Working From Home</h3>
                                <p className="text-sm text-gray-600">
                                    A general guide: 25 Mbps download and 5 Mbps upload is sufficient for
                                    a single remote worker with video calls and cloud apps.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Smart Home / IoT</h3>
                                <p className="text-sm text-gray-600">
                                    Each smart device uses a small amount of bandwidth. A household with
                                    many devices should target 100+ Mbps to avoid congestion.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Cloud Backups</h3>
                                <p className="text-sm text-gray-600">
                                    Upload speed is critical for cloud storage. A 50 MB file takes roughly
                                    7 seconds at 50 Mbps upload vs. 70 seconds at 5 Mbps.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
