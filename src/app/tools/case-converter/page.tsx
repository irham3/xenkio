import { Metadata } from 'next';
import CaseConverterClient from './client';

export const metadata: Metadata = {
  title: 'Case Converter | Transform Text to Any Case Online',
  description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case and more. Free online text case converter tool.',
  keywords: ['case converter', 'text converter', 'uppercase', 'lowercase', 'title case', 'camelCase', 'snake_case', 'kebab-case'],
  openGraph: {
    title: 'Case Converter | Free Online Text Case Converter',
    description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, and more formats instantly.',
    type: 'website',
  },
};

export default function CaseConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Case Converter",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Convert text between uppercase, lowercase, title case, camelCase, and more.",
    "featureList": ["UPPERCASE", "lowercase", "Title Case", "camelCase", "snake_case", "kebab-case"]
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
              Case Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert text between uppercase, lowercase, title case, camelCase, and more formats
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <CaseConverterClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Text Case Formats</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Title Case</strong> — Capitalize the first letter of each word.
                  Ideal for headings and titles.
                </p>
                <p>
                  <strong className="text-gray-800">Sentence case</strong> — Capitalize only the first letter of
                  the sentence. Standard for body text.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Developer Cases</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">camelCase</strong> — Common in JavaScript, Java.
                  Join words with first letter lowercase.
                </p>
                <p>
                  <strong className="text-gray-800">snake_case</strong> — Common in Python, Ruby.
                  Words separated by underscores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
