import { Metadata } from 'next';
import TextAffixerClient from './client';

export const metadata: Metadata = {
  title: 'Text Affixer | Add Prefixes & Suffixes Online',
  description:
    'Add prefixes and suffixes to each line or an entire text block instantly. Free online text affixer tool with client-side processing.',
  keywords: [
    'text affixer',
    'add prefix to text',
    'add suffix to text',
    'prefix suffix tool',
    'add text to each line',
    'line prefixer',
    'line suffixer',
  ],
  openGraph: {
    title: 'Text Affixer | Add Prefixes and Suffixes Online',
    description: 'Add text before or after each line, or wrap a full text block instantly.',
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

export default function TextAffixerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Text Affixer',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Add prefixes and suffixes to each line or an entire text block instantly.',
    featureList: [
      'Add prefix to each line',
      'Add suffix to each line',
      'Wrap entire text blocks',
      'Skip empty lines',
      'Copy generated output',
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-white">
        <div className="container mx-auto max-w-5xl px-4 py-12">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              Text Affixer
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Add prefixes and suffixes to each line or wrap an entire text block
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4">
        <TextAffixerClient />
      </section>

      <section className="bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Line Affixing</h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  <strong className="text-gray-800">Each Line</strong> | Add the same prefix,
                  suffix, or both to every line while preserving the original line order.
                </p>
                <p>
                  <strong className="text-gray-800">Skip Empty Lines</strong> | Keep blank
                  separators untouched when formatting lists, logs, or plain text blocks.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Whole Text Wrapping</h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  <strong className="text-gray-800">Whole Text</strong> | Add one prefix and
                  one suffix around the entire input for quotes, wrappers, or templates.
                </p>
                <p>
                  <strong className="text-gray-800">Instant Output</strong> | Process text in
                  your browser and copy the result without sending content to a server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
