import { Metadata } from 'next';
import YamlValidatorClient from './client';

export const metadata: Metadata = {
    title: 'YAML Validator & Formatter | Free Online YAML Checker',
    description:
        'Validate, format, and convert YAML instantly. Detect syntax errors with line/column info, convert YAML to JSON or JSON to YAML. 100% client-side and free.',
    keywords: [
        'yaml validator',
        'yaml checker',
        'yaml formatter',
        'yaml linter',
        'yaml to json',
        'json to yaml',
        'validate yaml online',
        'yaml syntax checker',
        'yaml beautifier',
        'yaml parser',
    ],
    openGraph: {
        title: 'YAML Validator & Formatter | Free Online YAML Checker',
        description:
            'Validate, format, and convert YAML instantly. Detect syntax errors, convert YAML to JSON and back. Free, secure, 100% client-side.',
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
    twitter: {
        card: 'summary_large_image',
        title: 'YAML Validator & Formatter',
        description:
            'Validate, format, and convert YAML instantly. Detect errors with line/column info.',
        images: ['/og-image.jpg'],
    },
};

export default function YamlValidatorPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'YAML Validator',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Validate, format, and convert YAML data instantly. Detect syntax errors with precise line and column information.',
        featureList: [
            'Real-time YAML validation',
            'Format & beautify YAML',
            'Convert YAML to JSON',
            'Convert JSON to YAML',
            'Precise error location (line & column)',
            'Multi-document YAML support',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-20 pb-10 max-w-5xl text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-6">
                        YAML Validator
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Validate, format, and convert YAML in real-time.
                        <span className="text-gray-900"> Free, secure, and 100% client-side.</span>
                    </p>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 pb-10 max-w-5xl">
                <YamlValidatorClient />
            </section>

            {/* Educational Content */}
            <section className="bg-gray-50/50 border-t border-gray-100">
                <div className="container mx-auto px-4 py-20 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                What is a YAML Validator?
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                                <p>
                                    A{' '}
                                    <strong className="text-gray-900">YAML Validator</strong> checks
                                    your YAML (YAML Ain&apos;t Markup Language) files for syntax
                                    errors and structural issues before they reach production. Even a
                                    single indentation mistake can crash a CI/CD pipeline or
                                    misconfigure a Kubernetes deployment.
                                </p>
                                <p>
                                    This tool validates in real-time as you type, pinpoints the
                                    exact line and column of each error, formats your YAML with
                                    consistent indentation, and converts between YAML and JSON
                                    seamlessly.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Key Features
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    {
                                        title: 'Real-time Validation',
                                        desc: 'Instant syntax check as you type.',
                                    },
                                    {
                                        title: 'Error Location',
                                        desc: 'Precise line & column info for every error.',
                                    },
                                    {
                                        title: 'YAML → JSON',
                                        desc: 'Convert YAML to formatted JSON instantly.',
                                    },
                                    {
                                        title: 'JSON → YAML',
                                        desc: 'Convert JSON payloads to clean YAML.',
                                    },
                                    {
                                        title: 'Multi-document',
                                        desc: 'Supports multi-document YAML files (---).',
                                    },
                                    {
                                        title: '100% Private',
                                        desc: 'Everything runs in your browser. Nothing is sent to a server.',
                                    },
                                ].map((f, i) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                                    >
                                        <h3 className="font-bold text-gray-900 mb-1">
                                            {f.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {f.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
