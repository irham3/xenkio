import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/data/tools';
import { AspectRatioCalculatorClient } from './client';

const slug = 'aspect-ratio-calculator';

export const metadata: Metadata = {
    title: 'Aspect Ratio Calculator | Resize Images, Video, and Layouts',
    description:
        'Calculate aspect ratios, simplify dimensions, and resize images or videos while preserving proportions. Includes common presets and CSS aspect-ratio output.',
    keywords: [
        'aspect ratio calculator',
        'image ratio calculator',
        'video aspect ratio',
        'resize image ratio',
        'calculate missing width height',
        'css aspect ratio',
        '16:9 calculator',
        '9:16 calculator',
    ],
    openGraph: {
        title: 'Aspect Ratio Calculator | Xenkio Tools',
        description:
            'Simplify ratios and calculate resized dimensions for images, videos, thumbnails, and layouts.',
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
            'Simplify width and height into the smallest ratio',
            'Calculate missing width or height while preserving aspect ratio',
            'Common image, video, and social media presets',
            'CSS aspect-ratio and padding fallback output',
            'Copy dimensions and ratio values instantly',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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

            <section className="container mx-auto px-4 max-w-5xl pb-16">
                <AspectRatioCalculatorClient />
            </section>

            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How Aspect Ratios Work
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    An aspect ratio describes the proportional relationship between
                                    width and height. A 1920 x 1080 video reduces to 16:9 because
                                    both numbers can be divided by 120.
                                </p>
                                <p>
                                    To resize without distortion, keep the same ratio. If the width
                                    changes, height is calculated as width divided by the ratio.
                                    If height changes, width is calculated as height multiplied by
                                    the ratio.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Common Uses
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 leading-relaxed">
                                <li>Resize images for thumbnails, banners, and blog graphics</li>
                                <li>Plan video exports for YouTube, Reels, Shorts, and Stories</li>
                                <li>Keep UI mockups, cards, and media containers proportional</li>
                                <li>Generate CSS aspect-ratio values for responsive layouts</li>
                                <li>Find the closest common ratio for custom dimensions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
