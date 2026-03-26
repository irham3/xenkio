import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import DnsLookupClient from './client';

const slug = 'dns-lookup';

export const metadata: Metadata = {
    title: 'DNS Lookup — Query DNS Records Online | Xenkio',
    description: 'Look up DNS records for any domain instantly. Query A, AAAA, MX, TXT, CNAME, NS, SOA, and PTR records using Cloudflare DNS-over-HTTPS. Free, fast, and private.',
    keywords: [
        'dns lookup',
        'dns records',
        'dns checker',
        'dns query tool',
        'a record lookup',
        'mx record lookup',
        'txt record lookup',
        'cname lookup',
        'ns record lookup',
        'dns over https',
        'domain dns check',
        'dns propagation checker',
    ],
    openGraph: {
        title: 'DNS Lookup | Xenkio',
        description: 'Instantly query DNS records (A, AAAA, MX, TXT, CNAME, NS, SOA, PTR) for any domain. Free and private.',
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
        title: 'DNS Lookup — Query DNS Records Online',
        description: 'Instantly query DNS records for any domain. A, AAAA, MX, TXT, CNAME, NS, SOA, PTR. Free and private.',
        images: ['/og-image.jpg'],
    },
};

export default function DnsLookupPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'DNS Lookup',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Query A, AAAA, MX, TXT, CNAME, NS, SOA, and PTR records',
            'Real-time DNS lookup via Cloudflare DNS-over-HTTPS',
            'Display TTL (Time To Live) for each record',
            'One-click copy for any record value',
            'No installation or sign-up required',
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
                            DNS Lookup
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Query DNS records for any domain instantly — A, AAAA, MX, TXT, CNAME, NS, SOA, and PTR
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-5xl">
                <DnsLookupClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">What is a DNS Record?</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">DNS (Domain Name System)</strong> records
                                    map human-readable domain names to machine-readable addresses and other data.
                                    Every domain on the internet relies on DNS to function.
                                </p>
                                <p>
                                    When you visit a website, your browser performs a DNS lookup to translate the
                                    domain (e.g., <code className="bg-gray-100 px-1 rounded">example.com</code>)
                                    into an IP address that servers can understand.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Common DNS Record Types</h2>
                            <div className="space-y-2 text-sm text-gray-600">
                                {[
                                    { type: 'A', desc: 'Maps a domain to an IPv4 address' },
                                    { type: 'AAAA', desc: 'Maps a domain to an IPv6 address' },
                                    { type: 'MX', desc: 'Specifies mail servers for the domain' },
                                    { type: 'TXT', desc: 'Stores text data (SPF, DKIM, domain verification)' },
                                    { type: 'CNAME', desc: 'Alias pointing to another domain name' },
                                    { type: 'NS', desc: 'Identifies the authoritative name servers' },
                                ].map(({ type, desc }) => (
                                    <div key={type} className="flex items-baseline gap-2">
                                        <span className="inline-block font-bold font-mono text-primary-700 bg-primary-50 px-1.5 rounded text-xs shrink-0">
                                            {type}
                                        </span>
                                        <span>{desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Domain Verification</h3>
                                <p className="text-sm text-gray-600">
                                    Confirm TXT records for Google Search Console, domain ownership proofs,
                                    or SPF/DKIM email authentication.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Email Troubleshooting</h3>
                                <p className="text-sm text-gray-600">
                                    Check MX records to diagnose email delivery issues and verify mail server
                                    configuration.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">DNS Propagation</h3>
                                <p className="text-sm text-gray-600">
                                    Verify whether updated DNS records have propagated by checking the
                                    current values returned by Cloudflare DNS.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Security Audits</h3>
                                <p className="text-sm text-gray-600">
                                    Inspect NS records to identify the hosting provider and validate
                                    authoritative name server configuration.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">CDN Configuration</h3>
                                <p className="text-sm text-gray-600">
                                    Verify CNAME records pointing to CDN providers like Cloudflare,
                                    Fastly, or AWS CloudFront.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Reverse DNS Lookup</h3>
                                <p className="text-sm text-gray-600">
                                    Use PTR records to resolve an IP address back to its associated
                                    hostname for network diagnostics.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
