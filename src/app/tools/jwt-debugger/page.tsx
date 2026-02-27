import { Metadata } from 'next';
import { JwtDebuggerClient } from './client';
import { Shield, Code, Lock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'JWT Debugger | Verify, Decode & Sign JSON Web Tokens',
    description: 'A professional tool to decode, verify, and sign JSON Web Tokens (JWT). Supports HS256 algorithm and signature verification. 100% client-side.',
    keywords: ['jwt debugger', 'jwt verifier', 'jwt sign', 'decode jwt', 'json web token', 'hs256'],
    openGraph: {
        title: 'JWT Debugger | Free Online Developer Tool',
        description: 'Instantly decode, verify signature, and sign JWTs in your browser.',
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

export default function JwtDebuggerPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JWT Debugger",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Professional tool to encode (sign), decode, and verify JSON Web Tokens. Supports signature verification with secret keys.",
        "featureList": [
            "JWT Signature Verification",
            "JWT Encoding/Signing",
            "JWT Decoding",
            "HS256/384/512 Support",
            "Formatted JSON Output",
            "Secure Client-Side Processing"
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <section className="bg-white pt-16 pb-12">
                <div className="container mx-auto px-4 max-w-5xl text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight">
                        JWT Debugger
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
                        Verify signature, inspect claims, and sign JSON Web Tokens securely.
                        <br className="hidden md:inline" /> All processing is done locally in your browser.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <JwtDebuggerClient />
            </section>

            {/* Content Section */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="space-y-16">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Shield className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Verify Integrity</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Instantly check if a token has been tampered with by verifying its signature against a secret.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Code className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Deep Inspection</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Decode headers and payload sections to see raw claims and metadata in a structured format.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Lock className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Secure Signing</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Create new tokens for testing using standard algorithms like HS256 with zero server tracking.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Understanding JWT Verification</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    The signature part of a JWT (the third part of the string) is what makes it secure. It is created by hashing the header and payload with a secret key. If even a single character in the payload is changed, the signature will no longer match, allowing the receiver to reject the token.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Verification Steps</h3>
                                    <ul className="space-y-3 text-gray-600 text-sm">
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>Decode:</strong> Extract header and claims to read data.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>Verify:</strong> Re-hash the data with the secret key.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>Compare:</strong> Ensure the generated hash matches the signature.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Algorithms Supported</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
                                        <div className="divide-y divide-gray-100 font-mono">
                                            <div className="p-3 text-gray-700 font-bold">HS256 (HMAC + SHA-256)</div>
                                            <div className="p-3 text-gray-700 font-bold">HS384 (HMAC + SHA-384)</div>
                                            <div className="p-3 text-gray-700 font-bold">HS512 (HMAC + SHA-512)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
