import { Metadata } from 'next';
import Base64EncoderClient from './client';

export const metadata: Metadata = {
  title: 'Base64 Encoder & Decoder | Free Online Tool',
  description: 'Encode text to Base64 or decode Base64 strings instantly. Free online Base64 converter with UTF-8 support. Real-time encoding and decoding.',
  keywords: ['base64 encoder', 'base64 decoder', 'base64 converter', 'encode base64', 'decode base64', 'online base64 tool', 'base64 online'],
  openGraph: {
    title: 'Base64 Encoder & Decoder | Free Online Tool',
    description: 'Convert text to Base64 and decode Base64 strings instantly. Free online tool with real-time conversion.',
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

export default function Base64EncoderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Base64 Encoder & Decoder",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Encode text to Base64 or decode Base64 strings instantly. Free online Base64 converter with UTF-8 support.",
    "featureList": [
      "Encode to Base64",
      "Decode from Base64",
      "UTF-8 support",
      "Real-time conversion"
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Base64 Encoder & Decoder
            </h1>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <Base64EncoderClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is Base64?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Base64</strong> is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It&apos;s commonly used to encode data for transmission over text-based protocols.
                </p>
                <p>
                  Base64 encoding is often used for embedding images in HTML/CSS, encoding email attachments, storing complex data in JSON, and transmitting binary data over APIs.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Encode</strong> | Enter any text in the input field and get the Base64 encoded version instantly. Supports full UTF-8 characters including emojis.
                </p>
                <p>
                  <strong className="text-gray-800">Decode</strong> | Paste a Base64 string to convert it back to the original text. Invalid Base64 strings will show an error message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
