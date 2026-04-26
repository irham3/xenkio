import { Metadata } from 'next';
import ChmodCalculatorClient from './client';

export const metadata: Metadata = {
  title: 'Chmod Calculator | Unix File Permission Calculator Online',
  description:
    'Calculate Unix file permissions with an interactive chmod calculator. Convert between octal, symbolic, and numeric formats. Supports special bits (sticky, setuid, setgid). Free online tool.',
  keywords: [
    'chmod calculator',
    'unix permissions',
    'file permissions',
    'octal permissions',
    'symbolic permissions',
    'linux chmod',
    'chmod 755',
    'chmod 644',
    'sticky bit',
    'setuid setgid',
    'linux file permissions',
    'chmod online',
  ],
  openGraph: {
    title: 'Chmod Calculator | Unix File Permission Calculator',
    description:
      'Instantly calculate Unix file permissions. Toggle read, write, execute bits for owner, group, and others. Get octal, symbolic, and command output.',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Chmod Calculator | Unix File Permission Calculator',
    description:
      'Calculate Unix file permissions online. Toggle bits, enter octal, get symbolic output instantly.',
    images: ['/og-image.jpg'],
  },
};

export default function ChmodCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Chmod Calculator',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Calculate Unix file permissions interactively. Convert between octal, symbolic, and numeric chmod values.',
    featureList: [
      'Interactive permission toggles',
      'Octal input',
      'Symbolic output (ls -la format)',
      'Special bits: sticky, setuid, setgid',
      'Common presets',
      'One-click copy',
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
        <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Chmod Calculator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calculate Unix file permissions instantly — toggle bits or enter an octal value
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-3xl">
        <ChmodCalculatorClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What is chmod?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">chmod</strong> (change mode) is a Unix command used to
                  set or change the access permissions of files and directories. Each file has three
                  permission groups: <strong className="text-gray-800">owner</strong>,{' '}
                  <strong className="text-gray-800">group</strong>, and{' '}
                  <strong className="text-gray-800">others</strong>.
                </p>
                <p>
                  Each group can independently be granted{' '}
                  <strong className="text-gray-800">read (r = 4)</strong>,{' '}
                  <strong className="text-gray-800">write (w = 2)</strong>, and{' '}
                  <strong className="text-gray-800">execute (x = 1)</strong> permissions. The values are
                  added together to form a single octal digit per group.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Octal vs Symbolic</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Octal notation</strong> (e.g., <code className="bg-gray-100 px-1 rounded">755</code>) is
                  the most common format used with the <code className="bg-gray-100 px-1 rounded">chmod</code> command.
                  Each digit represents the combined permission value for owner, group, and others respectively.
                </p>
                <p>
                  <strong className="text-gray-800">Symbolic notation</strong> (e.g., <code className="bg-gray-100 px-1 rounded">rwxr-xr-x</code>) is
                  displayed by <code className="bg-gray-100 px-1 rounded">ls -la</code> and shows each permission as
                  a letter or dash for easy reading.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Web Files (644)</h3>
                <p className="text-sm text-gray-600">
                  Standard permission for HTML, CSS, and config files. Owner can edit; server reads them.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Scripts &amp; Binaries (755)</h3>
                <p className="text-sm text-gray-600">
                  Owner has full control; group and others can read and execute the script.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">SSH Keys (600)</h3>
                <p className="text-sm text-gray-600">
                  Private key files must be readable only by the owner to satisfy SSH security checks.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Shared Directories (775)</h3>
                <p className="text-sm text-gray-600">
                  Group members can read and write; others can only read. Ideal for team collaboration.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Sticky Bit (/tmp)</h3>
                <p className="text-sm text-gray-600">
                  Prevents users from deleting files they do not own in shared directories like{' '}
                  <code className="bg-gray-100 px-1 rounded">/tmp</code>.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">SetUID Binaries</h3>
                <p className="text-sm text-gray-600">
                  Programs like <code className="bg-gray-100 px-1 rounded">passwd</code> run with the
                  owner&apos;s privileges regardless of who executes them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
