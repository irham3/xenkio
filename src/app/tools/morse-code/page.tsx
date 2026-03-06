import { Metadata } from 'next';
import MorseCodeClient from './client';

export const metadata: Metadata = {
  title: 'Morse Code Encoder & Decoder | Free Online Tool',
  description: 'Convert text to Morse code or decode Morse code back to text instantly. Free online Morse code translator with real-time conversion.',
  keywords: ['morse code', 'morse code encoder', 'morse code decoder', 'morse code translator', 'morse code converter', 'text to morse', 'morse to text'],
  openGraph: {
    title: 'Morse Code Encoder & Decoder | Free Online Tool',
    description: 'Convert text to Morse code and decode Morse code back to text instantly. Free online tool with real-time conversion.',
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

export default function MorseCodePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Morse Code Encoder & Decoder",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Convert text to Morse code or decode Morse code back to text instantly. Free online Morse code translator.",
    "featureList": [
      "Encode text to Morse code",
      "Decode Morse code to text",
      "Real-time conversion",
      "Support for letters, numbers, and punctuation"
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
              Morse Code Encoder & Decoder
            </h1>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <MorseCodeClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is Morse Code?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Morse code</strong> is a character encoding system that represents letters and numbers as sequences of dots (.) and dashes (-). It was developed in the 1830s by Samuel Morse for use with the telegraph.
                </p>
                <p>
                  Each letter is separated by a space, and words are separated by a slash (/). Morse code is still used today in amateur radio, aviation, and emergency signaling such as the famous SOS signal (... --- ...).
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Encode</strong> | Enter any text in the input field and get the Morse code representation instantly. Supports letters, numbers, and common punctuation.
                </p>
                <p>
                  <strong className="text-gray-800">Decode</strong> | Paste Morse code using dots (.) and dashes (-), spaces between letters, and slashes (/) between words to convert it back to text.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
