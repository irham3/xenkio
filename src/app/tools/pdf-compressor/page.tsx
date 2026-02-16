import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import { PDFCompressorClient } from './client';

const slug = 'pdf-compressor';



export const metadata: Metadata = {
    title: 'PDF Compressor - Reduce File Size Online | Xenkio',
    description: 'Compress PDF files online for free. Reduce the size of your PDF documents while maintaining quality. Secure browser-based processing with instant download.',
    keywords: ['compress pdf', 'reduce pdf size', 'online pdf compressor', 'shrink pdf', 'pdf optimizer'],
    openGraph: {
        title: 'PDF Compressor - Reduce File Size Online',
        description: 'Compress PDF files online for free. Reduce file size while maintaining quality. Secure, fast, and easy to use.',
        type: 'website',
    },
};

export default function PDFCompressorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PDF Compressor",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Three compression levels (Low, Medium, High)",
            "Significant file size reduction",
            "Browser-based processing for privacy",
            "Metadata removal option",
            "Progress tracking",
            "Instant download"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Tool Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            <PDFCompressorClient />

            {/* Info Section */}
            <div className="mt-16 border-t border-gray-200 pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            How PDF compression works
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-5">
                            PDF compression reduces file size by optimizing the internal structure of your document.
                            This includes removing redundant data, compressing images, and streamlining metadata
                            without affecting the visual quality of your content.
                        </p>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                <span>Structural optimization preserves text and vector quality</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                <span>All processing happens in your browser for privacy</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                <span>Three compression levels for different needs</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-5">Compression levels</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-semibold text-primary-600 shrink-0">
                                    L
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Low</h4>
                                    <p className="text-sm text-gray-500">Minimal compression, best for documents with high-quality images</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-semibold text-primary-600 shrink-0">
                                    M
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Medium</h4>
                                    <p className="text-sm text-gray-500">Balanced compression for email and web sharing</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-semibold text-primary-600 shrink-0">
                                    H
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">High</h4>
                                    <p className="text-sm text-gray-500">Maximum compression for archiving and storage</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
