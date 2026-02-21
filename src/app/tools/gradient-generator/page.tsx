import { Metadata } from 'next';
import GradientGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'CSS Gradient Generator | Create Beautiful Gradients Online',
  description: 'Create beautiful CSS gradients with a visual editor. Linear, radial, and conic gradients with color stops, presets, and instant CSS code export.',
  keywords: ['gradient generator', 'css gradient', 'linear gradient', 'radial gradient', 'conic gradient', 'gradient maker', 'css background'],
  openGraph: {
    title: 'CSS Gradient Generator | Free Online Gradient Maker',
    description: 'Create beautiful CSS gradients with visual editor. Copy CSS code instantly.',
    type: 'website',
  },
};

export default function GradientGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CSS Gradient Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create beautiful CSS gradients with a visual editor. Linear, radial, and conic gradients with color stops and presets.",
    "featureList": [
      "Linear gradients",
      "Radial gradients",
      "Conic gradients",
      "Color stops editor",
      "Preset gradients",
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
              CSS Gradient Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create beautiful linear, radial, and conic CSS gradients with a visual editor
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <GradientGeneratorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">CSS Gradient Types</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Linear Gradient</strong> | Creates a smooth
                  transition between colors along a straight line. Control the direction with angle
                  presets or a custom degree value.
                </p>
                <p>
                  <strong className="text-gray-800">Radial Gradient</strong> | Colors radiate
                  outward from a center point. Choose between circle and ellipse shapes with
                  adjustable position.
                </p>
                <p>
                  <strong className="text-gray-800">Conic Gradient</strong> | Colors transition
                  around a center point, creating pie-chart-like effects. Great for color wheels and
                  decorative backgrounds.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Color Stops</strong> | Add multiple color stops
                  to create complex gradients. Each stop has a color and position percentage that
                  you can adjust.
                </p>
                <p>
                  <strong className="text-gray-800">Instant Export</strong> | Copy the generated CSS
                  code with one click. The live preview updates in real-time as you adjust the
                  gradient parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
