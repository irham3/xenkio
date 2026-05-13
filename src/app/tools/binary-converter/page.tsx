import { Metadata } from 'next';
import BinaryConverterClient from './client';

export const metadata: Metadata = {
  title: 'Binary Converter – Text to Binary & Binary to Text | Free Online Tool',
  description:
    'Convert text to binary code or decode binary back to text instantly. Supports UTF-8, emoji, and multiple byte separators. Free, fast, and works entirely in your browser.',
  keywords: [
    'binary converter',
    'text to binary',
    'binary to text',
    'binary decoder',
    'binary encoder',
    'ascii to binary',
    'binary code translator',
    'text binary converter online',
    'utf-8 binary converter',
  ],
  openGraph: {
    title: 'Binary Converter – Text to Binary & Binary to Text',
    description:
      'Convert text to binary or decode binary back to text instantly. Supports ASCII, Unicode, emoji and custom byte separators.',
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

export default function BinaryConverterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Binary Converter – Text to Binary & Binary to Text',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Convert plain text to binary code or decode binary strings back to readable text. Supports ASCII, full UTF-8 (including emoji), and multiple byte separator styles.',
    featureList: [
      'Text to binary conversion',
      'Binary to text decoding',
      'Full UTF-8 / Unicode support',
      'Customisable byte separators (space, dash, none)',
      'Swap input/output in one click',
      'Real-time execution timing',
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
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Binary Converter
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Translate any text into binary code and back again. Supports ASCII, full Unicode, and emoji — no server required.
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <BinaryConverterClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is Binary Code?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Binary code</strong> is the fundamental language of computers — every piece of data is ultimately stored and processed as a sequence of <strong className="text-gray-800">0</strong>s and <strong className="text-gray-800">1</strong>s.
                </p>
                <p>
                  Each character in a text is represented by its <strong className="text-gray-800">ASCII or UTF-8 code point</strong>, then expressed as an 8-bit (1-byte) binary number. For example, the letter <code className="bg-gray-100 px-1 rounded text-xs">A</code> has code point 65, which is <code className="bg-gray-100 px-1 rounded text-xs">01000001</code> in binary.
                </p>
                <p>
                  Multi-byte Unicode characters (accented letters, CJK, emoji) use 2–4 bytes each in UTF-8 encoding, so they produce 2–4 binary groups.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Text → Binary</strong> | Type or paste any text, choose a byte separator (space, dash, or none), then click <em>Convert to Binary</em>. Each character is converted to its UTF-8 byte sequence in binary.
                </p>
                <p>
                  <strong className="text-gray-800">Binary → Text</strong> | Paste a binary string (space-separated, dash-separated, or a continuous stream of 8-bit groups) and click <em>Convert to Text</em>. The tool decodes it as UTF-8 and shows the original text.
                </p>
                <p>
                  Use the <strong className="text-gray-800">Swap</strong> button to instantly flip the output back as new input for the reverse conversion.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Byte Separators Explained</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Space</strong> (default) — each 8-bit byte is separated by a single space, e.g. <code className="bg-gray-100 px-1 rounded text-xs">01001000 01101001</code>.
                </p>
                <p>
                  <strong className="text-gray-800">Dash</strong> — bytes are joined with a hyphen, e.g. <code className="bg-gray-100 px-1 rounded text-xs">01001000-01101001</code>. Useful for URL-safe representations.
                </p>
                <p>
                  <strong className="text-gray-800">None</strong> — bytes are concatenated without any separator, producing a continuous binary stream, e.g. <code className="bg-gray-100 px-1 rounded text-xs">0100100001101001</code>.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Common Use Cases</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Education</strong> — learn how computers represent text at the bit level, understand character encoding standards like ASCII and UTF-8.
                </p>
                <p>
                  <strong className="text-gray-800">Debugging</strong> — inspect the exact byte representation of strings to spot encoding issues or null bytes hiding in data.
                </p>
                <p>
                  <strong className="text-gray-800">CTF & Puzzles</strong> — quickly encode or decode binary messages in Capture-The-Flag competitions and cryptography challenges.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
