import { Metadata } from 'next';
import TextReplaceClient from './client';

export const metadata: Metadata = {
  title: 'Text Replace | Find and Replace Text Online',
  description: 'Find and replace text instantly. Supports plain text and regex patterns, case-sensitive matching, and replace all. Free online text replace tool.',
  keywords: ['text replace', 'find and replace', 'text search replace', 'regex replace', 'string replace', 'bulk text replace'],
  openGraph: {
    title: 'Text Replace | Free Online Find and Replace Tool',
    description: 'Find and replace text instantly with plain text or regex. Case-sensitive matching and replace all support.',
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

export default function TextReplacePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Text Replace",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Find and replace text with plain text or regex patterns. Supports case-sensitive matching and replace all.",
    "featureList": ["Find and Replace", "Regex Support", "Case Sensitive", "Replace All", "Instant Results"]
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
              Text Replace
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find and replace text with plain text or regex patterns
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <TextReplaceClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Text Replace Features</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Find &amp; Replace</strong> | Search for specific text and replace it with new content.
                  Works with any length of text.
                </p>
                <p>
                  <strong className="text-gray-800">Case Sensitive</strong> | Toggle case-sensitive matching to control whether uppercase and lowercase letters are treated differently.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Advanced Options</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Regex Support</strong> | Use regular expression patterns for advanced text matching and replacement.
                </p>
                <p>
                  <strong className="text-gray-800">Replace All</strong> | Choose to replace all occurrences or just the first match found in your text.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
