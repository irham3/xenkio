import { Metadata } from 'next';
import LineNumbererClient from './client';

export const metadata: Metadata = {
  title: 'Line Numberer | Add or Remove Line Numbers',
  description:
    'Add numbered prefixes to every line or remove copied line numbers from text and code snippets. Clean up blog snippets and lists instantly in your browser.',
  keywords: [
    'line numberer',
    'add line numbers',
    'remove line numbers',
    'strip line numbers',
    'number lines online',
    'code snippet cleaner',
    'text line numbering',
  ],
  openGraph: {
    title: 'Line Numberer | Add or Remove Line Numbers',
    description:
      'Prefix each line with 1., 2., 3. or strip copied line numbers from code snippets and text.',
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

export default function LineNumbererPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Line Numberer',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Add numbered prefixes to every line or remove copied line numbers from text and code snippets.',
    featureList: [
      'Add 1., 2., 3. prefixes to every line',
      'Remove common line number prefixes',
      'Clean code snippets copied from blogs',
      'Client-side text processing',
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Line Numberer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Add line numbers to text or remove copied numbering from code snippets, lists, and notes.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl">
        <LineNumbererClient />
      </section>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Add Line Numbers</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Quick Numbered Lists</strong> | Prefix each line with sequential
                  numbers such as <code>1.</code>, <code>2.</code>, and <code>3.</code> for drafts, instructions, or
                  checklist-style text.
                </p>
                <p>
                  <strong className="text-gray-800">Code and Notes</strong> | Add visible line references before sharing
                  snippets, logs, or meeting notes with teammates.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Remove Copied Prefixes</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Clean Blog Snippets</strong> | Strip common prefixes like
                  <code>1.</code>, <code>1)</code>, <code>1:</code>, <code>1 |</code>, and <code>[1]</code> from copied
                  code without manually editing every line.
                </p>
                <p>
                  <strong className="text-gray-800">Private by Default</strong> | All processing happens locally in your
                  browser, so pasted text never needs to leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
