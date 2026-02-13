import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { ContrastCheckerClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'contrast-checker';

export const metadata: Metadata = {
    title: 'Contrast Checker - Check WCAG Color Contrast for Free',
    description: 'Check color contrast ratio for WCAG 2.1 accessibility compliance. Test AA and AAA levels for normal and large text. 100% free and secure.',
    openGraph: {
        title: 'Contrast Checker | Xenkio',
        description: 'WCAG color contrast checker for accessibility compliance.',
    }
};

export default function ContrastCheckerPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Contrast Checker",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "WCAG 2.1 contrast ratio calculation",
            "AA and AAA compliance checking",
            "Live text preview",
            "Accessible color suggestions",
            "Free to use"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
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
            <ContrastCheckerClient />
        </div>
    );
}
