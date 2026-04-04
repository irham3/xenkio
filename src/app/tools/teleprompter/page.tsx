import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import TeleprompterClient from './client';

const slug = 'teleprompter';

export const metadata: Metadata = {
    title: 'Teleprompter Online Gratis - Xenkio',
    description:
        'Teleprompter online gratis dengan dua mode: mode gulir otomatis untuk presentasi & rekaman, atau mode baca dengan navigasi halaman untuk tablet, HP, dan laptop.',
    keywords: [
        'teleprompter online',
        'teleprompter gratis',
        'teleprompter hp',
        'teleprompter tablet',
        'baca naskah',
        'script reader',
        'auto scroll text',
        'mode baca',
    ],
    openGraph: {
        title: 'Teleprompter Online - Xenkio',
        description:
            'Baca naskah dengan mudah. Mode teleprompter gulir otomatis atau mode baca next/prev untuk perangkat apa pun.',
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
            'Teleprompter online dengan mode gulir otomatis dan mode baca halaman. Ukuran font mudah diubah, cocok untuk presentasi dan rekaman.',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'IDR',
        },
        featureList: [
            'Mode teleprompter dengan gulir otomatis',
            'Mode baca dengan navigasi halaman',
            'Ukuran font mudah diubah',
            'Mode mirror untuk kaca teleprompter',
            'Dukungan layar penuh',
            'Preset warna',
            'Navigasi keyboard dan swipe',
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
