

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import { PdfToWordClient } from './client';

const slug = 'pdf-to-word';

export const metadata: Metadata = {
    title: 'PDF to Word Converter Online Free 2025 - Convert PDF to Editable DOCX',
    description: 'Convert PDF to Word documents online for free. Preserve text formatting, headings, and paragraph structure. Fast, private, browser-based conversion.',
    keywords: ['pdf to word', 'convert pdf to docx', 'pdf converter', 'pdf to word online', 'free pdf converter', 'pdf to editable word', '2025'],
    openGraph: {
        title: 'PDF to Word Converter | Xenkio',
        description: 'Convert PDF documents to editable Microsoft Word files instantly. Free, private, and preserves formatting.',
        type: 'website',
    }
};

export default function PdfToWordPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PDF to Word",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Convert PDF to DOCX",
            "Preserve formatting",
            "Client-side conversion"
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
            <PdfToWordClient />
        </div>
    );
}
