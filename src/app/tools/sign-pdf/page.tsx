
import { Metadata } from 'next';
import SignPdfClient from './client';

export const metadata: Metadata = {
    title: 'Sign PDF | Free Online PDF Signature Tool',
    description: 'Sign PDF documents online for free. Draw your signature or upload an image and place it anywhere on your PDF. No registration required.',
    keywords: ['sign pdf', 'virtual signature', 'pdf signature', 'draw signature', 'free online pdf signer'],
    openGraph: {
        title: 'Sign PDF | Add Signature to PDF Online',
        description: 'Add legal signatures to your PDF documents instantly without software.',
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

export default function SignPdfPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Sign PDF",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Sign PDF documents directly in your browser. Secure, fast, and free.",
        "featureList": [
            "Draw signature",
            "Place signature anywhere",
            "Multi-page support",
            "Download signed PDF"
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Sign PDF Online
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Add your signature to PDF documents in seconds. Secure, private, and free.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 py-8 max-w-7xl">
                <SignPdfClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white py-16 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Easy PDF Signing</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Our PDF signing tool allows you to create a digital signature by drawing with your mouse or finger. Simply upload your PDF, create your signature, and drag it to the correct position.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Secure & Private</h2>
                            <p className="text-gray-600 leading-relaxed">
                                All processing happens in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
