

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { MarkdownEditorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'markdown-editor';

export const metadata: Metadata = {
    title: 'Markdown Editor Online Free - Live Preview & Export | Xenkio',
    description: 'Edit and preview Markdown with live rendering. GitHub Flavored Markdown support, export to HTML or MD. Free online markdown editor with split view.',
    keywords: ['markdown editor', 'markdown preview', 'markdown to html', 'gfm', 'github flavored markdown', 'online markdown', 'markdown converter', 'free markdown editor'],
    openGraph: {
        title: 'Markdown Editor Online Free | Xenkio',
        description: 'Edit and preview Markdown with live rendering. Export to HTML or MD instantly.',
        type: 'website',
    }
};

export default function MarkdownEditorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Markdown Editor",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Live markdown preview",
            "GitHub Flavored Markdown support",
            "Export to HTML and Markdown",
            "Split view editing",
            "Word and character count",
            "Syntax highlighting"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <MarkdownEditorClient />
        </div>
    );
}
