import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import HttpStatusCheckerClient from './client';

const slug = 'http-status-checker';

export const metadata: Metadata = {
    title: 'HTTP Status Code Checker | Check URL Response & Headers - Xenkio',
    description:
        'Check the HTTP status code and response headers of any URL instantly. Detect redirects, content type, and response time for any website.',
    keywords: [
        'http status code checker',
        'check url status',
        'http response checker',
        'url status checker',
        'website status checker',
        'check http headers',
        'url response code',
        'check redirect',
        '404 checker',
        'website health check',
    ],
    openGraph: {
        title: 'HTTP Status Code Checker | Xenkio Tools',
        description:
            'Instantly check the HTTP status code and response headers of any URL. Detect 200 OK, 301 redirects, 404 errors, and more.',
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

export default function HttpStatusCheckerPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'HTTP Status Code Checker',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Check HTTP status code for any URL',
            'View response Content-Type',
            'Measure response time',
            'Detect URL redirects',
            'Supports HTTP and HTTPS',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-16 pb-12 max-w-6xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            HTTP Status Code Checker
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Enter any URL to instantly check its HTTP status code, content type,
                            response time, and whether it redirects.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-4xl pb-16">
                <HttpStatusCheckerClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                What Is an HTTP Status Code Checker?
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    An{' '}
                                    <strong className="text-gray-800">
                                        HTTP status code checker
                                    </strong>{' '}
                                    sends a request to a URL and reports the HTTP response code
                                    returned by the server - for example <code>200 OK</code>,{' '}
                                    <code>301 Moved Permanently</code>, or{' '}
                                    <code>404 Not Found</code>.
                                </p>
                                <p>
                                    It also reveals the{' '}
                                    <strong className="text-gray-800">Content-Type</strong>,{' '}
                                    <strong className="text-gray-800">response time</strong>, and
                                    the <strong className="text-gray-800">final URL</strong> after
                                    any redirects.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Why Check HTTP Status Codes?
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">For developers</strong>,
                                    verifying status codes is essential for debugging APIs, checking
                                    if pages are accessible, and confirming that redirects work
                                    correctly.
                                </p>
                                <p>
                                    For <strong className="text-gray-800">SEO</strong>, monitoring
                                    status codes helps ensure search engines can index your pages
                                    and that broken links (404s) or misconfigured redirects are
                                    quickly identified and fixed.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Common HTTP Status Codes
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    code: '200 OK',
                                    desc: 'The request succeeded. The resource was found and returned.',
                                    color: 'text-green-700',
                                    bg: 'bg-green-50',
                                    border: 'border-green-200',
                                },
                                {
                                    code: '301 Moved Permanently',
                                    desc: 'The URL has been permanently moved to a new location.',
                                    color: 'text-amber-700',
                                    bg: 'bg-amber-50',
                                    border: 'border-amber-200',
                                },
                                {
                                    code: '302 Found',
                                    desc: 'Temporary redirect - the resource is at a different URI.',
                                    color: 'text-amber-700',
                                    bg: 'bg-amber-50',
                                    border: 'border-amber-200',
                                },
                                {
                                    code: '404 Not Found',
                                    desc: 'The server cannot find the requested resource.',
                                    color: 'text-red-700',
                                    bg: 'bg-red-50',
                                    border: 'border-red-200',
                                },
                                {
                                    code: '403 Forbidden',
                                    desc: 'The client does not have permission to access the resource.',
                                    color: 'text-red-700',
                                    bg: 'bg-red-50',
                                    border: 'border-red-200',
                                },
                                {
                                    code: '500 Internal Server Error',
                                    desc: 'The server encountered an unexpected error.',
                                    color: 'text-purple-700',
                                    bg: 'bg-purple-50',
                                    border: 'border-purple-200',
                                },
                            ].map((item) => (
                                <div
                                    key={item.code}
                                    className={`p-4 rounded-xl border ${item.bg} ${item.border}`}
                                >
                                    <h3
                                        className={`font-semibold mb-1 font-mono text-sm ${item.color}`}
                                    >
                                        {item.code}
                                    </h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
