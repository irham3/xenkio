import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { DiscountCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'discount-calculator';

export const metadata: Metadata = {
    title: 'Discount Calculator — How Much After Discount?',
    description: 'Calculate the final price after discount instantly. Supports stacked discounts, tax calculation, and price breakdown. Free, no sign-up required.',
    keywords: [
        'discount calculator',
        'price after discount',
        'calculate discount',
        'sale price calculator',
        'percentage off calculator',
        'stacked discount calculator',
        'berapa harga setelah diskon',
        'kalkulator diskon',
        'online discount calculator',
        'shopping calculator',
    ],
    openGraph: {
        title: 'Discount Calculator | Xenkio Tools',
        description: 'Find out the final price after discount. Supports stacked discounts and tax. Instant results, no sign-up.',
        type: 'website',
    },
};

export default function DiscountCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Discount Calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Calculate price after discount',
            'Stacked / additional discount',
            'Tax calculation on discounted price',
            'Full price breakdown',
            'Copy results to clipboard',
            'Quick discount presets',
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
                <DiscountCalculatorClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How Discount Calculation Works
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">
                                        Single discount:
                                    </strong>{' '}
                                    Multiply the original price by the discount percentage, then subtract
                                    from the original. For example, 20% off 250,000 = 250,000 × 0.20 = 50,000 saved,
                                    so you pay 200,000.
                                </p>
                                <p>
                                    <strong className="text-gray-800">
                                        Stacked discounts:
                                    </strong>{' '}
                                    When two discounts are applied sequentially (e.g. 20% + 10%),
                                    the second discount is applied to the already-reduced price, not the original.
                                    This means 20% + 10% off ≠ 30% off — the effective discount is 28%.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                When to Use This
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Shopping during sale events or flash sales</li>
                                    <li>Comparing deals across different stores</li>
                                    <li>Calculating final price with voucher + store discount</li>
                                    <li>Estimating total cost including tax</li>
                                    <li>Preparing quotes and pricing for clients</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Formula Reference
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    title: 'Discount Amount',
                                    desc: 'Price × (Discount% / 100)',
                                },
                                {
                                    title: 'Final Price',
                                    desc: 'Price − Discount Amount',
                                },
                                {
                                    title: 'Stacked Discount',
                                    desc: '(Price × (1 − D1%)) × (1 − D2%)',
                                },
                                {
                                    title: 'Effective Discount %',
                                    desc: '(Total Saved / Original) × 100',
                                },
                                {
                                    title: 'Price + Tax',
                                    desc: 'Discounted Price × (1 + Tax%)',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-4 bg-white rounded-xl border border-gray-200"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {item.title}
                                    </h3>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-primary font-mono">{item.desc}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
