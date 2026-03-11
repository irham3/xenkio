import { Metadata } from 'next';
import TextCleanerClient from './client';

export const metadata: Metadata = {
  title: 'Text Cleaner | Remove Extra Spaces & Clean Up Text Online',
  description: 'Clean up messy text instantly. Remove extra spaces, duplicate lines, blank lines, and trailing whitespace. Free online text cleaner tool.',
  keywords: ['text cleaner', 'remove extra spaces', 'remove duplicate lines', 'remove blank lines', 'clean text', 'text formatter', 'whitespace remover'],
  openGraph: {
    title: 'Text Cleaner | Free Online Text Cleanup Tool',
    description: 'Remove extra spaces, duplicate lines, and clean up messy text instantly. No data sent to servers.',
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

export default function TextCleanerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Text Cleaner",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Remove extra spaces, duplicate lines, and clean up messy text.",
    "featureList": ["Trim Lines", "Remove Multiple Spaces", "Remove Blank Lines", "Remove Duplicate Lines", "Tabs to Spaces"]
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
              Text Cleaner
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Remove extra spaces, duplicate lines, and clean up messy text instantly
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <TextCleanerClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Cleaning Options</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Trim Lines</strong> | Remove leading and trailing
                  whitespace from each line for consistent formatting.
                </p>
                <p>
                  <strong className="text-gray-800">Multiple Spaces</strong> | Collapse repeated spaces
                  into a single space for cleaner text.
                </p>
                <p>
                  <strong className="text-gray-800">Blank Lines</strong> | Remove empty lines to
                  reduce unnecessary vertical spacing.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Advanced Cleanup</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Duplicate Lines</strong> | Remove consecutive
                  duplicate lines to eliminate redundancy.
                </p>
                <p>
                  <strong className="text-gray-800">Tabs to Spaces</strong> | Convert tab characters
                  to spaces for consistent indentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
