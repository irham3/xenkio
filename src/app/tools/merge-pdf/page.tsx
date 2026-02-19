

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { MergePdfClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'merge-pdf';

export const metadata: Metadata = {
  title: 'Merge PDF Online Free - Combine Multiple PDFs Instantly',
  description: 'Combine multiple PDF files into one document. Drag to reorder, rotate pages, customize output. Fast, free, and secure PDF merger tool.',
  keywords: ['merge pdf', 'combine pdf', 'pdf merger', 'join pdf', 'merge pdf online', 'pdf combiner', 'free pdf merger'],
  openGraph: {
    title: 'Merge PDF Online Free | Xenkio',
    description: 'Combine multiple PDF files into one document instantly with our free PDF merger tool.',
    type: 'website',
  }
};

export default function MergePdfPage() {
  const tool = TOOLS.find(t => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Merge PDF",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": tool.description,
    "featureList": [
      "Combine multiple PDFs",
      "Drag and drop reordering",
      "Secure client-side processing",
      "Fast and free"
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Tool Header */}
      <div className="text-center mb-12">

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
      </div>

      {/* Feature UI (Client Component) */}
      <MergePdfClient />
    </div>
  );
}
