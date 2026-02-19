import { Metadata } from 'next';
import ContrastCheckerClient from './client';

export const metadata: Metadata = {
  title: 'Color Contrast Checker | WCAG Accessibility Compliance Tool',
  description: 'Check color contrast ratio for WCAG 2.1 AA and AAA compliance. Ensure your text is readable and accessible for all users.',
  keywords: ['contrast checker', 'wcag', 'color contrast', 'accessibility', 'a11y', 'contrast ratio', 'web accessibility'],
  openGraph: {
    title: 'Contrast Checker | WCAG Color Contrast Tool',
    description: 'Check color contrast ratios for WCAG 2.1 compliance. Ensure accessible color combinations.',
    type: 'website',
  },
};

export default function ContrastCheckerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Color Contrast Checker",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Check color contrast ratios for WCAG 2.1 AA and AAA compliance. Ensure accessible color combinations for all users.",
    "featureList": [
      "WCAG 2.1 contrast ratio calculation",
      "AA and AAA compliance checking",
      "Live text preview",
      "Color suggestions for passing contrast"
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
              Color Contrast Checker
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check color contrast ratios for WCAG 2.1 AA and AAA compliance and ensure accessible color combinations
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <ContrastCheckerClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Understanding Color Contrast</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">WCAG 2.1 Guidelines</strong> — The Web Content Accessibility
                  Guidelines define minimum contrast ratios to ensure text is readable for users with low vision
                  or color deficiencies.
                </p>
                <p>
                  <strong className="text-gray-800">Contrast Ratio</strong> — Calculated using relative luminance
                  of foreground and background colors. Ranges from 1:1 (no contrast) to 21:1 (maximum contrast).
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Compliance Levels</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">AA Level</strong> — Requires 4.5:1 for normal text and 3:1
                  for large text (18pt+ or 14pt bold). This is the minimum recommended standard.
                </p>
                <p>
                  <strong className="text-gray-800">AAA Level</strong> — Requires 7:1 for normal text and 4.5:1
                  for large text. This is the enhanced standard for optimal accessibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
