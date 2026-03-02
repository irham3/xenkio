import { Metadata } from 'next';
import FlexboxGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'CSS Flexbox Generator | Visual Flexbox Layout Builder',
  description: 'Create CSS flexbox layouts visually with a live preview. Configure flex direction, wrapping, alignment, gap, and item properties. Copy CSS code instantly.',
  keywords: ['flexbox generator', 'css flexbox', 'flexbox layout', 'css layout tool', 'flexbox builder', 'css tool', 'flex container'],
  openGraph: {
    title: 'CSS Flexbox Generator | Free Online Flexbox Builder',
    description: 'Create CSS flexbox layouts visually with live preview. Copy CSS code instantly.',
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

export default function FlexboxGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CSS Flexbox Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create CSS flexbox layouts visually with a live preview editor. Configure container and item properties with instant CSS code export.",
    "featureList": [
      "Flex direction control",
      "Flex wrap options",
      "Justify content alignment",
      "Align items control",
      "Gap spacing",
      "Individual item properties",
      "Layout presets",
      "Live preview",
      "CSS code export"
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
              CSS Flexbox Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create flexible CSS layouts visually and copy the generated code instantly
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <FlexboxGeneratorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">CSS Flexbox Properties</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">flex-direction</strong> | Defines the main axis
                  direction. Use row for horizontal or column for vertical layouts. Reverse variants
                  flip the order of items.
                </p>
                <p>
                  <strong className="text-gray-800">justify-content</strong> | Aligns items along the
                  main axis. Options include start, end, center, space-between, space-around, and
                  space-evenly for distributing space.
                </p>
                <p>
                  <strong className="text-gray-800">align-items</strong> | Aligns items along the cross
                  axis. Stretch fills the container height, while center and baseline provide different
                  vertical alignment options.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Container Controls</strong> | Adjust flex direction,
                  wrapping, alignment, and gap on the left panel. The live preview updates instantly as
                  you change settings.
                </p>
                <p>
                  <strong className="text-gray-800">Item Properties</strong> | Click any item in the
                  preview to customize its individual flex-grow, flex-shrink, flex-basis, order, and
                  align-self properties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
