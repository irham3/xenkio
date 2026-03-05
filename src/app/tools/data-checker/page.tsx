import { Metadata } from 'next';
// Force rebuild for route recognition
import DataCheckerClient from './client';

export const metadata: Metadata = {
    title: 'Data Checker | Manual Data Validation Tool Online',
    description: 'Validate your CSV data manually row-by-row. Mark rows as valid or invalid, add comments, export results. Free browser-based data quality checker.',
    keywords: ['data checker', 'data validation', 'CSV checker', 'data quality', 'manual data check', 'validate data', 'data review tool', 'spreadsheet checker'],
    openGraph: {
        title: 'Data Checker | Manual Data Validation Tool',
        description: 'Validate CSV data manually row-by-row. Mark valid/invalid, add comments, and export results.',
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

export default function DataCheckerPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Data Checker",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Validate your data manually row-by-row. Mark valid/invalid, add comments, and export results as CSV.",
        "featureList": [
            "Manual row-by-row validation",
            "Mark rows as valid or invalid",
            "Add comments to rows",
            "CSV import & export",
            "Keyboard shortcuts for speed",
            "Progress tracking"
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
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Data Checker
                        </h1>
                        <p className="text-base text-gray-500 max-w-lg mx-auto">
                            Validate your data manually, row by row. Mark each entry as valid or invalid, add comments, and export your review.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-5xl">
                <DataCheckerClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Manual Data Validation</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Row-by-Row Review</strong> | Check each data entry
                                    individually, marking it as valid or invalid with a single click.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Keyboard Shortcuts</strong> | Speed through your data
                                    using keyboard shortcuts — V for valid, X for invalid, arrows to navigate.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Add Comments</strong> | Leave notes on problematic rows
                                    explaining what&apos;s wrong for your team or future reference.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Import & Export</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Multiple Formats</strong> | Import data from CSV,
                                    TSV, or any delimited format. Paste directly or upload a file.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Export Results</strong> | Download your review as a CSV
                                    file with status and comment columns appended to each row.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Progress Tracking</strong> | See your review progress
                                    at a glance with visual indicators showing how many rows you&apos;ve checked.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Use Cases</h3>
                        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-primary-600 mt-1">•</span>
                                Verify imported customer data before processing
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-600 mt-1">•</span>
                                Review survey responses for completeness
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-600 mt-1">•</span>
                                Check product listings for missing information
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-600 mt-1">•</span>
                                Validate employee records during audits
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-600 mt-1">•</span>
                                Review transaction data for anomalies
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-600 mt-1">•</span>
                                Quality check data migration results
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
