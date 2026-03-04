import { Metadata } from 'next';
import BorderRadiusClient from './client';

export const metadata: Metadata = {
  title: 'CSS Border Radius Generator | Create Custom Rounded Corners',
  description: 'Generate custom CSS border-radius values with a visual editor. Control individual corners, choose units, use presets, and copy CSS code instantly.',
  keywords: ['border radius generator', 'css border radius', 'rounded corners', 'border radius tool', 'css generator', 'border radius preview'],
  openGraph: {
    title: 'CSS Border Radius Generator | Free Online Tool',
    description: 'Generate custom CSS border-radius with visual editor. Copy CSS code instantly.',
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

export default function BorderRadiusPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CSS Border Radius Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Generate custom CSS border-radius values with a visual editor. Control individual corners, use preset shapes, and copy CSS code instantly.",
    "featureList": [
      "Individual corner control",
      "Linked/unlinked mode",
      "Multiple unit support (px, %, rem, em)",
      "Preset shapes",
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
              CSS Border Radius Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create custom rounded corners with a visual editor and copy the CSS instantly
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <BorderRadiusClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Understanding Border Radius</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Single Value</strong> | Apply the same radius to
                  all four corners for uniform rounded corners. Link all corners together for quick
                  adjustments.
                </p>
                <p>
                  <strong className="text-gray-800">Individual Corners</strong> | Control each corner
                  independently to create unique shapes like speech bubbles, tabs, tickets, and organic
                  blob shapes.
                </p>
                <p>
                  <strong className="text-gray-800">Units</strong> | Choose between px for fixed
                  sizes, % for responsive shapes, or rem/em for scalable designs that adapt to font
                  size.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Preset Shapes</strong> | Start with a preset
                  shape like Pill, Leaf, or Drop and fine-tune the values to match your design.
                </p>
                <p>
                  <strong className="text-gray-800">Instant Export</strong> | Copy the generated CSS
                  code with one click. The live preview updates in real-time as you adjust the
                  border-radius parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
