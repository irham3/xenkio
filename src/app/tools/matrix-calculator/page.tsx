import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import MatrixCalculatorClient from './client';

const slug = 'matrix-calculator';

export const metadata: Metadata = {
    title: 'Matrix Calculator - Xenkio',
    description:
        'Online matrix calculator: transpose, multiplication, inverse, determinant, trace, rank, and more. Easy to use, runs in browser, no account needed.',
    keywords: [
        'matrix calculator',
        'matrix calculator',
        'matrix transpose',
        'matrix inverse',
        'matrix determinant',
        'matrix multiplication',
        'matrix inverse',
        'matrix multiplication',
        'matrix determinant',
        'matrix transpose online',
    ],
    openGraph: {
        title: 'Matrix Calculator | Xenkio',
        description:
            'Online matrix operations: transpose, multiplication, inverse, determinant, trace, rank, and more.',
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

export default function MatrixCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Matrix Calculator',
        applicationCategory: 'EducationApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Matrix transpose',
            'Matrix multiplication (A × B)',
            'Matrix inverse',
            'Matrix determinant',
            'Matrix addition & subtraction',
            'Scalar multiplication',
            'Trace & matrix rank',
            'Matrix power',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Matrix Calculator
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Perform matrix operations with ease — transpose, multiplication, inverse, determinant, and more.
                    All processed in your browser, no data upload needed.
                </p>
            </div>

            <MatrixCalculatorClient />
        </div>
    );
}
