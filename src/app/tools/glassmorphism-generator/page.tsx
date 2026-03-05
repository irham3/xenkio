import { Metadata } from 'next';
import GlassmorphismGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'Glassmorphism Generator | Create Glass UI Effects Online',
  description: 'Create beautiful glassmorphism effects with live preview. Adjust blur, opacity, saturation, border, and export CSS code instantly.',
  keywords: ['glassmorphism generator', 'glass ui', 'css glassmorphism', 'frosted glass css', 'backdrop filter', 'glass effect generator', 'css tool'],
  openGraph: {
    title: 'Glassmorphism Generator | Free Online Glass UI Maker',
    description: 'Create beautiful glassmorphism effects with live preview and copy CSS code instantly.',
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

export default function GlassmorphismGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Glassmorphism Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create beautiful glassmorphism effects with live preview. Adjust blur, opacity, saturation, and border radius with instant CSS code export.",
    "featureList": [
      "Adjustable blur and opacity",
      "Backdrop filter saturation control",
      "Border opacity and radius controls",
      "Multiple background presets",
      "Glass effect presets",
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
              Glassmorphism Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create stunning frosted glass UI effects with live preview and export CSS code instantly
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <GlassmorphismGeneratorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Glassmorphism CSS Properties</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Backdrop Filter</strong> | The key property for
                  glassmorphism. Applies blur and saturation effects to the area behind the element,
                  creating the frosted glass look.
                </p>
                <p>
                  <strong className="text-gray-800">Background Opacity</strong> | A semi-transparent
                  background color lets the blur effect show through while providing enough contrast
                  for content readability.
                </p>
                <p>
                  <strong className="text-gray-800">Border</strong> | A subtle semi-transparent border
                  enhances the glass edge effect and helps distinguish the element from the background.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Adjust Controls</strong> | Use the sliders to fine-tune
                  the blur amount, background opacity, saturation, border opacity, and border radius
                  until you achieve the desired glass effect.
                </p>
                <p>
                  <strong className="text-gray-800">Copy &amp; Use</strong> | Click the {'"'}Copy CSS{'"'}
                  button to copy the generated CSS code. Paste it into your stylesheet and apply the
                  class to any element for an instant glassmorphism effect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
