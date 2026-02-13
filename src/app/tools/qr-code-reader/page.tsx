
import { Metadata } from 'next';
import QrReaderClient from './client';
import { ScanLine, Smartphone, Shield, Zap } from 'lucide-react';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'Free QR Code Reader Online | Scan QR from Image or Camera',
    description: 'Instantly scan and decode QR codes from your camera or uploaded images. Secure, fast, and works in your browser without any data leaving your device.',
    keywords: ['qr code reader', 'scan qr code online', 'qr code scanner', 'online qr scanner', 'read qr code from image', 'camera qr scanner'],
    openGraph: {
        title: 'Online QR Code Reader | Secure & Fast',
        description: 'Scan QR codes instantly. No download needed. Private and secure processing in-browser.',
        type: 'website',
    },
};

export default function QrReaderPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QR Code Reader Online",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Scan and decode QR codes instantly using your camera or by uploading images. Free online utility tool.",
        "featureList": [
            "Camera QR code scanning",
            "Upload QR image for decoding",
            "URL detection and navigation",
            "Local browser-based processing"
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white pt-16 pb-12">
                <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                        QR Code <span className="text-primary-600">Reader</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Quickly scan and decode any QR code. Use your device&apos;s camera for real-time scanning
                        or upload an image file from your computer.
                    </p>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <QrReaderClient />
            </section>

            {/* Feature Highlights */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <Smartphone className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">Mobile Ready</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Optimized for mobile browsers. Scan on the go using your smartphone&apos;s rear camera instantly.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <Shield className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">Privacy Secured</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                All processing happens locally. Your camera feed and images never reach our servers.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <Zap className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">Instant Results</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Fast decoding engine powered by jsQR. Get your data simplified and formatted in milliseconds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Content Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-16">
                        <div className="space-y-6 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                How to Scan a QR Code
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                Scanning is easy and doesn&apos;t require any app installation. Follow these simple steps
                                to decode your information.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 pt-8">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">1</div>
                                <h3 className="text-xl font-bold text-gray-900">Choose your mode</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Click on &quot;Scan with Camera&quot; for live scanning using your device camera, or
                                    &quot;Upload Image&quot; if you have a QR code saved as a file or screenshot.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">2</div>
                                <h3 className="text-xl font-bold text-gray-900">Scan & Decode</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Position the code in the camera frame or select your image file. Our engine will
                                    automatically detect and decode the content.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">3</div>
                                <h3 className="text-xl font-bold text-gray-900">Copy or Open</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Review the decoded text. If it&apos;s a URL, you can open it directly in a new tab.
                                    Otherwise, you can copy the data to your clipboard.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">4</div>
                                <h3 className="text-xl font-bold text-gray-900">Safe & Private</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Refresh the page or click &quot;Scan Another&quot; to clear the current result and start
                                    a new scan. Your data remains only in your session.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

