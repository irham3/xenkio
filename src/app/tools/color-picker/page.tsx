import { Metadata } from 'next';
import ColorPickerClient from './client';

export const metadata: Metadata = {
  title: 'Color Picker | HEX, RGB, HSL Converter Online Tool',
  description: 'Pick colors and convert between HEX, RGB, and HSL formats instantly. Free online color picker with preset colors, recent history, and easy copy functionality.',
  keywords: ['color picker', 'hex converter', 'rgb converter', 'hsl converter', 'color tool', 'color palette', 'web colors'],
  openGraph: {
    title: 'Color Picker | Free Online Color Converter Tool',
    description: 'Pick colors and convert between HEX, RGB, and HSL formats. Copy color values instantly.',
    type: 'website',
  },
};

export default function ColorPickerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Color Picker",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Pick colors and convert between HEX, RGB, and HSL formats instantly.",
    "featureList": [
      "Pick colors",
      "Convert formats",
      "HEX/RGB/HSL",
      "History log"
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
              Color Picker
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pick colors from the palette and convert between HEX, RGB, and HSL formats
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <ColorPickerClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Color Format Conversion</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">HEX</strong> | The standard format for web colors.
                  Uses hexadecimal notation like #FF5733 to represent RGB values.
                </p>
                <p>
                  <strong className="text-gray-800">RGB</strong> | Red, Green, Blue values from 0-255.
                  Perfect for CSS and programmatic color manipulation.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Advanced Color Models</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">HSL</strong> | Hue, Saturation, Lightness model.
                  More intuitive for creating color variations and palettes.
                </p>
                <p>
                  <strong className="text-gray-800">Instant Copy</strong> | Click to copy any format.
                  All conversions happen in real-time as you adjust colors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
