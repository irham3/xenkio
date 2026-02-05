import { Metadata } from 'next';
import RegexTesterClient from './client';

export const metadata: Metadata = {
  title: 'Regex Tester | Regular Expression Tester & Debugger Online',
  description: 'Test and debug regular expressions with live matching, syntax highlighting, and detailed match information. Supports all JavaScript regex flags.',
  keywords: ['regex tester', 'regular expression tester', 'regex debugger', 'regex validator', 'pattern matching', 'regex online', 'javascript regex'],
  openGraph: {
    title: 'Regex Tester | Online Regular Expression Tester',
    description: 'Test and debug regular expressions instantly with live matching and detailed results. Free online regex tester.',
    type: 'website',
  },
};

export default function RegexTesterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Regex Tester",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Test and debug regular expressions with live matching and detailed match information.",
    "featureList": [
      "Live regex matching",
      "Syntax highlighting",
      "JavaScript regex flags",
      "Cheatsheet included"
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
              Regex Tester
            </h1>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <RegexTesterClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">JavaScript Regex Flags</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Global (g)</strong> — Find all matches in the string, not just the first one. Essential for replacing or counting all occurrences.
                </p>
                <p>
                  <strong className="text-gray-800">Case Insensitive (i)</strong> — Match regardless of letter case. Makes [a-z] also match uppercase letters.
                </p>
                <p>
                  <strong className="text-gray-800">Multiline (m)</strong> — Changes behavior of ^ and $ to match start/end of each line instead of the whole string.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Common Use Cases</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Input Validation</strong> — Validate email addresses, phone numbers, URLs, and other structured data formats.
                </p>
                <p>
                  <strong className="text-gray-800">Text Extraction</strong> — Extract specific patterns from text like dates, prices, or identifiers.
                </p>
                <p>
                  <strong className="text-gray-800">Search & Replace</strong> — Find and transform text patterns in documents or code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
