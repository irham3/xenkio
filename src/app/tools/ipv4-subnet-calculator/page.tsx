import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/data/tools';
import Ipv4SubnetCalculatorClient from './client';

const slug = 'ipv4-subnet-calculator';

export const metadata: Metadata = {
    title: 'IPv4 Subnet Calculator | CIDR, Netmask, and Host Range Tool',
    description:
        'Calculate IPv4 subnets instantly. Convert CIDR to subnet mask, wildcard mask, network address, broadcast address, usable host range, and binary values.',
    keywords: [
        'ipv4 subnet calculator',
        'subnet calculator',
        'cidr calculator',
        'network address calculator',
        'broadcast address calculator',
        'subnet mask calculator',
        'wildcard mask calculator',
        'ip calculator',
        'host range calculator',
        'ipv4 cidr',
    ],
    openGraph: {
        title: 'IPv4 Subnet Calculator | Xenkio Tools',
        description:
            'Calculate CIDR, subnet mask, wildcard mask, network address, broadcast address, and usable IPv4 host ranges.',
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
        title: 'IPv4 Subnet Calculator | CIDR and Netmask Tool',
        description:
            'Calculate IPv4 network ranges, CIDR prefixes, subnet masks, wildcard masks, and usable hosts instantly.',
        images: ['/og-image.jpg'],
    },
};

export default function Ipv4SubnetCalculatorPage() {
    const tool = TOOLS.find((item) => item.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'IPv4 Subnet Calculator',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Convert CIDR prefix to subnet mask',
            'Calculate network and broadcast addresses',
            'Find first and last usable host addresses',
            'Calculate total and usable host counts',
            'Show wildcard masks for network rules',
            'Display binary IPv4 breakdowns',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <section className="bg-white">
                <div className="container mx-auto max-w-5xl px-4 pb-12 pt-16">
                    <div className="space-y-4 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                            {tool.title}
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            {tool.description}
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto max-w-6xl px-4 pb-16">
                <Ipv4SubnetCalculatorClient />
            </section>

            <section className="border-t border-gray-200 bg-gray-50">
                <div className="container mx-auto max-w-4xl px-4 py-16">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How IPv4 Subnetting Works
                            </h2>
                            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                                <p>
                                    IPv4 subnetting splits a 32-bit address into a network portion
                                    and a host portion. The CIDR prefix, such as /24, tells you how
                                    many bits identify the network.
                                </p>
                                <p>
                                    The subnet mask is the dotted-decimal version of that prefix.
                                    A /24 prefix becomes 255.255.255.0, leaving 8 host bits for
                                    addresses inside the subnet.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Common Network Planning Uses
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                                <li>Plan LAN, VLAN, VPC, and container network ranges</li>
                                <li>Check whether an address belongs inside a CIDR block</li>
                                <li>Calculate firewall wildcard masks and access rules</li>
                                <li>Find usable host ranges before assigning addresses</li>
                                <li>Compare /30, /31, and /32 point-to-point or host routes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
