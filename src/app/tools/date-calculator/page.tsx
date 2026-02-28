import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { DateCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'date-calculator';

export const metadata: Metadata = {
    title: 'Date Calculator | Free Online Date Difference & Add/Subtract Tool',
    description:
        'Calculate the exact difference between two dates in years, months, days, hours, and minutes. Add or subtract days, weeks, months, or years from any date.',
    keywords: [
        'date calculator',
        'date difference calculator',
        'days between dates',
        'add days to date',
        'subtract days from date',
        'date duration calculator',
        'how many days between',
        'date math calculator',
        'business days calculator',
        'weekdays between dates',
    ],
    openGraph: {
        title: 'Date Calculator | Xenkio Tools',
        description:
            'Calculate date differences, add or subtract days, weeks, months, or years from any date. Free, fast, and private.',
        type: 'website',
    },
};

export default function DateCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Date Calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Date difference in years, months, and days',
            'Total days, weeks, hours, minutes between dates',
            'Add or subtract days, weeks, months, years',
            'Weekday and weekend day counts',
            'Week number and day of year',
            'Leap year detection',
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
                <DateCalculatorClient />
            </section>
        </div>
    );
}
