import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import HttpStatusCodesClient from './client';

const slug = 'http-status-codes';

export const metadata: Metadata = {
    title: 'HTTP Status Codes Reference | Complete Guide - Xenkio',
    description:
        'Complete HTTP status codes reference with descriptions, use cases, and RFC specs. All 1xx, 2xx, 3xx, 4xx, 5xx status codes explained.',
    keywords: [
        'http status codes',
        '404 not found',
        '200 ok',
        '500 internal server error',
        'http response codes',
        'rest api status codes',
        '401 unauthorized',
        '403 forbidden',
        '301 redirect',
        'http error codes',
    ],
    openGraph: {
        title: 'HTTP Status Codes Reference | Xenkio Tools',
        description:
            'Complete reference for all HTTP status codes — 1xx, 2xx, 3xx, 4xx, 5xx with descriptions, use cases, and RFC specs.',
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

export default function HttpStatusCodesPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'HTTP Status Codes Reference',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            '1xx Informational status codes',
            '2xx Success status codes',
            '3xx Redirection status codes',
            '4xx Client error status codes',
            '5xx Server error status codes',
            'Search by code or name',
            'RFC specification references',
            'Real-world use cases',
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
                            HTTP Status Codes
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Complete reference for all HTTP response status codes. Search, filter by
                            class, and explore descriptions, use cases, and RFC specifications.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-6xl pb-16">
                <HttpStatusCodesClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                What Are HTTP Status Codes?
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">HTTP status codes</strong> are
                                    three-digit numbers returned by a web server in response to a
                                    client request, indicating whether the request was successful,
                                    redirected, or resulted in an error.
                                </p>
                                <p>
                                    They are grouped into five classes: 1xx (informational), 2xx
                                    (success), 3xx (redirection), 4xx (client errors), and 5xx
                                    (server errors).
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Why Status Codes Matter
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">For developers</strong>,
                                    understanding status codes is essential for building robust APIs,
                                    debugging network issues, and implementing proper error handling in
                                    applications.
                                </p>
                                <p>
                                    Status codes also play a role in SEO — search engines use them to
                                    understand whether a page has moved, been deleted, or is
                                    temporarily unavailable.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Status Code Classes
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    title: '1xx — Informational',
                                    desc: 'Request received, continuing process. Used for interim responses before the final response.',
                                },
                                {
                                    title: '2xx — Success',
                                    desc: 'Request was successfully received, understood, and accepted.',
                                },
                                {
                                    title: '3xx — Redirection',
                                    desc: 'Further action must be taken to complete the request, typically a redirect.',
                                },
                                {
                                    title: '4xx — Client Error',
                                    desc: 'Request contains bad syntax or cannot be fulfilled — the client made an error.',
                                },
                                {
                                    title: '5xx — Server Error',
                                    desc: 'Server failed to fulfil a valid request due to an error on its end.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-4 bg-white rounded-xl border border-gray-200"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1 font-mono text-sm">
                                        {item.title}
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
