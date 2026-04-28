import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { ScreenRulerClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'screen-ruler';

export const metadata: Metadata = {
    title: 'Screen Ruler – Measure Pixels, CM & Inches On-Screen | Xenkio',
    description:
        'Free online screen ruler. Measure anything on your screen in pixels, centimeters, millimeters, or inches. Add guide lines, use a measurement tool, and calibrate DPI for accurate real-world sizes.',
    keywords: [
        'screen ruler',
        'pixel ruler',
        'on screen ruler',
        'measure screen',
        'pixel measurement',
        'screen measurement tool',
        'ruler online',
        'measure pixels',
        'cm ruler online',
        'screen size tool',
    ],
    openGraph: {
        title: 'Screen Ruler | Xenkio – Measure Anything On-Screen',
        description:
            'Instantly measure pixels, CM, MM, or inches on your screen. Drag guides, use the measurement tool, and calibrate DPI — all in your browser.',
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

export default function ScreenRulerPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Screen Ruler',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Horizontal and vertical ruler bars',
            'Draggable guide lines',
            'Click-drag measurement tool',
            'Units: px, cm, mm, in',
            'DPI calibration',
            'Real-time crosshair',
            'Width, height, and diagonal measurement',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-16 pb-10 max-w-5xl">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            {tool.title}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {tool.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool */}
            <section className="container mx-auto px-4 pb-16 max-w-5xl">
                <ScreenRulerClient />
            </section>

            {/* SEO content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How to use the Screen Ruler
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">Add guides:</strong> Drag
                                    from the top ruler to create a horizontal guide, or from the
                                    left ruler for a vertical guide. Hover a guide to move or
                                    delete it.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Measure distance:</strong>{' '}
                                    Click &quot;Measure&quot; in the toolbar, then click-drag on
                                    the canvas. The tool shows width, height, and diagonal
                                    distance in real time.
                                </p>
                                <p>
                                    <strong className="text-gray-800">Switch units:</strong> Use
                                    the px / cm / mm / in buttons to see measurements in the
                                    unit you need.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">DPI Calibration</h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    The ruler auto-detects your screen DPI on load. For accurate
                                    physical measurements (cm, mm, inch), verify the DPI field
                                    matches your actual display.
                                </p>
                                <p>
                                    Common values: <strong className="text-gray-800">96 dpi</strong> (standard desktop),{' '}
                                    <strong className="text-gray-800">144 dpi</strong> (1.5× HiDPI),{' '}
                                    <strong className="text-gray-800">192 dpi</strong> (2× Retina).
                                </p>
                                <p>
                                    All processing happens entirely in your browser — nothing is
                                    sent to any server.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
