import { Metadata } from 'next';
import HtmlEntityEncoderClient from './client';

export const metadata: Metadata = {
  title: 'HTML Entity Encoder & Decoder | Free Online Tool',
  description: 'Encode and decode HTML entities instantly. Convert special characters to HTML entities and back. Free online tool with no signup required.',
  keywords: ['html entity encoder', 'html entity decoder', 'encode html', 'decode html entities', 'html special characters', 'html entities converter', 'html escape tool'],
  openGraph: {
    title: 'HTML Entity Encoder & Decoder | Free Online Tool',
    description: 'Encode and decode HTML entities instantly. Convert special characters to HTML entities and back. 100% client-side processing.',
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
    title: 'HTML Entity Encoder & Decoder',
    description: 'Encode and decode HTML entities instantly. Convert special characters to safe HTML entities.',
    images: ['/og-image.jpg'],
  },
};

export default function HtmlEntityEncoderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "HTML Entity Encoder",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Encode and decode HTML entities instantly. Free online tool that converts special characters to HTML entities.",
    "featureList": [
      "Encode HTML entities",
      "Decode HTML entities",
      "Handle named entities",
      "Handle numeric entities"
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
        <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              HTML Entity Encoder
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Encode and decode HTML entities to safely display special characters in your web pages
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <HtmlEntityEncoderClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Why Encode HTML Entities?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Security</strong> | Encoding HTML entities prevents cross-site
                  scripting (XSS) attacks by ensuring special characters are rendered as text, not executed as code.
                </p>
                <p>
                  <strong className="text-gray-800">Correctness</strong> | Characters like &lt;, &gt;, and &amp; have
                  special meaning in HTML. Encoding them ensures your content displays exactly as intended.
                </p>
                <p>
                  <strong className="text-gray-800">Compatibility</strong> | HTML entities ensure that special and
                  non-ASCII characters render consistently across all browsers and platforms.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Features</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Full Encoding</strong> | Encodes all HTML special characters
                  including &lt;, &gt;, &amp;, quotes, and non-ASCII characters to their entity equivalents.
                </p>
                <p>
                  <strong className="text-gray-800">Smart Decoding</strong> | Decodes named entities (&amp;amp;,
                  &amp;lt;), decimal entities (&amp;#123;), and hexadecimal entities (&amp;#x7B;).
                </p>
                <p>
                  <strong className="text-gray-800">Instant Stats</strong> | See the number of entities
                  processed, character counts, and size differences at a glance.
                </p>
              </div>
            </div>
          </div>

          {/* Additional SEO Content */}
          <div className="mt-12 pt-12 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How to Use the HTML Entity Encoder</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Paste Your HTML</h3>
                <p className="text-sm text-gray-600">
                  Paste your HTML code or encoded entities into the input field, or load a sample to get started.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Action</h3>
                <p className="text-sm text-gray-600">
                  Select Encode to convert special characters to entities, or Decode to convert entities back, then click the action button.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Copy or Download</h3>
                <p className="text-sm text-gray-600">
                  Copy the result to your clipboard or download it as an HTML file ready for use in your project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
