import { Metadata } from 'next';
import LoremIpsumClient from './client';

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator | Free Placeholder Text Generator Online',
  description: 'Generate lorem ipsum placeholder text in paragraphs, sentences, or words. Customize length and format for your design and development projects.',
  keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text', 'lorem ipsum', 'filler text', 'text generator'],
  openGraph: {
    title: 'Lorem Ipsum Generator | Free Placeholder Text Generator',
    description: 'Generate lorem ipsum placeholder text in paragraphs, sentences, or words. Free online tool for designers and developers.',
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

export default function LoremIpsumPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Lorem Ipsum Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Generate lorem ipsum placeholder text in paragraphs, sentences, or words.",
    "featureList": ["Paragraphs", "Sentences", "Words", "Custom Length", "Start with Lorem Ipsum", "Copy to Clipboard"]
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
              Lorem Ipsum Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Generate placeholder text in paragraphs, sentences, or words for your design and development projects
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <LoremIpsumClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is Lorem Ipsum?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Lorem Ipsum</strong> is standard placeholder text used in the
                  printing and typesetting industry since the 1500s.
                </p>
                <p>
                  It helps designers and developers focus on layout and visual design without
                  being distracted by readable content.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Why Use Placeholder Text?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Design Mockups</strong> | Fill layouts with realistic-looking
                  text to preview how final content will appear.
                </p>
                <p>
                  <strong className="text-gray-800">Development</strong> | Test text rendering, overflow handling,
                  and responsive layouts with varying text lengths.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
