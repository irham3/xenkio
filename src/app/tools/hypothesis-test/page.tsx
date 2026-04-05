import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import HypothesisTestClient from './client';

const slug = 'hypothesis-test';

export const metadata: Metadata = {
    title: 'Statistical Hypothesis Test - Xenkio',
    description:
        'Online statistical hypothesis test calculator: t-test, z-test, chi-square, ANOVA, Pearson correlation. Paste data from Excel, processed in browser, no upload.',
    keywords: [
        'hypothesis test',
        'hypothesis testing',
        't-test',
        'z-test',
        'chi-square test',
        'one-way anova',
        'paired t test',
        'pearson correlation',
        'research statistics',
        'online statistical test',
        'hypothesis calculator',
        'statistical significance',
    ],
    openGraph: {
        title: 'Statistical Hypothesis Test | Xenkio',
        description:
            'Hypothesis test calculator: t-test, z-test, chi-square, ANOVA, correlation. Paste data from Excel, instant results in browser.',
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
            'Paste data directly from Excel',
            'Automatic descriptive statistics',
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
                    Statistical Hypothesis Test
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Calculate statistical tests for research needs — t-test, z-test, chi-square, ANOVA, and
                    Pearson correlation. Paste data directly from Excel or type manually. All calculated in browser.
                </p>
            </div>

            <HypothesisTestClient />
        </div>
    );
}
