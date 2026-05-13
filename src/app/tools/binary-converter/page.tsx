import { Metadata } from 'next';
import BinaryConverterClient from './client';

export const metadata: Metadata = {
  title: 'Binary Converter | Text to Binary & Binary to Text',
  description:
    'Convert text to binary code or decode binary strings back to readable text instantly. Supports UTF-8 text, emoji, and space, dash, or continuous binary formats.',
  keywords: [
    'binary converter',
    'text to binary',
    'binary to text',
    'binary decoder',
    'binary encoder',
    'ascii to binary',
    'binary code translator',
    'utf-8 binary converter',
  ],
  openGraph: {
    title: 'Binary Converter | Text to Binary & Binary to Text',
    description:
      'Convert text to binary and decode binary strings back to text in your browser.',
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

export default function BinaryConverterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Binary Converter',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Convert text to binary code or decode binary strings back to readable UTF-8 text.',
    featureList: [
      'Text to binary conversion',
      'Binary to text decoding',
      'UTF-8 and emoji support',
      'Space, dash, and continuous binary formats',
      'Client-side conversion',
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Binary Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert text into binary byte groups, then decode binary back to readable text.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl">
        <BinaryConverterClient />
      </section>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is Binary Code?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Binary code</strong> represents data with
                  only 0s and 1s. Text is encoded into bytes, and each byte can be shown as an
                  8-bit binary group such as <code className="bg-gray-100 px-1 rounded text-xs">01000001</code>.
                </p>
                <p>
                  This converter uses UTF-8 bytes, so it supports ASCII text, accented
                  characters, symbols, and emoji while keeping conversion fully in your browser.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Text to Binary</strong> converts your input
                  to 8-bit binary groups with a space, dash, or no separator between bytes.
                </p>
                <p>
                  <strong className="text-gray-800">Binary to Text</strong> accepts
                  space-separated, dash-separated, newline-separated, or continuous binary and
                  decodes it back to UTF-8 text.
                </p>
                <p>
                  Use the <strong className="text-gray-800">Swap</strong> button to run the
                  output back through the reverse conversion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
