import { Metadata } from 'next';
import { JwtTool } from '../../../features/jwt-decoder/components/jwt-decoder';
import { Shield, Code, Lock } from 'lucide-react';



export const metadata: Metadata = {
    title: 'JWT Encoder & Decoder | Free Online Tool',
    description: 'Create signed JWT tokens or decode them to inspect claims. Secure, client-side processing.',
    keywords: ['jwt encoder', 'jwt decoder', 'create jwt', 'sign jwt', 'debug jwt', 'json web token'],
    openGraph: {
        title: 'JWT Encoder & Decoder | Free Online Tool',
        description: 'Generate and verify JWTs instantly in your browser.',
        type: 'website',
    }
};

export default function JwtPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JWT Encoder & Decoder",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Free tool to encode (sign) and decode JSON Web Tokens. Supports HS256 algorithm and custom payloads.",
        "featureList": [
            "JWT Encoding/Signing",
            "JWT Decoding",
            "HS256 Algorithm Support",
            "Formatted JSON Output",
            "Client-Side Only Processing"
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <section className="bg-white pt-16 pb-12">
                <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                        JWT Encoder & Decoder
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Create signed JSON Web Tokens or decode existing ones to inspect claims.
                        <br className="hidden md:inline" /> Secure client-side processing for developers.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <JwtTool />
            </section>

            {/* Content Section */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="space-y-16">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Lock className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Sign & Verify</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Generate valid, signed tokens (HS256) for testing API authentication flows.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Code className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Inspect Claims</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Decode headers and payloads to debug token contents. formatted JSON output.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Shield className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Local Processing</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your secrets and tokens never leave your browser. Zero server-side transmission.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900">What is a JWT?</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Structure of a JWT</h3>
                                    <ul className="space-y-3 text-gray-600 text-sm">
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                            <span><strong>Header:</strong> Algorithm & token type (e.g., HS256, JWT)</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                                            <span><strong>Payload:</strong> Data/Claims (e.g., user ID, expiry, roles)</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                            <span><strong>Signature:</strong> Verification hash to ensure integrity</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Common Claims</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
                                        <div className="divide-y divide-gray-100">
                                            {[
                                                ['iss', 'Issuer - Who created the token'],
                                                ['sub', 'Subject - Whom the token refers to'],
                                                ['aud', 'Audience - Who is the intended recipient'],
                                                ['exp', 'Expiration Time - When the token dies'],
                                                ['iat', 'Issued At - When the token was created'],
                                            ].map(([claim, desc]) => (
                                                <div key={claim} className="grid grid-cols-[60px_1fr] p-3 text-gray-600">
                                                    <div className="font-mono font-bold text-primary-600">{claim}</div>
                                                    <div>{desc}</div>
                                                </div>
                                            ))}
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
