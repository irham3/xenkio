import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import HypothesisTestClient from './client';

const slug = 'hypothesis-test';

export const metadata: Metadata = {
    title: 'Uji Hipotesis Statistik - Xenkio',
    description:
        'Kalkulator uji hipotesis statistik online: t-test, z-test, chi-square, ANOVA, korelasi Pearson. Paste data dari Excel, proses di browser, tanpa upload.',
    keywords: [
        'uji hipotesis',
        'hypothesis testing',
        't-test',
        'z-test',
        'chi-square test',
        'one-way anova',
        'paired t test',
        'pearson correlation',
        'statistik penelitian',
        'uji statistik online',
        'hypothesis calculator',
        'statistical significance',
    ],
    openGraph: {
        title: 'Uji Hipotesis Statistik | Xenkio',
        description:
            'Kalkulator uji hipotesis: t-test, z-test, chi-square, ANOVA, korelasi. Paste data dari Excel, hasil instan di browser.',
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

export default function HypothesisTestPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Hypothesis Test Calculator',
        applicationCategory: 'EducationApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'One-Sample & Two-Sample t-Test',
            'Paired t-Test',
            'One-Sample & Two-Sample Z-Test',
            'Chi-Square Goodness-of-Fit',
            'Chi-Square Test of Independence',
            'One-Way ANOVA',
            'Pearson Correlation',
            'Paste data langsung dari Excel',
            'Statistik deskriptif otomatis',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Uji Hipotesis Statistik
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Hitung uji statistik untuk kebutuhan penelitian — t-test, z-test, chi-square, ANOVA, dan
                    korelasi Pearson. Paste data langsung dari Excel atau ketik manual. Semua dihitung di browser.
                </p>
            </div>

            <HypothesisTestClient />
        </div>
    );
}
