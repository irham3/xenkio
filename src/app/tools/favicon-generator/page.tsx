

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import { FaviconGeneratorClient } from './client';

const slug = 'favicon-generator';

export const metadata: Metadata = {
    title: 'Favicon Generator - Create Website Icons (ICO, PNG) Online Free',
    description: 'Free online favicon generator. Convert any image to favicon.ico, Apple touch icons, and Android chrome icons instantly. Customize radius and padding.',
    openGraph: {
        title: 'Favicon Generator | Xenkio',
        description: 'Create professional favicons for your website from any image instantly.',
    }
};

export default function FaviconGeneratorPage() {
    const tool = TOOLS.find(t => t.href.includes(slug));

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Favicon Generator",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Convert PNG/JPG/SVG to ICO",
            "Generate Apple Touch Icons",
            "Generate Android Chrome Icons",
            "Custom border radius and padding",
            "Download full set as ZIP",
            "Secure client-side generation"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12 animate-slide-up">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    {tool.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {tool.description}
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <FaviconGeneratorClient />
        </div>
    );
}
