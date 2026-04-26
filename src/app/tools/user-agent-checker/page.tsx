import { Metadata } from 'next';
import UserAgentCheckerClient from './client';

export const metadata: Metadata = {
    title: 'User Agent Checker — What Is My User Agent? | Xenkio',
    description: 'Instantly detect and parse your browser user agent string. Find browser name, version, OS, device type, rendering engine, and CPU architecture. Free online tool.',
    keywords: [
        'user agent checker',
        'what is my user agent',
        'browser user agent',
        'user agent parser',
        'detect browser',
        'browser detection',
        'user agent string',
        'browser version checker',
        'os detection',
        'device type checker',
    ],
    openGraph: {
        title: 'User Agent Checker — What Is My User Agent? | Xenkio',
        description: 'Instantly detect and parse your browser user agent. Free, private, no sign-up.',
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
    twitter: {
        card: 'summary_large_image',
        title: 'User Agent Checker — What Is My User Agent?',
        description: 'Detect browser, OS, device type, and engine from any user agent string.',
        images: ['/og-image.jpg'],
    },
};

export default function UserAgentCheckerPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'User Agent Checker',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Detect and parse browser user agent strings. Identify browser name, version, operating system, device type, rendering engine, and CPU architecture.',
        featureList: [
            'Auto-detect current browser user agent',
            'Browser name and version detection',
            'Operating system identification',
            'Device type (Desktop, Mobile, Tablet, Bot)',
            'Rendering engine detection',
            'CPU architecture detection',
            'Custom UA string parser',
            'One-click copy',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            User Agent Checker
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Instantly detect your browser, operating system, device type, and rendering engine
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-5xl">
                <UserAgentCheckerClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">What is a User Agent?</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    A <strong className="text-gray-800">user agent</strong> is a string sent
                                    by your browser to every web server it connects to. It identifies your
                                    browser, version, operating system, and rendering engine.
                                </p>
                                <p>
                                    Websites use this information to serve optimized content, apply
                                    browser-specific fixes, or redirect mobile users to a mobile-friendly version.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">User Agent Format</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    A typical user agent looks like:
                                </p>
                                <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono break-all text-gray-700">
                                    Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
                                </code>
                                <p>
                                    Each token identifies the platform, engine, and browser, often including
                                    compatibility tokens for legacy support.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Browser Compatibility</h3>
                                <p className="text-sm text-gray-600">
                                    Verify which browser and version is being used to debug rendering
                                    issues or test browser-specific CSS and JavaScript behavior.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Mobile Detection</h3>
                                <p className="text-sm text-gray-600">
                                    Determine if a visitor is on a mobile device, tablet, or desktop to
                                    serve appropriate layouts and redirect strategies.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Bot Identification</h3>
                                <p className="text-sm text-gray-600">
                                    Detect web crawlers, search engine bots, and scrapers by checking
                                    known bot signatures in the user agent string.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Web Scraping Debug</h3>
                                <p className="text-sm text-gray-600">
                                    Test custom user agent strings used in web scraping or automated
                                    testing tools to see how they are interpreted.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Security Analysis</h3>
                                <p className="text-sm text-gray-600">
                                    Inspect suspicious user agent strings from server logs to identify
                                    automated attacks, bots, or spoofed browsers.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">QA Testing</h3>
                                <p className="text-sm text-gray-600">
                                    Validate that your application correctly handles user agent overrides
                                    during cross-browser testing or device emulation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
