import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import TeleprompterClient from './client';

const slug = 'teleprompter';

export const metadata: Metadata = {
    title: 'Free Online Teleprompter - Xenkio',
    description:
        'Free online teleprompter with two modes: auto-scroll mode for presentations & recording, or reading mode with page navigation for tablets, mobile, and laptops.',
    keywords: [
        'online teleprompter',
        'free teleprompter',
        'teleprompter mobile',
        'teleprompter tablet',
        'script reading',
        'auto scroll text',
        'reading mode',
    ],
    openGraph: {
        title: 'Online Teleprompter - Xenkio',
        description:
            'Read scripts with ease. Auto-scroll teleprompter mode or reading mode for any device.',
        type: 'website',
    },
};

export default function TeleprompterPage() {
    const tool = TOOLS.find((t) => t.slug === slug);
    if (!tool) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Teleprompter Online',
        applicationCategory: 'UtilitiesApplication',
        description:
            'Online teleprompter with auto-scroll and reading modes. Adjustable font size, perfect for presentations and recording.',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        featureList: [
            'Teleprompter mode with auto-scroll',
            'Reading mode with page navigation',
            'Adjustable font size',
            'Mirror mode for glass teleprompters',
            'Full-screen support',
            'Color presets',
            'Keyboard and swipe navigation',
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TeleprompterClient />
        </>
    );
}
