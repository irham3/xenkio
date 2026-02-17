import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import TextEncryptorClient from './client';
import { notFound } from 'next/navigation';

const slug = 'text-encryptor';

export const metadata: Metadata = {
    title: 'Text Encryptor - Secure AES, DES, Rabbit, RC4 Encryption',
    description: 'Encrypt and decrypt text securely using AES, DES, Rabbit, RC4, and other algorithms. Client-side processing ensures your data never leaves your browser.',
    openGraph: {
        title: 'Text Encryptor | Xenkio',
        description: 'Secure text encryption tool supporting multiple algorithms.',
    }
};

export default async function TextEncryptorPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Text Encryptor",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "AES Encryption",
            "DES Encryption",
            "Rabbit Stream Cipher",
            "RC4 Encryption",
            "RC4Drop Support",
            "Client-side processing"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature Component */}
            <TextEncryptorClient />
        </div>
    );
}
