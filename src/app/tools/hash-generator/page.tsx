import { Metadata } from 'next';
import HashGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'Hash Generator | MD5, SHA256, Bcrypt, Argon2 Online Tool',
  description: 'Generate secure hashes instantly. Supports MD5, SHA-1, SHA-256, SHA-512, Bcrypt, Argon2id, and RIPEMD-160. Includes salt support and verification.',
  keywords: ['hash generator', 'md5 generator', 'sha256 generator', 'bcrypt generator', 'argon2 generator', 'online hasher', 'hash verifier', 'password hasher'],
  openGraph: {
    title: 'Hash Generator | Secure Online Hashing Tool',
    description: 'Generate and verify hashes instantly. Supports modern algorithms like Bcrypt and Argon2 along with classics like MD5 and SHA.',
    type: 'website',
  },
};

export default function HashGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hash Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Generate secure hashes instantly. Supports MD5, SHA-1, SHA-256, SHA-512, Bcrypt, Argon2id, and RIPEMD-160.",
    "featureList": [
      "Support for multiple algorithms",
      "Salt support",
      "Client-side processing",
      "Instant verification"
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center space-y-4">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
              <Shield className="w-3.5 h-3.5" />
              100% Client-Side Processing
            </div> */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Hash Generator
            </h1>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <HashGeneratorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Modern Password Hashing</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Argon2id</strong> | Winner of the Password Hashing Competition.
                  Memory-hard and resistant to GPU attacks. Use this for new password storage systems.
                </p>
                <p>
                  <strong className="text-gray-800">Bcrypt</strong> | Industry standard for over a decade.
                  Adaptive cost factor makes it future-proof. Excellent for most production use cases.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">General Purpose Hashing</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">SHA-256 & SHA-512</strong> | Secure standards for digital signatures,
                  file integrity verification, and authentication protocols.
                </p>
                <p>
                  <strong className="text-gray-800">MD5 & SHA-1</strong> | Fast algorithms with broken collision resistance.
                  Only use for non-security checksums and legacy compatibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
