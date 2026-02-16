import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { UnitConverterClient } from './client';
import { notFound } from 'next/navigation';
import { Calculator } from 'lucide-react';

const slug = 'unit-converter';

export const metadata: Metadata = {
    title: 'Unit Converter | Free Online Measurement Conversion Tool',
    description: 'Convert between length, weight, temperature, volume, area, speed, pressure, energy, power, data, and time units. Instant, accurate conversions with real-time results.',
    keywords: [
        'unit converter',
        'measurement converter',
        'length converter',
        'weight converter',
        'temperature converter',
        'volume converter',
        'speed converter',
        'online converter',
        'metric converter',
        'imperial converter',
    ],
    openGraph: {
        title: 'Unit Converter | Xenkio Tools',
        description: 'Convert any unit instantly. Length, weight, temperature, volume, speed, and more.',
        type: 'website',
    },
};

export default function UnitConverterPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Unit Converter',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Length conversion',
            'Weight/Mass conversion',
            'Temperature conversion',
            'Volume conversion',
            'Area conversion',
            'Speed conversion',
            'Pressure conversion',
            'Energy conversion',
            'Power conversion',
            'Data/Digital storage conversion',
            'Time conversion',
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
                            <Calculator className="w-3.5 h-3.5" />
                            Instant Conversions
                        </div>
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
                <UnitConverterClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Universal Unit Conversion
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">
                                        Comprehensive coverage
                                    </strong>{' '}
                                    of all major unit categories including metric and
                                    imperial systems. From everyday measurements to
                                    scientific units.
                                </p>
                                <p>
                                    All conversions happen instantly in your browser with
                                    no server requests required. Your data stays private and
                                    secure.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Precision & Accuracy
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">
                                        Scientific precision
                                    </strong>{' '}
                                    using standardized conversion factors. Results are
                                    calculated with high precision and displayed in
                                    easy-to-read formats.
                                </p>
                                <p>
                                    Supports both common conversions and specialized units
                                    for professional use cases.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Supported Unit Categories
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    title: 'Length',
                                    desc: 'Meters, feet, inches, miles, kilometers, yards',
                                },
                                {
                                    title: 'Weight/Mass',
                                    desc: 'Kilograms, pounds, ounces, grams, tons, stones',
                                },
                                {
                                    title: 'Temperature',
                                    desc: 'Celsius, Fahrenheit, Kelvin conversions',
                                },
                                {
                                    title: 'Volume',
                                    desc: 'Liters, gallons, cups, ounces, milliliters',
                                },
                                {
                                    title: 'Area',
                                    desc: 'Square meters, acres, hectares, square feet',
                                },
                                {
                                    title: 'Speed',
                                    desc: 'MPH, KPH, knots, meters per second, Mach',
                                },
                                {
                                    title: 'Pressure',
                                    desc: 'Pascals, PSI, bar, atmospheres, torr',
                                },
                                {
                                    title: 'Energy',
                                    desc: 'Joules, calories, BTU, kilowatt-hours',
                                },
                                {
                                    title: 'Data',
                                    desc: 'Bytes, KB, MB, GB, TB, bits with binary & decimal',
                                },
                                {
                                    title: 'Time',
                                    desc: 'Seconds, minutes, hours, days, weeks, years',
                                },
                                {
                                    title: 'Power',
                                    desc: 'Watts, horsepower, kilowatts, BTU/hr',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-4 bg-white rounded-xl border border-gray-200"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
