import { Metadata } from 'next';
import ComparePdfClient from './client';

export const metadata: Metadata = {
    title: 'Compare PDF Online Free — Visual Ghosting & Pixel Diff',
    description:
        'Compare two PDF files side-by-side with pixel-perfect accuracy. Visual ghosting overlay, red-glow pixel diff, and multi-page navigation. 100% browser-based — files never leave your device.',
    keywords: [
        'compare pdf',
        'pdf comparison',
        'diff pdf',
        'pdf changes',
        'compare pdf online',
        'pdf diff tool',
        'visual pdf compare',
        'pdf version compare',
        'contract compare',
        'document compare',
    ],
    openGraph: {
        title: 'Compare PDF Online Free | Xenkio',
        description:
            'Compare two PDF versions with visual ghosting overlay and pixel-level diff highlighting. Free, private, browser-based.',
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

export default function ComparePdfPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Compare PDF',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Compare two PDF files with visual ghosting overlay and pixel-level diff. Identify layout shifts, small-print changes, and edits instantly.',
        featureList: [
            'Visual Ghosting overlay with adjustable opacity',
            'Pixel-by-pixel red-glow diff view',
            'Side-by-side comparison',
            'Multi-page support',
            'Client-side processing — files never uploaded',
        ],
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-gray-100">
                <div className="container mx-auto px-4 py-16 md:py-20 max-w-5xl relative z-10">
                    <div className="text-center space-y-5 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Acrobat-level feature — for free
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                            Compare PDF Files
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Upload two versions of a document and instantly see every change.
                            Ghost overlay, pixel diff, side-by-side — all in your browser.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool */}
            <section className="container mx-auto px-4 max-w-6xl py-10">
                <ComparePdfClient />
            </section>

            {/* SEO Content */}
            <section className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Three ways to see the differences
                        </h2>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 text-xs font-bold">
                                    1
                                </div>
                                <span>
                                    <strong>Ghost Overlay:</strong> One PDF is blended on top of
                                    the other with adjustable opacity. Layout shifts and hidden
                                    small-print changes become visible instantly.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-error-100 flex items-center justify-center text-error-600 shrink-0 text-xs font-bold">
                                    2
                                </div>
                                <span>
                                    <strong>Pixel Diff:</strong> Changed pixels glow bright red.
                                    Unchanged regions are shown as greyscale context — precise
                                    to the pixel.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center text-success-600 shrink-0 text-xs font-bold">
                                    3
                                </div>
                                <span>
                                    <strong>Side by Side:</strong> Both pages rendered at the
                                    same scale, next to each other, for direct visual comparison.
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Private &amp; Secure by Design
                        </h2>
                        <div className="space-y-4 text-gray-600">
                            <p>
                                Unlike Acrobat or cloud services, every byte of your document
                                stays in your browser. Comparison happens entirely using
                                <span className="font-mono text-sm bg-gray-100 px-1 py-0.5 rounded mx-1 text-primary-600">
                                    WebAssembly
                                </span>
                                — no server, no upload, no account required.
                            </p>
                            <p>
                                Perfect for comparing contracts, legal agreements, financial
                                reports, or any sensitive document where privacy matters.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
