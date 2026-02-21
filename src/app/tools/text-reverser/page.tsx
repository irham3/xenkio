import { Metadata } from 'next';
import TextReverserClient from './client';

export const metadata: Metadata = {
  title: 'Text Reverser | Reverse Text, Words & Lines Online',
  description: 'Reverse text characters, words, or lines instantly. Multiple reversal modes for creating mirror text and flipped content. Free online text reverser.',
  keywords: ['text reverser', 'reverse text', 'mirror text', 'flip text', 'reverse words', 'backward text'],
  openGraph: {
    title: 'Text Reverser | Free Online Text Reversal Tool',
    description: 'Reverse text characters, words, or lines with multiple modes. Instant results.',
    type: 'website',
  },
};

export default function TextReverserPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Text Reverser",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Reverse text characters, words, or lines instantly with multiple reversal modes.",
    "featureList": [
      "Reverse characters",
      "Reverse each word",
      "Reverse word order",
      "Reverse each line",
      "Reverse line order"
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
              Text Reverser
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reverse text characters, words, or lines with multiple reversal modes
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <TextReverserClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Text Reversal Modes</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Reverse Characters</strong> | Flip every character in your
                  text to create mirror text. Great for fun messages and encoding.
                </p>
                <p>
                  <strong className="text-gray-800">Reverse Each Word</strong> | Reverse the letters within
                  each word while keeping the word order intact.
                </p>
                <p>
                  <strong className="text-gray-800">Reverse Word Order</strong> | Rearrange words in reverse
                  order while keeping each word&apos;s characters unchanged.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Line Reversal Options</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Reverse Each Line</strong> | Reverse the characters in
                  each line independently while keeping the line order.
                </p>
                <p>
                  <strong className="text-gray-800">Reverse Line Order</strong> | Flip the order of lines
                  so the last line appears first and vice versa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
