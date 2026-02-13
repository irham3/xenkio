import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { GradientGeneratorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'gradient-generator';

export const metadata: Metadata = {
    title: 'Gradient Generator - Create Beautiful CSS Gradients for Free',
    description: 'Create stunning linear, radial, and conic CSS gradients with a visual editor. Copy CSS code, download as PNG. 100% free and secure.',
    openGraph: {
        title: 'Gradient Generator | Xenkio',
        description: 'Visual CSS gradient generator with presets, live preview, and code export.',
    }
};

export default function GradientGeneratorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Gradient Generator",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Linear, radial, and conic gradients",
            "Multiple color stops",
            "Beautiful presets",
            "CSS and Tailwind export",
            "Download as PNG",
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
            <GradientGeneratorClient />
        </div>
    );
}
