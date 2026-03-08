import { Metadata } from 'next';
import SqlFormatterClient from './client';

export const metadata: Metadata = {
    title: 'SQL Formatter & Beautifier | Free Online SQL Prettifier',
    description: 'Format, beautify, and clean up SQL queries instantly. Supports MySQL, PostgreSQL, SQLite, SQL Server, Oracle PL/SQL, and more. 100% client-side.',
    keywords: ['sql formatter', 'sql beautifier', 'format sql online', 'sql prettifier', 'mysql formatter', 'postgresql formatter', 'sql indent', 'sql query formatter'],
    openGraph: {
        title: 'SQL Formatter & Beautifier | Free Online Tool',
        description: 'Format and beautify SQL queries instantly with support for multiple dialects. 100% secure client-side processing.',
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
        description: 'Format and beautify SQL queries instantly with support for multiple SQL dialects.',
        images: ['/og-image.jpg'],
    },
};

export default function SqlFormatterPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "SQL Formatter",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Format, beautify, and clean up SQL queries instantly. Supports multiple SQL dialects.",
        "featureList": [
            "Format SQL queries",
            "Support for MySQL, PostgreSQL, SQLite, SQL Server, Oracle PL/SQL",
            "Customizable indentation and keyword case",
            "One-click copy and download",
            "100% client-side processing"
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
                        SQL Formatter
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Instantly format and beautify your SQL queries with support for multiple dialects.
                        <span className="text-gray-900"> Free, secure, and 100% client-side.</span>
                    </p>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 pb-10 max-w-5xl">
                <SqlFormatterClient />
            </section>

            {/* Educational Content */}
            <section className="bg-gray-50/50 border-t border-gray-100">
                <div className="container mx-auto px-4 py-20 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">What is a SQL Formatter?</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                                <p>
                                    A <strong className="text-gray-900">SQL Formatter</strong> is a developer tool that transforms compact or messy SQL queries into well-structured, readable code with consistent indentation and formatting.
                                </p>
                                <p>
                                    SQL is the standard language for managing relational databases. This tool helps you improve query readability, identify logic errors, and maintain coding standards across your team.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Key Features</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'Multiple Dialects', desc: 'MySQL, PostgreSQL, SQLite, SQL Server, and more.' },
                                    { title: 'Keyword Case', desc: 'UPPERCASE, lowercase, or preserve original case.' },
                                    { title: 'Custom Indentation', desc: 'Choose between spaces and tab width.' },
                                    { title: 'One-Click Copy', desc: 'Instantly copy formatted result to clipboard.' }
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
