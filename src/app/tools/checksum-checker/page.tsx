import { Metadata } from 'next';
import ChecksumCheckerClient from './client';

export const metadata: Metadata = {
    title: 'Checksum Checker | MD5, SHA-256, SHA-512, CRC32 File Verification',
    description:
        'Verify file integrity by computing MD5, SHA-1, SHA-256, SHA-512, and CRC32 checksums instantly. Drag and drop any file — 100% client-side, nothing uploaded to any server.',
    keywords: [
        'checksum checker',
        'file checksum',
        'md5 checksum',
        'sha256 checksum',
        'sha512 checksum',
        'crc32 checker',
        'file integrity verification',
        'hash checker',
        'file hash',
    ],
    openGraph: {
        title: 'Checksum Checker | File Integrity Verification',
        description:
            'Compute and verify file checksums (MD5, SHA-256, SHA-512, CRC32) directly in your browser. No upload required.',
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
        title: 'Checksum Checker | File Integrity Verification',
        description:
            'Compute and verify file checksums (MD5, SHA-256, SHA-512, CRC32) directly in your browser.',
        images: ['/og-image.jpg'],
    },
};

export default function ChecksumCheckerPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Checksum Checker',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Compute MD5, SHA-1, SHA-256, SHA-512, and CRC32 checksums for any file. Verify file integrity by comparing against a known hash.',
        featureList: [
            'MD5, SHA-1, SHA-256, SHA-512, CRC32 support',
            'Drag & drop file upload',
            'Instant checksum computation',
            'Inline hash verification',
            '100% client-side — no file uploads',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Checksum Checker
                        </h1>
                        <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                            Drop any file to instantly compute MD5, SHA-1, SHA-256, SHA-512, and CRC32 checksums.
                            Paste an expected hash to verify file integrity — all in your browser.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool */}
            <section className="container mx-auto px-4 max-w-5xl pb-16">
                <ChecksumCheckerClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Why Verify File Checksums?</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Detect tampering</strong> — A checksum mismatch
                                    means the file was modified after the hash was published, either by corruption,
                                    a man-in-the-middle attack, or a fake mirror.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Confirm integrity</strong> — Software
                                    developers publish checksums alongside downloads so you can confirm the installer
                                    you received is byte-for-byte identical to what they shipped.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Which Algorithm Should I Use?</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">SHA-256</strong> — Best choice for modern
                                    software verification. Used by Linux distributions, Python, and most open-source
                                    projects.
                                </p>
                                <p>
                                    <strong className="text-gray-800">MD5 / CRC32</strong> — Faster but not
                                    collision-resistant. Fine for detecting accidental corruption, not for security.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
