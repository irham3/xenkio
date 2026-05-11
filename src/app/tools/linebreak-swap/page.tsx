import { Metadata } from 'next';
import LinebreakSwapClient from './client';

export const metadata: Metadata = {
  title: 'Linebreak Swap | Convert Spaces to Newlines & Vice Versa',
  description: 'Convert whitespace to line breaks or join lines into a single line. Swap spaces and tabs with newlines instantly. Free online text converter.',
  keywords: ['space to newline', 'newline to space', 'line break converter', 'whitespace to newline', 'join lines', 'split lines', 'text converter'],
  openGraph: {
    title: 'Linebreak Swap | Free Online Space ↔ Newline Converter',
    description: 'Convert whitespace to line breaks or join lines into one. Instant, private, browser-based.',
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

export default function LinebreakSwapPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Linebreak Swap",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Convert whitespace to line breaks or join lines into a single line instantly.",
    "featureList": [
      "Replace spaces and tabs with newlines",
      "Replace newlines with spaces",
      "Split inline text into separate lines",
      "Join multiple lines into one line"
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
              Linebreak Swap
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert whitespace to newlines and vice versa — split inline text into lines or join lines into one
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <LinebreakSwapClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Space to Newline</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Split Words into Lines</strong> | Replace every space or tab with a
                  line break. Perfect for converting a paragraph of comma-separated or space-separated values into a
                  clean list — one item per line.
                </p>
                <p>
                  <strong className="text-gray-800">Bulk List Conversion</strong> | Turn inline CSV values, tag lists,
                  or keyword strings into vertical lists ready for spreadsheets, config files, or further processing.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Newline to Space</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Join Lines into One</strong> | Replace every line break with a
                  single space, merging a multi-line list into a continuous inline string. Great for creating
                  comma-free keyword lists or single-paragraph output.
                </p>
                <p>
                  <strong className="text-gray-800">Clean Up Formatting</strong> | Remove unwanted line breaks from
                  copied text, emails, or PDF extractions that split content across too many lines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
