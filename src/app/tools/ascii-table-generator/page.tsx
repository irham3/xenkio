import { Metadata } from 'next';
import AsciiTableGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'ASCII Table Generator | Convert CSV to Plain Text Tables',
  description:
    'Generate clean ASCII tables from CSV, TSV, semicolon-separated, or pipe-separated data. Copy plain text tables for READMEs, terminals, docs, and tickets.',
  keywords: [
    'ascii table generator',
    'csv to ascii table',
    'plain text table',
    'terminal table',
    'readme table generator',
    'text table generator',
  ],
  openGraph: {
    title: 'ASCII Table Generator | Free Plain Text Table Tool',
    description:
      'Convert delimited data into clean ASCII tables with header rows, alignment, wrapping, and copy/download output.',
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

export default function AsciiTableGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ASCII Table Generator',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Generate clean ASCII tables from CSV, TSV, semicolon-separated, or pipe-separated data.',
    featureList: [
      'CSV, TSV, semicolon, and pipe input',
      'Automatic delimiter detection',
      'Header row support',
      'Column alignment options',
      'Long cell wrapping',
      'Copy and TXT download',
      'Client-side processing',
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
              ASCII Table Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert delimited data into clean plain text tables for terminals, READMEs, docs, and tickets
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl">
        <AsciiTableGeneratorClient />
      </section>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Plain Text Table Output</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">ASCII Borders</strong> | Generate tables with
                  plus, dash, and pipe characters that render reliably in terminals, source comments,
                  README files, and support tickets.
                </p>
                <p>
                  <strong className="text-gray-800">Column Wrapping</strong> | Keep wide content readable
                  by setting a maximum column width. Long cells wrap into multiple table lines.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Flexible Input</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Delimiter Detection</strong> | Paste CSV, TSV,
                  semicolon-separated, or pipe-separated text and let the tool pick the likely delimiter.
                </p>
                <p>
                  <strong className="text-gray-800">Private by Design</strong> | Everything runs locally
                  in your browser, so the data you paste never leaves your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
