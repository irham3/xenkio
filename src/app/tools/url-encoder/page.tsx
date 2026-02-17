import { Metadata } from 'next';
import UrlEncoder from './client';

import { Link, Shield, Globe } from 'lucide-react';



export const metadata: Metadata = {
    title: 'URL Encoder / Decoder | Free Online Tool',
    description: 'Easily encode or decode URLs. Convert text to URL-safe format or decode encoded strings securely in your browser.',
    keywords: ['url encoder', 'url decoder', 'percent encoding', 'url escape', 'decode uri', 'web tools'],
    openGraph: {
        title: 'URL Encoder / Decoder | Free Online Tool',
        description: 'Secure, instant URL encoding and decoding directly in your browser.',
        type: 'website',
    }
};

export default function UrlEncoderPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "URL Encoder / Decoder",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Free online tool to encode and decode URLs (Percent-encoding). Converts special characters to URL-safe strings.",
        "featureList": [
            "URL Encoding (Percent-encoding)",
            "URL Decoding",
            "Secure client-side processing",
            "Real-time conversion"
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
                        URL Encoder / Decoder
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Convert text to URL-safe format (Percent-encoding) and back.
                        <br className="hidden md:inline" /> Secure client-side processing for developers and SEO professionals.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <UrlEncoder />
            </section>

            {/* Content Section */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="space-y-16">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Link className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Standard Compliant</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Adheres to RFC 3986 standards for URI Generic Syntax. Ensures your URLs work correctly across all browsers and servers.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Shield className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Client-Side Security</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    All processing happens locally in your browser immediately. Your data is never sent to our servers.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Globe className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Universal Compatibility</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Works perfectly for query parameters, API calls, and specialized character sets like emojis or non-Latin scripts.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900">Understanding URL Encoding</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    URL encoding, technically known as <strong>Percent-encoding</strong>, is a method to encode arbitrary data in a Uniform Resource Identifier (URI). This is essential because URLs can only be sent over the Internet using the US-ASCII character set.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Characters outside the ASCII set, as well as reserved characters (like <code>?</code>, <code>&</code>, <code>/</code>, <code>:</code>), must be converted into a valid ASCII format to be interpreted correctly by web servers. The encoding consists of a <code>%</code> symbol followed by the two-digit hexadecimal representation of the character&apos;s value.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">When to use it?</h3>
                                    <ul className="space-y-3 text-gray-600 text-sm">
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>Query Strings:</strong> When passing data in the URL (e.g., <code>?query=hello world</code> becomes <code>?query=hello%20world</code>).</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>Form Data:</strong> Browsers automatically encode form data before submission (application/x-www-form-urlencoded).</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>API Requests:</strong> Ensuring special characters in parameters don&apos;t break the endpoint structure.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Common Encodings</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
                                        <div className="grid grid-cols-2 bg-gray-50 p-3 font-semibold text-gray-700 border-b border-gray-200">
                                            <div>Character</div>
                                            <div>Encoded Value</div>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {[
                                                ['Space', '%20'],
                                                ['!', '%21'],
                                                ['"', '%22'],
                                                ['#', '%23'],
                                                ['$', '%24'],
                                                ['&', '%26'],
                                                ['+', '%2B'],
                                            ].map(([char, code]) => (
                                                <div key={code} className="grid grid-cols-2 p-3 text-gray-600">
                                                    <div>{char}</div>
                                                    <div className="font-mono text-primary-600">{code}</div>
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
