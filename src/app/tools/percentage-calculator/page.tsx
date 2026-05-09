import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/data/tools';
import { PercentageCalculatorClient } from './client';

const slug = 'percentage-calculator';

export const metadata: Metadata = {
    title: 'Percentage Calculator | Percent of, Change, Increase and Decrease',
    description:
        'Calculate percentages instantly: find percent of a number, percentage share, percent change, and percentage increase or decrease.',
    keywords: [
        'percentage calculator',
        'percent calculator',
        'calculate percentage',
        'percentage increase calculator',
        'percentage decrease calculator',
        'percent change calculator',
        'what percent calculator',
        'online percentage calculator',
    ],
    openGraph: {
        title: 'Percentage Calculator | Xenkio Tools',
        description:
            'Calculate percent of a value, percentage share, percent change, and add or subtract percentages instantly.',
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

export default function PercentageCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Percentage Calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Find what a percentage of a number equals',
            'Find what percent one number is of another',
            'Calculate percentage increase or decrease',
            'Add or subtract a percentage from a value',
            'Copy results and formulas instantly',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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

            <section className="container mx-auto px-4 max-w-5xl pb-16">
                <PercentageCalculatorClient />
            </section>

            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How Percentage Math Works
                            </h2>
                            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                                <p>
                                    A percentage is a value out of 100. To find 20% of 150,
                                    convert 20% to 0.20 and multiply it by 150. The answer is 30.
                                </p>
                                <p>
                                    Percent change compares a new value against an old value:
                                    subtract the old value from the new value, divide by the old
                                    value, then multiply by 100.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Common Uses
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-gray-600">
                                <li>Calculate tax, tips, commissions, markups, and discounts</li>
                                <li>Compare growth or decline between two values</li>
                                <li>Find completion rate, score percentage, or share of a total</li>
                                <li>Increase or decrease prices, budgets, and measurements</li>
                                <li>Double-check spreadsheet percentage formulas quickly</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
