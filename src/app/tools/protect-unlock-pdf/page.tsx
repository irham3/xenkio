

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import { ProtectUnlockClient } from './client';

const slug = 'protect-unlock-pdf';

export const metadata: Metadata = {
    title: 'Protect & Unlock PDF - Encrypt or Decrypt PDF Files Online',
    description: 'Secure your PDF with passwords or remove restrictions instantly. Free online tool to protect and unlock PDF documents. Fast, private, and secure.',
    keywords: ['protect pdf', 'unlock pdf', 'encrypt pdf', 'decrypt pdf', 'pdf security', 'password protect pdf', 'remove pdf password'],
    openGraph: {
        title: 'Protect & Unlock PDF | Xenkio',
        description: 'Secure your PDF documents or remove passwords instantly. Free, private, and preserves quality.',
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

    }
};

export default function ProtectUnlockPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Protect & Unlock PDF",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Encrypt PDF",
            "Remove PDF Password",
            "Secure client-side processing"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header removed: handled by component */}

            <ProtectUnlockClient />
        </div>
    );
}
