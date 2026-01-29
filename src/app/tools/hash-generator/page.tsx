import { Metadata } from 'next';
import HashGeneratorClient from './client';

export const metadata: Metadata = {
  title: 'Hash Generator | MD5, SHA256, Bcrypt, Argon2 Online Tool',
  description: 'Generate secure hashes instantly. Supports MD5, SHA-1, SHA-256, SHA-512, Bcrypt, Argon2id, and RIPEMD-160. Includes salt support and verification.',
  keywords: ['hash generator', 'md5 generator', 'sha256 generator', 'bcrypt generator', 'argon2 generator', 'online hasher', 'hash verifier', 'password hasher'],
  openGraph: {
    title: 'Hash Generator | Secure Online Hashing Tool',
    description: 'Generate and verify hashes instantly. Supports modern algorithms like Bcrypt and Argon2 along with classics like MD5 and SHA.',
    type: 'website',
  },
};

export default function HashGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 pb-2">
          Advanced Hash Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Generate cryptographic hashes instantly. Support for all major algorithms including MD5, SHA family, Bcrypt, and Argon2. Secure, client-side execution.
        </p>
      </div>

      <HashGeneratorClient />

      {/* SEO Content */}
      <div className="mt-24 grid gap-12 max-w-4xl mx-auto text-gray-600">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Supported Hashing Algorithms</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Modern Password Hashing</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Argon2id:</strong> The winner of the Password Hashing Competition. Use this for new password storage. Memory-hard and resistant to GPU attacks.</li>
                <li><strong>Bcrypt:</strong> The standard for many years. Adaptive and salt-aware. Still excellent for most use cases.</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">General Purpose & Checksums</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>SHA-256 & SHA-512:</strong> Secure standards for digital signatures, file integrity, and authentication.</li>
                <li><strong>MD5 & SHA-1:</strong> Fast algorithms. broken collision resistance but useful for non-security checksums.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900">Why Use This Tool?</h2>
          <p>
            This tool runs entirely in your browser using client-side JavaScript and WebAssembly.
            <strong>Your input text never leaves your device</strong>, ensuring maximum privacy even for sensitive data checks.
            We use <code className="bg-gray-100 px-1 py-0.5 rounded">crypto-js</code> for standard algorithms and
            <code className="bg-gray-100 px-1 py-0.5 rounded">hash-wasm</code> for high-performance implementation of modern hashes like Argon2.
          </p>
        </section>
      </div>
    </div>
  );
}
