import { Metadata } from 'next';
import JsonFormatterClient from './client';
import { Braces } from 'lucide-react';

export const metadata: Metadata = {
    title: 'JSON Formatter & Validator | Free Online JSON Beautifier',
    description: 'Format, beautify, and validate JSON data instantly. Free online tool with syntax validation, custom indentation, and key sorting. 100% client-side.',
    keywords: ['json formatter', 'json beautifier', 'json validator', 'format json online', 'beautify json', 'json minifier', 'json prettifier', 'validate json'],
    openGraph: {
        title: 'JSON Formatter & Validator | Free Online Tool',
        description: 'Format, beautify, and validate JSON data instantly with customizable options. 100% secure client-side processing.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JSON Formatter & Validator',
        description: 'Format and beautify JSON data instantly with customizable indentation options.',
    },
};

export default function JsonFormatterPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JSON Formatter",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Format, beautify, and validate JSON data instantly. Free online tool with customizable indentation.",
        "featureList": [
            "Beautify JSON",
            "Minify JSON",
            "Validate JSON",
            "Sort JSON keys",
            "Custom indentation"
        ]
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
                        JSON Formatter
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Instantly format, validate, and minify your JSON data with industry standards.
                        <span className="text-gray-900"> Free, secure, and 100% client-side.</span>
                    </p>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 pb-10 max-w-5xl">
                <JsonFormatterClient />
            </section>

            {/* Educational Content */}
            <section className="bg-gray-50/50 border-t border-gray-100">
                <div className="container mx-auto px-4 py-20 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">What is a JSON Formatter?</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                                <p>
                                    A <strong className="text-gray-900">JSON Formatter</strong> is an essential developer tool that transforms compact, raw JSON (JavaScript Object Notation) data into a readable, structured format with proper indentation and nesting.
                                </p>
                                <p>
                                    JSON is widely used in API integrations and modern web applications. This tool helps you instantly identify syntax errors, validate structure, and debug data relationships efficiently.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Key Features</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'Live Validation', desc: 'Automatic syntax checking as you type.' },
                                    { title: 'Custom Spacing', desc: 'Adjust indentation (2, 4, or 8 spaces).' },
                                    { title: 'Auto-Sort Keys', desc: 'Alphabetically sort JSON keys.' },
                                    { title: 'One-Click Copy', desc: 'Instantly copy result to clipboard.' }
                                ].map((f, i) => (
                                    <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{f.desc}</p>
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
