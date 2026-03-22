import { Metadata } from 'next';
import MyIpAddressClient from './client';

export const metadata: Metadata = {
    title: 'My IP Address — What Is My IP? | Xenkio',
    description: 'Instantly find out your public IP address, geolocation, ISP, timezone, and hostname. Free online tool — no sign-up required.',
    keywords: [
        'what is my ip',
        'my ip address',
        'public ip address',
        'ip lookup',
        'ip geolocation',
        'find my ip',
        'ip address checker',
        'my ip location',
        'ip address tool',
        'isp lookup',
    ],
    openGraph: {
        title: 'My IP Address — What Is My IP? | Xenkio',
        description: 'Instantly find your public IP address, geolocation, ISP, and timezone. Free, private, no sign-up.',
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
        title: 'My IP Address — What Is My IP?',
        description: 'Instantly find your public IP address, ISP, geolocation, and timezone online.',
        images: ['/og-image.jpg'],
    },
};

export default function MyIpAddressPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'My IP Address',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Find your public IP address, geolocation (city, region, country), ISP, hostname, and timezone instantly.',
        featureList: [
            'Public IP address detection',
            'Geolocation (city, region, country)',
            'ISP and ASN lookup',
            'Hostname resolution',
            'Timezone detection',
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
                            My IP Address
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Instantly detect your public IP address, location, ISP, and network details
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-5xl">
                <MyIpAddressClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">What is a Public IP Address?</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    A <strong className="text-gray-800">public IP address</strong> is a globally
                                    unique address assigned to your device (or router) by your Internet Service
                                    Provider (ISP). It is visible to any server you connect to on the internet.
                                </p>
                                <p>
                                    Unlike a private IP address (e.g., <code className="bg-gray-100 px-1 rounded">192.168.1.1</code>)
                                    used within your local network, your public IP is how websites and services
                                    identify and communicate with your connection.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">IPv4 vs IPv6</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">IPv4</strong> uses a 32-bit address format
                                    (e.g., <code className="bg-gray-100 px-1 rounded">203.0.113.45</code>) and
                                    supports around 4.3 billion addresses — nearly exhausted globally.
                                </p>
                                <p>
                                    <strong className="text-gray-800">IPv6</strong> uses a 128-bit format
                                    (e.g., <code className="bg-gray-100 px-1 rounded">2001:db8::1</code>),
                                    providing an astronomically large address space to support the growing internet.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Remote Access</h3>
                                <p className="text-sm text-gray-600">
                                    Configure firewalls or allow-lists using your current public IP to access
                                    servers, databases, or VPNs remotely.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Network Debugging</h3>
                                <p className="text-sm text-gray-600">
                                    Verify your IP when troubleshooting connectivity issues, DNS resolution,
                                    or VPN tunnels.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Security Checks</h3>
                                <p className="text-sm text-gray-600">
                                    Check whether your real IP is exposed or properly masked when using a
                                    VPN or proxy.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Geolocation Verification</h3>
                                <p className="text-sm text-gray-600">
                                    Confirm the country and region reported by your connection — useful for
                                    region-locked content and compliance.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">ISP Identification</h3>
                                <p className="text-sm text-gray-600">
                                    Identify your Internet Service Provider and Autonomous System Number (ASN)
                                    for network planning.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Dynamic DNS</h3>
                                <p className="text-sm text-gray-600">
                                    Update dynamic DNS records by quickly checking your current IP whenever
                                    your ISP reassigns your address.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
