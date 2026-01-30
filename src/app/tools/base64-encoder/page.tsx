import { Metadata } from 'next';
import Base64EncoderClient from './client';

export const metadata: Metadata = {
  title: 'Base64 Encoder & Decoder | Online Tool',
  description: 'Encode text to Base64 or decode Base64 strings instantly. Supports URL-safe encoding (RFC 4648). Free online tool with live preview.',
  keywords: ['base64 encoder', 'base64 decoder', 'base64 converter', 'base64 online', 'encode base64', 'decode base64', 'url safe base64'],
  openGraph: {
    title: 'Base64 Encoder & Decoder | Online Tool',
    description: 'Encode and decode Base64 strings instantly with live preview. Supports URL-safe encoding.',
    type: 'website',
  },
};

export default function Base64EncoderPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Base64 Encoder & Decoder
            </h1>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <Base64EncoderClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is Base64?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Base64</strong> is a binary-to-text encoding scheme that represents 
                  binary data in an ASCII string format. It&apos;s commonly used for encoding data in URLs, 
                  email attachments, and storing complex data in text-only systems.
                </p>
                <p>
                  The encoding uses 64 characters: A-Z, a-z, 0-9, and two additional characters 
                  (typically + and /) plus = for padding.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">URL-Safe Base64</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">URL-safe Base64 (RFC 4648)</strong> replaces + with - and / with _ 
                  to make the encoded string safe for use in URLs and filenames without requiring 
                  percent-encoding.
                </p>
                <p>
                  This variant also omits the trailing = padding characters, 
                  making it more compact for use in query strings and path segments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
