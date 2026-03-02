import { Metadata } from 'next';
import ColorBlindnessClient from './client';

export const metadata: Metadata = {
  title: 'Color Blindness Simulator | Test Designs for Color Vision Deficiency',
  description:
    'Simulate how your designs look to people with color blindness. Test for protanopia, deuteranopia, tritanopia and more. Free accessibility testing tool.',
  keywords: [
    'color blindness simulator',
    'color vision deficiency',
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'accessibility testing',
    'a11y',
  ],
  openGraph: {
    title: 'Color Blindness Simulator | Design Accessibility Tool',
    description:
      'Test your designs for color vision deficiency. Simulate 8 types of color blindness.',
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

export default function ColorBlindnessPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Color Blindness Simulator',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Simulate how your designs look to people with different types of color blindness.',
    featureList: [
      'Simulate 8 types of color blindness',
      'Upload JPG, PNG, WebP images',
      'Side-by-side comparison',
      'Download simulated images',
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
              Color Blindness Simulator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Test how your designs appear to people with color vision deficiency
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <ColorBlindnessClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Red-Green Color Blindness</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Protanopia &amp; Protanomaly</strong> | Affects
                  perception of red light. People with protanopia cannot see red at all, while
                  protanomaly causes reduced red sensitivity. Affects roughly 1% of men.
                </p>
                <p>
                  <strong className="text-gray-800">Deuteranopia &amp; Deuteranomaly</strong> |
                  Affects perception of green light. Deuteranomaly is the most common form of color
                  blindness, affecting about 5% of men worldwide.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Blue &amp; Total Color Blindness</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Tritanopia &amp; Tritanomaly</strong> | Affects
                  blue-yellow perception. Much rarer than red-green deficiency, affecting about
                  0.003–0.01% of the population regardless of gender.
                </p>
                <p>
                  <strong className="text-gray-800">Achromatopsia &amp; Achromatomaly</strong> |
                  Complete or partial inability to see color. Very rare conditions where the world
                  appears in shades of gray or heavily desaturated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
