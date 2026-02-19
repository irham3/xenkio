

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { InvoiceGeneratorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'invoice-generator';

export const metadata: Metadata = {
    title: 'Free Invoice Generator - Create Professional PDF Invoices Online',
    description: 'Generate professional invoices instantly with our free invoice generator. Add items, taxes, discounts, and download as PDF. No sign-up required.',
    keywords: ['invoice generator', 'free invoice maker', 'online invoice', 'pdf invoice generator', 'invoice template', 'create invoice online', 'professional invoice'],
    openGraph: {
        title: 'Free Invoice Generator | Xenkio',
        description: 'Create professional PDF invoices instantly with our free online invoice generator.',
        type: 'website',
    }
};

export default function InvoiceGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Invoice Generator",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Professional invoice templates",
            "Add multiple items/services",
            "Automatic tax calculation",
            "Discount support",
            "PDF download",
            "Multiple currencies"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <InvoiceGeneratorClient />
        </div>
    );
}
