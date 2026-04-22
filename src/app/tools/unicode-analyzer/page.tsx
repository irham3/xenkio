import { Metadata } from 'next';
import UnicodeAnalyzerClient from './client';

export const metadata: Metadata = {
    title: 'Unicode Analyzer | Inspect Code Points, UTF-8, Categories Online',
    description: 'Analyze any text character by character. View Unicode code points (U+XXXX), UTF-8 bytes, character categories, blocks, and normalization forms. 100% client-side, no data sent.',
    keywords: ['unicode analyzer', 'unicode inspector', 'code point viewer', 'utf-8 bytes', 'unicode categories', 'text normalization', 'unicode blocks', 'character analysis'],
    openGraph: {
        title: 'Unicode Analyzer | Inspect Code Points, UTF-8, Categories Online',
        description: 'Analyze any text character by character. View Unicode code points, UTF-8 bytes, categories, and normalization forms.',
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

export default function UnicodeAnalyzerPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Unicode Analyzer',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Analyze any text character by character. View Unicode code points, UTF-8 bytes, character categories, blocks, and normalization forms.',
        featureList: [
            'Unicode code point inspection',
            'UTF-8 and UTF-16 byte breakdown',
            'Character category detection',
            'Unicode block identification',
            'Text normalization (NFC/NFD/NFKC/NFKD)',
            'Invisible and special character detection',
            'Code point list export',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Unicode Analyzer
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Inspect every character — code points, UTF-8 bytes, categories, and normalization
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool */}
            <section className="container mx-auto px-4 max-w-5xl">
                <UnicodeAnalyzerClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Character-Level Inspection</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Code Points</strong> | Every character
                                    in Unicode is assigned a unique number (code point) expressed as U+XXXX.
                                    This tool reveals the code point for each character in your text.
                                </p>
                                <p>
                                    <strong className="text-gray-800">UTF-8 Encoding</strong> | See the exact
                                    byte sequence used to encode each character in UTF-8 — the most common
                                    encoding on the web. ASCII characters use 1 byte; emoji and CJK use 3–4.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Invisible Characters</strong> | Detect
                                    zero-width spaces, non-breaking spaces, directional overrides, and other
                                    invisible characters that can cause unexpected bugs or security issues.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Unicode Normalization</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">NFC (Canonical Composition)</strong> | The
                                    recommended form for web and storage. Combines base characters and combining
                                    marks into precomposed forms (e.g., é as one code point).
                                </p>
                                <p>
                                    <strong className="text-gray-800">NFD (Canonical Decomposition)</strong> | Splits
                                    precomposed characters into base + combining marks. Useful for processing
                                    individual components of accented letters.
                                </p>
                                <p>
                                    <strong className="text-gray-800">NFKC / NFKD</strong> | Compatibility
                                    normalization replaces stylistic variants (ﬁ → fi, ① → 1) and fullwidth
                                    forms. Essential for text comparison and search normalization.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
