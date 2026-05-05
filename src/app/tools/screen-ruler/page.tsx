import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import { ScreenRulerClient } from './client';

const slug = 'screen-ruler';

export const metadata: Metadata = {
    title: 'Screen Ruler | Measure Objects in Screenshots Online',
    description:
        'Measure objects in screenshots or screen captures with pixel rulers, line and box measurements, real-world calibration, and exportable results. Everything runs in your browser.',
    keywords: [
        'screen ruler',
        'screen measurement tool',
        'measure object in screenshot',
        'pixel ruler online',
        'image measurement tool',
        'browser ruler',
        'calibrated ruler online',
        'screenshot measurement',
    ],
    openGraph: {
        title: 'Screen Ruler | Xenkio Tools',
        description:
            'Capture, upload, or paste a screenshot and measure objects with pixel rulers, calibration, and exportable overlays.',
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
        title: 'Screen Ruler | Free Online Tool',
        description:
            'Measure distances, boxes, and object sizes in screenshots locally in your browser.',
        images: ['/og-image.jpg'],
    },
};

export default function ScreenRulerPage() {
    const tool = TOOLS.find((item) => item.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Screen Ruler',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Capture a screen, window, or browser tab',
            'Upload or paste screenshots and images',
            'Measure straight-line distance in pixels',
            'Measure object width, height, and area with boxes',
            'Calibrate measurements to millimeters, centimeters, or inches',
            'Export the image with measurement overlays',
            'No server upload, all processing happens in the browser',
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
                <div className="container mx-auto px-4 pt-16 pb-10 max-w-5xl">
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

            <section className="container mx-auto px-4 max-w-7xl pb-16">
                <ScreenRulerClient />
            </section>

            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Screenshot Measurement
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Capture or Upload:</strong>{' '}
                                    Use a screen capture, pasted image, or uploaded screenshot as the measuring surface.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Measure Objects:</strong>{' '}
                                    Draw ruler lines for distances or boxes for object width, height, and area.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Export Results:</strong>{' '}
                                    Download a marked PNG with your measurement overlays included.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Private Calibration
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Pixel Accurate:</strong>{' '}
                                    Rulers and coordinates are based on the source image pixels.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Real Units:</strong>{' '}
                                    Draw a reference line with a known size to convert later measurements to mm, cm, or inches.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Local Only:</strong>{' '}
                                    Screenshots and images stay on your device and are never uploaded.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
