import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { BmiCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'bmi-calculator';

export const metadata: Metadata = {
    title: 'BMI Calculator | Free Online Body Mass Index Calculator',
    description:
        'Calculate your Body Mass Index (BMI) instantly. Supports metric and imperial units. Get your BMI category, health risk assessment, and healthy weight range.',
    keywords: [
        'BMI calculator',
        'body mass index',
        'calculate BMI',
        'healthy weight',
        'BMI chart',
        'BMI categories',
        'weight health check',
    ],
    openGraph: {
        title: 'BMI Calculator | Xenkio Tools',
        description:
            'Calculate your BMI instantly with metric or imperial units. See your BMI category, health risk, and ideal weight range.',
        type: 'website',
    },
};

export default function BmiCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'BMI Calculator',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Metric and imperial unit support',
            'Live BMI calculation',
            'BMI category and health risk assessment',
            'Visual BMI gauge',
            'Healthy weight range for your height',
            'Weight to gain/lose to reach healthy BMI',
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
                <BmiCalculatorClient />
            </section>
        </div>
    );
}
