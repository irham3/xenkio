import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import RunningTextClient from './client';

const slug = 'running-text';

export const metadata: Metadata = {
    title: 'Running Text / Marquee Display - Xenkio',
    description:
        'Create animated scrolling running text with strobe effects (ambulance, police, warning), blink mode, custom colors, speed controls, and fullscreen display. Free and browser-based.',
    keywords: [
        'running text',
        'marquee text',
        'scrolling text',
        'strobe effect',
        'ambulance light effect',
        'blinking text',
        'fullscreen text display',
        'led marquee online',
        'animated text generator',
        'running text display',
    ],
    openGraph: {
        title: 'Running Text / Marquee Display | Xenkio',
        description:
            'Animated scrolling text with strobe, blink, and fullscreen modes. Fully customizable.',
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
};

export default function RunningTextPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Running Text',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Animated scrolling text (left/right)',
            'Strobe modes: Ambulance, Police, Warning, Custom',
            'Blink effect (slow, medium, fast)',
            'Fullscreen display mode',
            'Custom text & background colors',
            'Adjustable speed and font size',
            'Multiple font families',
            'Custom separator between repetitions',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Tool Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Running Text
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Create animated scrolling text with strobe effects, blink animations, and
                    fullscreen display. Perfect for events, presentations, or LED-style displays.
                </p>
            </div>

            <RunningTextClient />
        </div>
    );
}
