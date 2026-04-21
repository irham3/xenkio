import { Metadata } from 'next';
import SvgOptimizerClient from './client';

export const metadata: Metadata = {
  title: 'SVG Optimizer | Free Online SVGO Tool',
  description:
    'Optimize and compress SVG files instantly using SVGO. Remove comments, metadata, and redundant data to reduce SVG file size. 100% client-side, no uploads required.',
  keywords: [
    'svg optimizer',
    'svgo online',
    'compress svg',
    'optimize svg',
    'svg minifier',
    'reduce svg size',
    'svg compressor',
    'free svg optimizer',
  ],
  openGraph: {
    title: 'SVG Optimizer | Free Online SVGO Tool',
    description:
      'Optimize and compress SVG files instantly using SVGO. Remove comments, metadata, and redundant data. 100% client-side processing.',
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
  twitter: {
    card: 'summary_large_image',
    title: 'SVG Optimizer | Free Online SVGO Tool',
    description:
      'Optimize and compress SVG files instantly using SVGO. Reduce file size without losing quality.',
    images: ['/og-image.jpg'],
  },
};

export default function SvgOptimizerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SVG Optimizer',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Optimize and compress SVG files using SVGO. Remove metadata, comments, and redundant data.',
    featureList: [
      'SVGO-powered optimization',
      'Multipass optimization',
      'Configurable plugins',
      'Before/after preview',
      'Client-side only',
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
        <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              SVG Optimizer
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Optimize and compress SVG files using SVGO. Remove metadata, comments, and redundant
              data to reduce file size — entirely in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <SvgOptimizerClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Why Optimize SVGs?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Performance</strong> | Optimized SVGs load
                  faster, improving page performance and Core Web Vitals scores.
                </p>
                <p>
                  <strong className="text-gray-800">Clean Code</strong> | SVG editors like
                  Illustrator and Inkscape add unnecessary metadata, comments, and namespace
                  data. SVGO removes all of it.
                </p>
                <p>
                  <strong className="text-gray-800">Smaller Files</strong> | Reducing SVG size
                  saves bandwidth, especially important for icon libraries and image-heavy sites.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Features</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">SVGO Powered</strong> | Uses the
                  industry-standard SVGO library to optimize SVGs with 30+ configurable plugins.
                </p>
                <p>
                  <strong className="text-gray-800">Live Preview</strong> | Compare original and
                  optimized SVGs side-by-side to visually verify no changes occurred.
                </p>
                <p>
                  <strong className="text-gray-800">Plugin Control</strong> | Enable or disable
                  individual SVGO plugins to precisely control what gets optimized.
                </p>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-12 pt-12 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How to Use the SVG Optimizer</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Paste or Upload SVG</h3>
                <p className="text-sm text-gray-600">
                  Paste your SVG code into the input field or upload an SVG file from your
                  device. Use the sample button to try a demo.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Configure Plugins</h3>
                <p className="text-sm text-gray-600">
                  Optionally expand the plugins panel to enable or disable specific SVGO
                  optimizations. Toggle multipass for deeper optimization.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download Result</h3>
                <p className="text-sm text-gray-600">
                  Click Optimize SVG, review the size reduction stats and before/after preview,
                  then copy or download your optimized file.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
