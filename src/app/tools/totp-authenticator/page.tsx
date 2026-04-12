import { Metadata } from 'next';
import { TotpAuthenticatorClient } from './client';
import { ShieldCheck, Clock, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
    title: '2FA TOTP Authenticator | Generate Time-Based One-Time Passwords',
    description: 'Generate TOTP 2FA codes from your secret keys or QR codes. Supports SHA1, SHA256, SHA512 algorithms. 100% client-side.',
    keywords: ['totp', '2fa', 'two-factor authentication', 'authenticator', 'otp', 'time-based one-time password', 'google authenticator'],
    openGraph: {
        title: '2FA TOTP Authenticator | Free Online Tool',
        description: 'Generate TOTP 2FA codes securely in your browser. No server, no tracking.',
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

export default function TotpAuthenticatorPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: '2FA TOTP Authenticator',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Generate and manage TOTP 2FA codes from secret keys or QR codes. Supports SHA1/SHA256/SHA512 and 6/8 digit codes. All processing is done locally.',
        featureList: [
            'TOTP Code Generation',
            'QR Code Scanning',
            'Multiple Accounts',
            'SHA1 / SHA256 / SHA512 Support',
            '6 and 8 Digit Codes',
            'Export & Import Accounts',
            'Secure Client-Side Only',
        ],
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
                        2FA TOTP Authenticator
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
                        Generate time-based one-time passwords for your 2FA accounts.
                        <br className="hidden md:inline" /> All secrets are stored locally in your browser — never sent anywhere.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <TotpAuthenticatorClient />
            </section>

            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="space-y-16">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <ShieldCheck className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">100% Private</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your secret keys are stored only in your browser&apos;s localStorage and never transmitted to any server.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Clock className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Live Countdown</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Each code shows a real-time countdown bar so you always know when it expires and the next code generates.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <Smartphone className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">QR Code Support</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Import accounts by uploading, dragging, or pasting a QR code image from Google Authenticator, Authy, and more.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
                                    How TOTP Works
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Time-Based One-Time Passwords (TOTP) are generated using a shared secret key and the current time. Every 30 seconds, a new 6 or 8 digit code is produced using HMAC-SHA1 (or SHA256/SHA512). The server and your authenticator independently compute the same code, so no network communication is needed to verify it.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Supported Standards</h3>
                                    <ul className="space-y-3 text-gray-600 text-sm">
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>RFC 6238:</strong> TOTP standard used by Google Authenticator, Authy, and all major apps.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>otpauth:// URI:</strong> Standard format for QR codes and export/import interoperability.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <span><strong>Base32 secrets:</strong> The standard encoding for TOTP secret keys.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900">Algorithms Supported</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
                                        <div className="divide-y divide-gray-100 font-mono">
                                            <div className="p-3 text-gray-700 font-bold">SHA1 (default — most compatible)</div>
                                            <div className="p-3 text-gray-700 font-bold">SHA256 (more secure)</div>
                                            <div className="p-3 text-gray-700 font-bold">SHA512 (highest security)</div>
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
