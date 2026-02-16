
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { JsonFormatterClient } from './client';


export const metadata: Metadata = {
    title: 'JSON Formatter & Validator - Convert Minified JSON to Pretty Print',
    description: 'Instantly format, validate, and minify your JSON data. Check syntax errors online for free. The best JSON formatter with dark mode.',
    keywords: ['json formatter', 'json validator', 'json beautiful', 'minify json', 'json pretty print', 'online code editor'],
    openGraph: {
        title: 'JSON Formatter | Xenkio',
        description: 'Format, validate, and minify JSON data instantly.',
        type: 'website',
    }
};

export default function JsonFormatterPage() {
    const tool = TOOLS.find(t => t.slug === 'json-formatter');

    if (!tool) {
        // Fallback if not found (e.g. while adding to tools.ts)
        // notFound();
    }

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
        "description": "Format, validate, and minify JSON data instantly.",
        "featureList": [
            "Pretty print JSON",
            "Minify JSON",
            "Syntax validation",
            "Load sample data",
            "Dark mode editor"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Header */}
            <div className="text-center mb-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    Developer Tools
                </div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150 relative z-10">
                    JSON Formatter
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 font-medium">
                    Validate, minify, and beautify your JSON data with our strict syntax checker.
                </p>
            </div>

            <JsonFormatterClient />
        </div>
    );
}
