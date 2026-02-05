import { Metadata } from 'next';
import UnixTimestampClient from './client';
import { Clock } from 'lucide-react';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter | Epoch Time to Date Online Tool',
  description: 'Convert Unix timestamps to human-readable dates and vice versa. Supports seconds and milliseconds, multiple timezones, and various date formats. Free online tool.',
  keywords: [
    'unix timestamp',
    'epoch converter',
    'timestamp to date',
    'date to timestamp',
    'unix time converter',
    'epoch time',
    'javascript timestamp',
    'unix epoch online',
    'time converter',
    'datetime converter',
  ],
  openGraph: {
    title: 'Unix Timestamp Converter | Free Online Epoch Time Tool',
    description: 'Convert between Unix timestamps and human-readable dates instantly. Supports multiple timezones and formats.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unix Timestamp Converter',
    description: 'Convert Unix timestamps to dates and dates to timestamps online.',
  },
};

export default function UnixTimestampPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Unix Timestamp Converter",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Convert Unix timestamps to human-readable dates and vice versa. Supports multiple timezones.",
    "featureList": [
      "Timestamp to Date",
      "Date to Timestamp",
      "Seconds & Milliseconds",
      "Multiple timezones"
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
        <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
              <Clock className="w-3.5 h-3.5" />
              100% Client-Side Processing
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Unix Timestamp Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert between Unix timestamps and human-readable dates instantly
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <UnixTimestampClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is Unix Timestamp?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Unix timestamp</strong> (also known as Epoch time or POSIX time)
                  is a system for tracking time as a running total of seconds since the Unix Epoch —
                  January 1, 1970, at 00:00:00 UTC.
                </p>
                <p>
                  This simple representation makes it easy to store, compare, and calculate time differences
                  across different systems and programming languages without timezone confusion.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Seconds vs Milliseconds</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Seconds (10 digits)</strong> — Standard Unix timestamp used
                  by most Unix systems, databases like MySQL and PostgreSQL, and backend systems.
                </p>
                <p>
                  <strong className="text-gray-800">Milliseconds (13 digits)</strong> — Used by JavaScript
                  (<code className="bg-gray-100 px-1 rounded">Date.now()</code>), Java, and many modern APIs
                  for higher precision.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Database Queries</h3>
                <p className="text-sm text-gray-600">
                  Convert timestamps from database records to readable dates for debugging and analysis.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">API Development</h3>
                <p className="text-sm text-gray-600">
                  Generate timestamps for API requests and validate response timestamps.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Log Analysis</h3>
                <p className="text-sm text-gray-600">
                  Decode timestamp values in server logs and application traces.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">JWT Tokens</h3>
                <p className="text-sm text-gray-600">
                  Check expiration times (exp) and issued-at times (iat) in JSON Web Tokens.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Caching</h3>
                <p className="text-sm text-gray-600">
                  Calculate cache expiration times and verify TTL values.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Scheduling</h3>
                <p className="text-sm text-gray-600">
                  Plan cron jobs and scheduled tasks with precise timestamp values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
