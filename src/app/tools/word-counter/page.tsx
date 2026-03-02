import { Metadata } from 'next';
import WordCounterClient from './client';

export const metadata: Metadata = {
  title: 'Word Counter | Count Words, Characters & Sentences Online',
  description: 'Count words, characters, sentences, and paragraphs instantly. Get reading time estimates and keyword density analysis. Free online word counter tool.',
  keywords: ['word counter', 'character counter', 'sentence counter', 'reading time', 'keyword density', 'text analysis'],
  openGraph: {
    title: 'Word Counter | Free Online Word & Character Counter',
    description: 'Count words, characters, sentences, and paragraphs. Get reading time and keyword density.',
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

export default function WordCounterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Word Counter",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Count words, characters, sentences, and paragraphs instantly. Get reading time estimates and keyword density analysis.",
    "featureList": [
      "Word counting",
      "Character counting",
      "Sentence counting",
      "Reading time estimation",
      "Keyword density analysis"
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
              Word Counter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Count words, characters, sentences, and paragraphs with reading time estimates
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <WordCounterClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Text Analysis Features</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Word & Character Count</strong> | Get instant counts
                  of words and characters as you type. Track characters with and without spaces for precise formatting.
                </p>
                <p>
                  <strong className="text-gray-800">Reading & Speaking Time</strong> | Estimate how long it
                  takes to read or speak your text based on average speeds of 200 and 130 words per minute.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Advanced Insights</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Keyword Density</strong> | Discover the most frequent
                  words in your text. Useful for SEO optimization and content analysis.
                </p>
                <p>
                  <strong className="text-gray-800">Sentence & Paragraph Count</strong> | Analyze the
                  structure of your text with sentence and paragraph breakdowns for better readability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
