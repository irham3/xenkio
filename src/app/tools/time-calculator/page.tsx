import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { TimeCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'time-calculator';

export const metadata: Metadata = {
    title: 'Time Calculator | Free Online Time Difference & Add/Subtract Tool',
    description:
        'Calculate the exact difference between two times in hours, minutes, and seconds. Add or subtract any duration from a given time.',
    keywords: [
        'time calculator',
        'time difference calculator',
        'hours minutes seconds calculator',
        'add time calculator',
        'subtract time calculator',
        'time duration calculator',
        'time arithmetic calculator',
        'HH MM SS calculator',
    ],
    openGraph: {
        title: 'Time Calculator | Xenkio Tools',
        description:
            'Calculate time differences, add or subtract hours, minutes, or seconds from any time. Free, fast, and private.',
        type: 'website',
    },
};

export default function TimeCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Time Calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Time difference in hours, minutes, and seconds',
            'Add or subtract hours, minutes, seconds',
            'Total seconds, minutes, hours between times',
            'Day-wrap tracking for add/subtract',
            'Instant results, no server needed',
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
                <TimeCalculatorClient />
            </section>
        </div>
    );
}
