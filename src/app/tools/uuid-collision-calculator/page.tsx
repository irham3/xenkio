
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import UUIDCollisionClient from './client';

const slug = 'uuid-collision-calculator';

export const metadata: Metadata = {
    title: 'UUID Collision Probability Calculator - Xenkio',
    description: 'Calculate the probability of UUID, ULID, NanoID, or any unique identifier collision using the Birthday Problem formula. Visualize collision risk for any identifier type.',
    keywords: [
        'uuid collision probability',
        'birthday problem calculator',
        'uuid uniqueness',
        'nanoid collision',
        'ulid collision',
        'unique id birthday paradox',
        'hash collision probability',
        'identifier space calculator',
    ],
    openGraph: {
        title: 'UUID Collision Probability Calculator | Xenkio',
        description: 'Instantly calculate collision probability for UUID, ULID, NanoID, and custom identifiers using the Birthday Problem.',
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

export default function UUIDCollisionPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'UUID Collision Probability Calculator',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'UUID v4, v7, ULID, NanoID support',
            'Birthday Problem formula',
            'Logarithmic ID count slider',
            'Risk level visualization',
            'Safe count thresholds',
            '100% client-side — no data sent to server',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                    </span>
                    Security & Privacy
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    UUID Collision Calculator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-lg">
                    Calculate the probability of a collision when generating UUIDs, ULIDs, NanoIDs, or any
                    unique string — based on the Birthday Problem.
                </p>
            </div>

            {/* Feature UI */}
            <UUIDCollisionClient />
        </div>
    );
}
