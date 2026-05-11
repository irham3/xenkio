import { Metadata } from 'next';
import TextSorterClient from './client';

export const metadata: Metadata = {
  title: 'Text Sorter | Sort Lines Alphabetically, Numerically & More',
  description:
    'Sort any text or list with 10 modes: A→Z, Z→A, natural, numeric, length, reverse, and shuffle. Remove duplicates, trim, and choose custom separators. Free & private.',
  keywords: [
    'text sorter',
    'sort lines',
    'alphabetical sorter',
    'sort list online',
    'natural sort',
    'numeric sort',
    'sort by length',
    'reverse list',
    'shuffle list',
    'remove duplicates',
    'list sorter',
  ],
  openGraph: {
    title: 'Text Sorter | Free Online List & Line Sorter',
    description:
      'Sort lists alphabetically, numerically, naturally, by length, reverse, or shuffle. Deduplicate and trim in one click.',
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

export default function TextSorterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Text Sorter',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Sort any text or list with multiple modes including alphabetical, natural, numeric, by length, reverse, and shuffle.',
    featureList: [
      'Alphabetical A → Z and Z → A sorting',
      'Natural order sorting (item2 before item10)',
      'Numeric ascending and descending',
      'Sort by line length',
      'Reverse current order',
      'Random shuffle (Fisher–Yates)',
      'Remove duplicates',
      'Trim and remove empty items',
      'Custom separators: newline, comma, semicolon, space, tab, pipe',
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
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Text Sorter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sort any list of text — alphabetical, natural, numeric, by length, reverse, or shuffle — with duplicate
              removal and custom separators
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <TextSorterClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Powerful Sorting Modes</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Alphabetical (A → Z / Z → A)</strong> | Classic lexicographic
                  sorting with optional case sensitivity and locale-aware comparison for accented characters.
                </p>
                <p>
                  <strong className="text-gray-800">Natural Order</strong> | Sorts strings with embedded numbers the
                  way humans expect — <code>item2</code> comes before <code>item10</code> — ideal for filenames,
                  version numbers, and mixed content.
                </p>
                <p>
                  <strong className="text-gray-800">Numeric</strong> | Parses each line as a number (ignoring
                  surrounding text) to sort purely by value, ascending or descending.
                </p>
                <p>
                  <strong className="text-gray-800">By Length</strong> | Order entries by character count — shortest
                  or longest first — great for finding outliers in a list.
                </p>
                <p>
                  <strong className="text-gray-800">Reverse & Shuffle</strong> | Flip the current order instantly, or
                  generate a cryptographically unbiased random arrangement via Fisher–Yates shuffle.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Smart Preprocessing</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Flexible Separators</strong> | Work with newline-delimited lists,
                  CSV rows, semicolon-separated values, tab-separated data, pipe-delimited logs, or plain space-split
                  tokens — output uses the same separator you picked.
                </p>
                <p>
                  <strong className="text-gray-800">Remove Duplicates</strong> | Deduplicate entries before sorting,
                  with optional case-insensitive matching so <code>Hello</code> and <code>hello</code> collapse into
                  one.
                </p>
                <p>
                  <strong className="text-gray-800">Trim & Clean</strong> | Automatically strip leading/trailing
                  whitespace and drop empty items so copy-pasted lists sort cleanly without manual cleanup.
                </p>
                <p>
                  <strong className="text-gray-800">100% Private</strong> | Everything runs in your browser. No
                  uploads, no tracking, and no server ever sees your data — works offline once loaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
