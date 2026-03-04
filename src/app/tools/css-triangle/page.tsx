import { Metadata } from 'next';
import CssTriangleClient from './client';

export const metadata: Metadata = {
  title: 'CSS Triangle Generator | Create CSS Triangles Online',
  description: 'Create CSS triangles and arrows without images. Choose direction, size, and color with live preview and instant CSS code export.',
  keywords: ['css triangle', 'css triangle generator', 'css arrow', 'border triangle', 'css shapes', 'triangle maker', 'css border trick'],
  openGraph: {
    title: 'CSS Triangle Generator | Free Online Triangle Maker',
    description: 'Create CSS triangles and arrows without images. Copy CSS code instantly.',
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

export default function CssTrianglePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CSS Triangle Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create CSS triangles and arrows without images. Choose direction, size, and color with live preview.",
    "featureList": [
      "8 triangle directions",
      "Custom width and height",
      "Color picker with presets",
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
              CSS Triangle Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create CSS triangles and arrows without images using the border trick
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <CssTriangleClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">CSS Triangle Directions</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Cardinal Directions</strong> | Create triangles
                  pointing up, down, left, or right. Perfect for tooltips, dropdowns, and navigation
                  arrows.
                </p>
                <p>
                  <strong className="text-gray-800">Diagonal Directions</strong> | Generate corner
                  triangles pointing top-left, top-right, bottom-left, or bottom-right. Ideal for
                  decorative corners and ribbon effects.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">The Border Trick</strong> | CSS triangles use an
                  element with zero width and height. The visible triangle is formed by a colored
                  border, while adjacent transparent borders create the shape.
                </p>
                <p>
                  <strong className="text-gray-800">Instant Export</strong> | Copy the generated CSS
                  code with one click. The live preview updates in real-time as you adjust the
                  triangle parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
