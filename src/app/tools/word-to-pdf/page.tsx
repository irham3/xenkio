
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { WordToPdfClient } from './client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Word to PDF Converter - Convert DOCX to PDF Online Free | Xenkio',
    description: 'Convert Word documents (DOCX, DOC) to PDF professionally. Preserves layout, formatting, fonts, and images. Fast, secure, and private conversion.',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'doc to pdf', 'word converter', 'free pdf converter', 'online word to pdf'],
    openGraph: {
        title: 'Word to PDF Converter - Professional & Free | Xenkio',
        description: 'Convert Word files to PDF instantly. No file upload required - secure local processing.',
        type: 'website',
    }
};

export default function WordToPdfPage() {
    const tool = TOOLS.find(t => t.id === '4'); // ID 4 is Word to PDF in tools.ts

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Word to PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Convert DOCX to PDF",
            "Preserve layout",
            "Secure processing"
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
            <WordToPdfClient />
        </div>
    );
}
