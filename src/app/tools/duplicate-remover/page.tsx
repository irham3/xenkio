import { Metadata } from 'next';
import DuplicateRemoverClient from './client';

export const metadata: Metadata = {
  title: 'Duplicate Line Remover | Remove Duplicate Lines Online',
  description: 'Remove duplicate lines from text instantly. Options for case sensitivity, trimming, empty line removal, and sorting. Free online duplicate line remover.',
  keywords: ['duplicate line remover', 'remove duplicates', 'unique lines', 'text cleaner', 'deduplicate text'],
  openGraph: {
    title: 'Duplicate Line Remover | Free Online Text Deduplication Tool',
    description: 'Remove duplicate lines from text with customizable options. Instant results.',
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

export default function DuplicateRemoverPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Duplicate Line Remover",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Remove duplicate lines from text instantly with customizable options.",
    "featureList": [
      "Remove duplicate lines",
      "Case sensitive matching",
      "Trim whitespace",
      "Remove empty lines",
      "Sort output"
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
              Duplicate Line Remover
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Remove duplicate lines from your text with options for case sensitivity, trimming, and sorting
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <DuplicateRemoverClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Text Deduplication</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Case Sensitive</strong> | Control whether uppercase
                  and lowercase variations are treated as duplicates or unique lines.
                </p>
                <p>
                  <strong className="text-gray-800">Trim Whitespace</strong> | Automatically remove
                  leading and trailing spaces before comparing lines for duplicates.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Advanced Options</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Empty Line Removal</strong> | Strip out blank lines
                  from your output for cleaner, more compact results.
                </p>
                <p>
                  <strong className="text-gray-800">Sort Output</strong> | Alphabetically sort the
                  unique lines for easy scanning and organized output.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
