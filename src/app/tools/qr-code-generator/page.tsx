import { Metadata } from 'next';
import { DUMMY_TOOLS } from '@/data/dummy-tools';
import { QrGeneratorClient } from './qr-generator-client';
import { notFound } from 'next/navigation';

const slug = 'qr-code-generator';

export const metadata: Metadata = {
    title: 'QR Code Generator - Create Custom QR Codes for Free',
    description: 'Create custom QR codes with logos, colors, and multiple export formats including PNG, SVG, and PDF. 100% free and secure.',
    openGraph: {
        title: 'QR Code Generator | Xenkio',
        description: 'Professional QR code generator with customization options.',
    }
};

export default function QrGeneratorPage() {
    const tool = DUMMY_TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <QrGeneratorClient />
        </div>
    );
}
