import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import MatrixCalculatorClient from './client';

const slug = 'matrix-calculator';

export const metadata: Metadata = {
    title: 'Matrix Calculator - Xenkio',
    description:
        'Kalkulator matriks online: transpose, perkalian, invers, determinan, trace, rank, dan lebih banyak lagi. Mudah digunakan, proses di browser, tanpa perlu akun.',
    keywords: [
        'matrix calculator',
        'kalkulator matriks',
        'transpose matriks',
        'invers matriks',
        'determinan matriks',
        'perkalian matriks',
        'matrix inverse',
        'matrix multiplication',
        'matrix determinant',
        'matrix transpose online',
    ],
    openGraph: {
        title: 'Matrix Calculator | Xenkio',
        description:
            'Operasi matriks online: transpose, perkalian, invers, determinan, trace, rank, dan lainnya.',
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
            'Transpose matriks',
            'Perkalian matriks (A × B)',
            'Invers matriks',
            'Determinan matriks',
            'Penjumlahan & pengurangan matriks',
            'Perkalian skalar',
            'Trace & rank matriks',
            'Pangkat matriks',
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
                    Lakukan operasi matriks dengan mudah — transpose, perkalian, invers, determinan, dan lainnya.
                    Semua diproses di browser kamu, tanpa perlu upload data.
                </p>
            </div>

            <MatrixCalculatorClient />
        </div>
    );
}
