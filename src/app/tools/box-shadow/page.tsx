import { Metadata } from 'next';
import BoxShadowClient from './client';

export const metadata: Metadata = {
  title: 'Box Shadow Generator | Create CSS Box Shadows Online',
  description: 'Create beautiful CSS box shadows with a visual editor. Multiple layers, inset shadows, color and opacity controls, presets, and instant CSS code export.',
  keywords: ['box shadow generator', 'css box shadow', 'shadow generator', 'css shadow', 'box shadow maker', 'css tool', 'shadow editor'],
  openGraph: {
    title: 'Box Shadow Generator | Free Online CSS Shadow Maker',
    description: 'Create beautiful CSS box shadows with visual editor. Copy CSS code instantly.',
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

export default function BoxShadowPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Box Shadow Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create beautiful CSS box shadows with a visual editor. Multiple layers, inset shadows, color and opacity controls, and presets.",
    "featureList": [
      "Multiple shadow layers",
      "Inset shadow support",
      "Color and opacity controls",
      "Shadow presets",
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
              Box Shadow Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create beautiful CSS box shadows with a visual editor and copy the code instantly
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <BoxShadowClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">CSS Box Shadow Properties</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Offset X &amp; Y</strong> | Control the horizontal
                  and vertical position of the shadow. Positive values move the shadow right and down,
                  while negative values move it left and up.
                </p>
                <p>
                  <strong className="text-gray-800">Blur Radius</strong> | The larger the value, the
                  more blurred the shadow becomes. A value of zero creates a sharp shadow with no blur
                  effect.
                </p>
                <p>
                  <strong className="text-gray-800">Spread Radius</strong> | Positive values expand the
                  shadow beyond the element size, while negative values shrink the shadow smaller than
                  the element.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Multiple Layers</strong> | Add multiple shadow
                  layers to create complex, realistic shadow effects. Each layer has its own offset,
                  blur, spread, and color settings.
                </p>
                <p>
                  <strong className="text-gray-800">Instant Export</strong> | Copy the generated CSS
                  code with one click. The live preview updates in real-time as you adjust the shadow
                  parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
