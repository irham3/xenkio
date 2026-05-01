import { Metadata } from 'next';
import IPv4SubnetCalculatorClient from './client';

export const metadata: Metadata = {
  title: 'IPv4 Subnet Calculator | CIDR Network Calculator Online',
  description:
    'Calculate IPv4 subnets instantly. Enter an IP address and CIDR prefix to get network address, broadcast, subnet mask, wildcard, usable hosts, and binary breakdown. Free online tool.',
  keywords: [
    'ipv4 subnet calculator',
    'cidr calculator',
    'subnet mask calculator',
    'network address calculator',
    'ip subnet calculator',
    'cidr subnet calculator',
    'broadcast address calculator',
    'wildcard mask calculator',
    'network calculator',
    'ip address subnet',
    'subnetting tool',
    'cidr notation',
  ],
  openGraph: {
    title: 'IPv4 Subnet Calculator | CIDR Network Calculator',
    description:
      'Calculate IPv4 subnet details instantly — network address, broadcast, subnet mask, wildcard mask, host ranges, and binary visualization.',
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
    title: 'IPv4 Subnet Calculator | CIDR Network Calculator',
    description:
      'Calculate IPv4 subnets online. Enter IP + CIDR prefix and get network address, broadcast, host range, binary breakdown instantly.',
    images: ['/og-image.jpg'],
  },
};

export default function IPv4SubnetCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'IPv4 Subnet Calculator',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Calculate IPv4 subnet details: network address, broadcast address, subnet mask, wildcard mask, usable host ranges, and binary representation.',
    featureList: [
      'CIDR notation input',
      'Subnet mask input mode',
      'Network and broadcast address calculation',
      'First and last usable host',
      'Usable and total host count',
      'Binary visualization with network/host bit coloring',
      'CIDR reference table',
      'One-click copy for all values',
      'IP class and type detection',
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
              IPv4 Subnet Calculator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter an IP address and CIDR prefix to instantly calculate network address, broadcast,
              host ranges, subnet mask, and binary breakdown
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-3xl">
        <IPv4SubnetCalculatorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is CIDR Notation?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">CIDR</strong> (Classless Inter-Domain Routing)
                  notation represents an IP address and its associated network prefix. For example,{' '}
                  <code className="bg-gray-100 px-1 rounded">192.168.1.0/24</code> means the first
                  24 bits are the network portion, leaving 8 bits for host addresses.
                </p>
                <p>
                  A <strong className="text-gray-800">/24</strong> network has 256 total addresses
                  (2⁸), with 254 usable hosts — the network address and broadcast address are
                  reserved.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Subnet Mask vs Wildcard Mask</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  A <strong className="text-gray-800">subnet mask</strong> (e.g.{' '}
                  <code className="bg-gray-100 px-1 rounded">255.255.255.0</code>) has all network
                  bits set to 1 and all host bits set to 0. It is used to identify the network
                  portion of an IP address.
                </p>
                <p>
                  A <strong className="text-gray-800">wildcard mask</strong> is the bitwise inverse
                  of the subnet mask. It is used in ACLs and routing protocols like OSPF to specify
                  which bits of an IP address must match.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Common Subnetting Use Cases</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Home Network (/24)</h3>
                <p className="text-sm text-gray-600">
                  The most common home and small office subnet. Provides 254 usable addresses — more
                  than enough for any household.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Data Centre VLAN (/26 – /28)</h3>
                <p className="text-sm text-gray-600">
                  Smaller subnets limit broadcast traffic and isolate services. A /28 gives 14
                  usable addresses, ideal for DMZ segments.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Point-to-Point Links (/30)</h3>
                <p className="text-sm text-gray-600">
                  WAN router links typically use /30 subnets, providing exactly 2 usable addresses
                  for each end of the link.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">ISP Address Blocks (/8 – /16)</h3>
                <p className="text-sm text-gray-600">
                  Large ISPs manage massive address ranges. A /16 block provides 65,534 usable
                  addresses for assigning to customers.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Loopback Routes (/32)</h3>
                <p className="text-sm text-gray-600">
                  A /32 host route targets a single IP address. Used for loopback interfaces on
                  routers and for advertising specific host routes.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">RFC 3021 Links (/31)</h3>
                <p className="text-sm text-gray-600">
                  /31 subnets eliminate wasted network and broadcast addresses on point-to-point
                  links, saving two IP addresses per link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
