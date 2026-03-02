import { Metadata } from 'next';
import DiffCheckerClient from './client';

export const metadata: Metadata = {
  title: 'Diff Checker | Online Text Comparison Tool',
  description: 'Compare two texts and highlight differences instantly. Supports character, word, and line-by-line comparison with split and unified views.',
  keywords: ['diff checker', 'text comparison', 'compare text', 'diff tool', 'text diff', 'online diff', 'compare files', 'difference checker'],
  openGraph: {
    title: 'Diff Checker | Compare Text Online',
    description: 'Compare two texts and highlight differences. Supports multiple comparison modes and view options.',
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

export default function DiffCheckerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Diff Checker",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Compare two texts and highlight differences instantly. Supports character, word, and line-by-line comparison.",
    "featureList": [
      "Compare text/code",
      "Split/Unified view",
      "Ignore case/whitespace",
      "Highlight differences"
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
              Diff Checker
            </h1>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <DiffCheckerClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Powerful Text Comparison</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Character Mode</strong> | Compare texts character by character
                  for the most detailed analysis. Perfect for finding subtle changes.
                </p>
                <p>
                  <strong className="text-gray-800">Word Mode</strong> | Compare word by word to quickly identify
                  changed, added, or removed words. Ideal for document revisions.
                </p>
                <p>
                  <strong className="text-gray-800">Line Mode</strong> | Compare line by line for code comparison
                  or structured text. Great for config files and source code.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">View Options</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Unified View</strong> | See all changes in a single view
                  with additions highlighted in green and deletions in red.
                </p>
                <p>
                  <strong className="text-gray-800">Split View</strong> | View original and modified texts
                  side by side for easy comparison.
                </p>
                <p>
                  <strong className="text-gray-800">Advanced Options</strong> | Ignore case differences or
                  whitespace changes to focus on meaningful content changes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Use Cases</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                Compare code changes before committing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                Review document revisions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                Verify configuration file changes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                Compare API responses
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                Check content updates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                Validate data transformations
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
