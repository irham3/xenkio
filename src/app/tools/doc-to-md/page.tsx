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
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Feature UI (Client Component) */}
            <DocToMdClient title={tool.title} description={tool.description} />
        </div>
    );
}
