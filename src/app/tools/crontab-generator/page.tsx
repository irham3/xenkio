import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import CrontabGeneratorClient from './client';

const slug = 'crontab-generator';

export const metadata: Metadata = {
    title: 'Crontab Generator & Parser - Xenkio',
    description: 'Build cron expressions visually or parse existing ones into human-readable format. Supports all standard cron fields with presets, validation, and next execution preview.',
    keywords: [
        'crontab generator',
        'cron expression generator',
        'cron parser',
        'crontab parser',
        'cron schedule builder',
        'cron to human readable',
        'crontab maker',
        'cron expression builder',
    ],
    openGraph: {
        title: 'Crontab Generator & Parser | Xenkio',
        description: 'Build cron expressions visually or parse existing ones into human-readable format. Free, fast, and privacy-focused.',
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

export default function CrontabGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Crontab Generator & Parser',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'description': tool.description,
        'featureList': [
            'Visual cron expression builder',
            'Cron expression parser to human-readable',
            'Quick presets for common schedules',
            'Next execution time preview',
            'Standard 5-field cron format',
            'Real-time validation',
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
                    Crontab Generator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Build cron expressions visually or parse existing ones into human-readable schedules.
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <CrontabGeneratorClient />
        </div>
    );
}
