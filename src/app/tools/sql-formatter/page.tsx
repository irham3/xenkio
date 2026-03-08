import { Metadata } from 'next';
import SqlFormatterClient from './client';

export const metadata: Metadata = {
    title: 'SQL Formatter & Beautifier | Free Online SQL Prettifier',
    description:
        'Format, beautify, and minify SQL queries instantly. Free online tool supporting SELECT, INSERT, UPDATE, DELETE, JOIN, CTEs and more. 100% client-side.',
    keywords: [
        'sql formatter',
        'sql beautifier',
        'sql prettifier',
        'format sql online',
        'beautify sql',
        'sql minifier',
        'sql query formatter',
        'sql code formatter',
        'online sql tool',
    ],
    openGraph: {
        title: 'SQL Formatter & Beautifier | Free Online Tool',
        description:
            'Format, beautify, and minify SQL queries instantly with customizable options. 100% secure client-side processing.',
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
        title: 'SQL Formatter & Beautifier',
        description: 'Format and beautify SQL queries instantly with customizable indentation options.',
        images: ['/og-image.jpg'],
    },
};

export default function SqlFormatterPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SQL Formatter',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Format, beautify, and minify SQL queries instantly. Free online tool with customizable keyword case and indentation.',
        featureList: [
            'Beautify SQL',
            'Minify SQL',
            'Validate SQL parentheses',
            'Keyword case control (UPPER / lower / preserve)',
            'Custom indentation (spaces or tabs)',
            'Download formatted SQL',
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
                <div className="container mx-auto px-4 pt-20 pb-10 max-w-5xl text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-6">
                        SQL Formatter
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Instantly format, validate, and minify your SQL queries with industry standards.
                        <span className="text-gray-900"> Free, secure, and 100% client-side.</span>
                    </p>
                </div>
            </section>

            {/* Tool */}
            <section className="container mx-auto px-4 pb-10 max-w-5xl">
                <SqlFormatterClient />
            </section>

            {/* Educational content */}
            <section className="bg-gray-50/50 border-t border-gray-100">
                <div className="container mx-auto px-4 py-20 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                What is a SQL Formatter?
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                                <p>
                                    A <strong className="text-gray-900">SQL Formatter</strong> transforms dense,
                                    unreadable SQL into clean, well-structured code with consistent indentation,
                                    proper line breaks, and consistent keyword casing.
                                </p>
                                <p>
                                    Whether you are debugging a complex query, reviewing a pull request, or
                                    documenting your database schema, a well-formatted SQL query is far easier
                                    to read and maintain.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Key Features</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'Button-Triggered', desc: 'Format runs only when you click — no surprise edits.' },
                                    { title: 'Keyword Casing', desc: 'Choose UPPER, lower, or preserve original case.' },
                                    { title: 'Flexible Indent', desc: 'Pick 2, 4, or 8 spaces — or use tabs.' },
                                    { title: 'SQL Minifier', desc: 'Strip all whitespace for production use.' },
                                    { title: 'One-Click Copy', desc: 'Instantly copy the result to clipboard.' },
                                    { title: 'Download as .sql', desc: 'Save the formatted query directly.' },
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
