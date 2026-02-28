import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { AgeCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'age-calculator';

export const metadata: Metadata = {
    title: 'Age Calculator | Free Online Exact Age Calculator',
    description:
        'Calculate your exact age in years, months, and days from your date of birth. See total days, weeks, hours lived and countdown to your next birthday.',
    keywords: [
        'age calculator',
        'calculate age',
        'how old am I',
        'exact age calculator',
        'birthday calculator',
        'date of birth calculator',
        'age in days',
        'age in months',
        'next birthday countdown',
        'online age calculator',
    ],
    openGraph: {
        title: 'Age Calculator | Xenkio Tools',
        description:
            'Calculate your exact age instantly. See years, months, days, and fun facts about your birth date.',
        type: 'website',
    },
};

export default function AgeCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Age Calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Exact age in years, months, and days',
            'Total days, weeks, months, hours lived',
            'Next birthday countdown',
            'Day of birth',
            'Birthstone and birth season',
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
                <AgeCalculatorClient />
            </section>


        </div>
    );
}
