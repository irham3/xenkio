import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { AspectRatioCalculatorClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'aspect-ratio-calculator';

export const metadata: Metadata = {
    title: 'Aspect Ratio Calculator | Calculate & Scale Image Dimensions',
    description:
        'Calculate the aspect ratio of any image or video dimensions instantly. Scale width/height while preserving the ratio. Supports 16:9, 4:3, 1:1, 21:9, and more.',
    keywords: [
        'aspect ratio calculator',
        'calculate aspect ratio',
        'image aspect ratio',
        'video aspect ratio',
        'scale dimensions',
        '16:9 calculator',
        'resize proportionally',
        'aspect ratio converter',
        'width height ratio',
        'kalkulator aspect ratio',
    ],
    openGraph: {
        title: 'Aspect Ratio Calculator | Xenkio Tools',
        description:
            'Calculate the aspect ratio of any dimensions and scale them proportionally. Supports all common ratios: 16:9, 4:3, 1:1, 21:9, 9:16, and more.',
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

export default function AspectRatioCalculatorPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Aspect Ratio Calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Calculate aspect ratio from any dimensions',
            'Scale dimensions while preserving aspect ratio',
            'Visual aspect ratio preview',
            'Common ratio presets (16:9, 4:3, 1:1, 21:9, 9:16)',
            'GCD calculation and reduced ratio',
            'Copy results to clipboard',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            {tool.title}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {tool.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-5xl pb-16">
                <AspectRatioCalculatorClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                What Is Aspect Ratio?
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Aspect ratio</strong> is the
                                    proportional relationship between the width and height of a
                                    rectangle, expressed as W:H (e.g., 16:9). It describes the shape
                                    of an image or screen without specifying the actual pixel count.
                                </p>
                                <p>
                                    <strong className="text-gray-800">How it is calculated:</strong>{' '}
                                    Divide both width and height by their Greatest Common Divisor (GCD).
                                    For example, 1920 × 1080 ÷ GCD(1920,1080) = 1920 ÷ 120 : 1080 ÷ 120
                                    = <strong>16:9</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                When to Use This
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Resizing images or videos without distortion</li>
                                    <li>Designing responsive layouts and thumbnails</li>
                                    <li>Cropping photos for social media (16:9, 9:16, 1:1)</li>
                                    <li>Matching video dimensions to a target resolution</li>
                                    <li>Checking if a design matches a standard display ratio</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Formula Reference
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    title: 'Aspect Ratio',
                                    desc: 'W ÷ GCD(W,H) : H ÷ GCD(W,H)',
                                },
                                {
                                    title: 'Scale Width',
                                    desc: 'New H = New W × (H / W)',
                                },
                                {
                                    title: 'Scale Height',
                                    desc: 'New W = New H × (W / H)',
                                },
                                {
                                    title: 'Decimal Ratio',
                                    desc: 'Width / Height',
                                },
                                {
                                    title: 'GCD (Euclidean)',
                                    desc: 'gcd(a,b) = gcd(b, a mod b)',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-4 bg-white rounded-xl border border-gray-200"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {item.title}
                                    </h3>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-primary font-mono">
                                        {item.desc}
                                    </code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
