import { Metadata } from 'next';
import CssMinifierClient from './client';

export const metadata: Metadata = {
  title: 'CSS Minifier & Beautifier | Free Online CSS Compressor',
  description: 'Minify and beautify CSS code instantly. Free online tool that removes comments, whitespace, and optimizes your stylesheets for production. No signup required.',
  keywords: ['css minifier', 'css compressor', 'minify css online', 'css beautifier', 'css formatter', 'compress css', 'optimize css', 'reduce css file size'],
  openGraph: {
    title: 'CSS Minifier & Beautifier | Free Online Tool',
    description: 'Minify and beautify CSS code instantly. Remove comments and whitespace to optimize stylesheets. 100% client-side processing.',
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
    title: 'CSS Minifier & Beautifier',
    description: 'Minify and beautify CSS code instantly. Optimize your stylesheets for production.',
    images: ['/og-image.jpg'],
  },
};

export default function CssMinifierPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CSS Minifier",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Minify and beautify CSS code instantly. Free online tool that removes comments and whitespace.",
    "featureList": [
      "Minify CSS",
      "Beautify CSS",
      "Remove comments",
      "Compression statistics"
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
        <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              CSS Minifier
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Minify and beautify your CSS code to optimize file size and improve readability
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <CssMinifierClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Why Minify CSS?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Performance</strong> | Minified CSS reduces file size by removing
                  unnecessary characters, leading to faster page load times and better user experience.
                </p>
                <p>
                  <strong className="text-gray-800">Bandwidth</strong> | Smaller CSS files consume less bandwidth,
                  which is especially important for mobile users and sites with high traffic.
                </p>
                <p>
                  <strong className="text-gray-800">Production Ready</strong> | Minification is a standard step in
                  preparing stylesheets for production deployment, ensuring optimal delivery.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Features</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Comment Removal</strong> | Automatically strips all CSS comments
                  to reduce file size without affecting functionality.
                </p>
                <p>
                  <strong className="text-gray-800">Whitespace Optimization</strong> | Removes unnecessary spaces,
                  newlines, and tabs while preserving the correct CSS syntax.
                </p>
                <p>
                  <strong className="text-gray-800">Beautification</strong> | Format minified CSS back into readable
                  code with proper indentation and structure for development.
                </p>
              </div>
            </div>
          </div>

          {/* Additional SEO Content */}
          <div className="mt-12 pt-12 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How to Use the CSS Minifier</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Paste Your CSS</h3>
                <p className="text-sm text-gray-600">
                  Paste your CSS code into the input field or load a sample to see how the minifier works.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Action</h3>
                <p className="text-sm text-gray-600">
                  Select Minify to compress your CSS or Beautify to format it with proper indentation, then click the action button.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Copy or Download</h3>
                <p className="text-sm text-gray-600">
                  Copy the result to your clipboard or download it as a CSS file ready for use in your project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
