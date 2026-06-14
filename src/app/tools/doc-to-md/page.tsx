import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import { DocToMdClient } from './client';

const slug = 'doc-to-md';

export const metadata: Metadata = {
    title: 'Document to Markdown Converter Online - Convert PDF, Word, Excel to MD',
    description: 'Convert PDF, Microsoft Word (DOCX), Excel (XLSX), PPTX and more to Markdown (MD) online. Free, private, and secure browser-based conversion without uploading files.',
    keywords: ['document to markdown', 'pdf to md', 'word to md', 'docx to markdown', 'excel to markdown', 'markdown converter'],
    openGraph: {
        title: 'Document to Markdown Converter | Xenkio',
        description: 'Convert any document to Markdown instantly. 100% private and runs securely in your browser.',
        type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Xenkio | Document to Markdown Converter',
          type: 'image/jpeg',
        },
      ],
    }
};

export default function DocToMdPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Document to Markdown",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Convert PDF to Markdown",
            "Convert Word to Markdown",
            "Convert Excel to Markdown",
            "Convert PPTX to Markdown",
            "100% Client-side conversion"
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
                <div className="mt-4 flex items-center justify-center">
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                        Powered by <a href="https://github.com/microsoft/markitdown" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">Microsoft MarkItDown</a>
                    </span>
                </div>
            </div>

            {/* Feature UI (Client Component) */}
            <DocToMdClient />
        </div>
    );
}
