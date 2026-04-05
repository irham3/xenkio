import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import HtmlViewerClient from './client';

const slug = 'html-viewer';

export const metadata: Metadata = {
    title: 'HTML Viewer & Live Code Editor - Xenkio',
    description:
        'Paste HTML, CSS, and JavaScript code and see the live rendered result instantly. Manage multiple files, toggle between single and multi-file modes — all in your browser.',
    keywords: [
        'html viewer',
        'html preview',
        'live code editor',
        'html css js playground',
        'online html editor',
        'html renderer',
        'web code editor',
        'html live preview',
        'codepen alternative',
        'jsfiddle alternative',
        'browser code editor',
    ],
    openGraph: {
        title: 'HTML Viewer & Live Code Editor | Xenkio',
        description:
            'Paste HTML, CSS, and JavaScript and see the result instantly. Manage separate files or write everything in one document — runs entirely in your browser.',
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

export default function HtmlViewerPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'HTML Viewer & Live Code Editor',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Live HTML/CSS/JS preview in iframe',
            'Single-file mode (full HTML document)',
            'Multi-file mode (separate HTML, CSS, JS files)',
            'Add, rename, and delete files',
            'Horizontal and vertical split layout',
            'Auto-refresh and manual refresh modes',
            'Tab key support for code indentation',
            'State persistence with localStorage',
            '100% client-side — no data sent to server',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Tool Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    HTML Viewer
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Paste HTML, CSS, and JavaScript and see the rendered result instantly. Manage
                    separate files or combine everything in a single document.
                </p>
            </div>

            <HtmlViewerClient />
        </div>
    );
}
