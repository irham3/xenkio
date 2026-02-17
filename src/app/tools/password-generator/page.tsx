

import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import PasswordGeneratorClient from './client';
import { notFound } from 'next/navigation';

const slug = 'password-generator';

export const metadata: Metadata = {
  title: 'Strong Password Generator 2025 - Create Secure & Random Passwords',
  description: 'Generate customizable, cryptographically secure passwords instantly. Features include adjustable length, symbols, numbers, and ambiguous character exclusion. Best free random password generator.',
  keywords: ['password generator', 'random password generator', 'secure password', 'password strength checker', 'strong password', 'google password generator', 'password security', '2025'],
  openGraph: {
    title: 'Strong Password Generator 2025 | Xenkio',
    description: 'Create customizable, secure passwords instantly with our advanced generator tool.',
    type: 'website',
  }
};

export default function PasswordGeneratorPage() {
  const tool = TOOLS.find(t => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Password Generator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": tool.description,
    "featureList": [
      "Adjustable length",
      "Include/exclude characters",
      "Strong encryption",
      "One-click copy"
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
      <PasswordGeneratorClient />
    </div>
  );
}
