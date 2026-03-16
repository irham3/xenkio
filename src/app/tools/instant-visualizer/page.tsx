import { Metadata } from 'next';
import InstantVisualizerClient from './client';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Instant Visualizer | Quick Data Dashboard from Pasted Data',
    description: 'Paste tabular data from Excel or CSV and instantly get interactive charts, KPI cards, and data insights — no setup needed.',
    keywords: [
        'instant visualizer',
        'data dashboard',
        'quick data analysis',
        'paste data chart',
        'CSV visualizer',
        'excel to chart',
        'data visualization tool',
        'online data analysis',
    ],
    openGraph: {
        title: 'Instant Visualizer | Paste Data → Get Dashboard',
        description: 'Turn any spreadsheet data into an interactive dashboard in seconds. Free, private, and runs entirely in your browser.',
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

export default function InstantVisualizerPage(): React.ReactElement {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Instant Visualizer",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Paste tabular data and instantly get interactive charts, KPI cards, and data insights.",
        "featureList": [
            "Auto-detect columns (date, numeric, categorical)",
            "Smart chart recommendation (line, bar, area, pie)",
            "Interactive KPI cards with summary statistics",
            "Sortable data table preview",
            "100% Client-side processing (Privacy focused)"
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12 max-w-7xl">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full text-xs font-medium text-primary-600 mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            100% Secure Client-Side Processing
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Instant Visualizer
                        </h1>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Paste your data from Excel or CSV and get an interactive dashboard instantly.
                            Auto-detects column types and generates the best charts for your data.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-7xl mt-8">
                <InstantVisualizerClient />
            </section>
        </div>
    );
}
