import { Metadata } from 'next';
import SlugGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'Slug Generator | Create URL-Friendly Slugs Online',
  description: 'Generate clean, URL-friendly slugs from any text. Supports custom separators, max length, and multiple formats. Free online slug generator tool.',
  keywords: ['slug generator', 'url slug', 'url friendly', 'seo slug', 'permalink generator', 'slug converter', 'text to slug'],
  openGraph: {
    title: 'Slug Generator | Free Online URL Slug Generator',
    description: 'Generate clean, URL-friendly slugs from any text instantly. Supports hyphens, underscores, and dots.',
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

export default function SlugGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Slug Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Generate clean, URL-friendly slugs from any text.",
    "featureList": ["Hyphen separator", "Underscore separator", "Dot separator", "Lowercase conversion", "Max length control", "Accent removal"]
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
              Slug Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Generate clean, URL-friendly slugs from any text with custom separators and formatting
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <SlugGeneratorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is a URL Slug?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  A <strong className="text-gray-800">URL slug</strong> is the part of a web address that identifies a page in a readable format.
                  It&apos;s typically derived from a page title and made URL-friendly by removing special characters.
                </p>
                <p>
                  Good slugs are <strong className="text-gray-800">short, descriptive, and lowercase</strong>.
                  They improve SEO and make links easier to read and share.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Separator Formats</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Hyphens (-)</strong> | The most common and SEO-recommended separator.
                  Used by most CMS platforms and blogs.
                </p>
                <p>
                  <strong className="text-gray-800">Underscores (_)</strong> | Common in file naming and some APIs.
                  Not recommended for SEO as Google treats them differently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
