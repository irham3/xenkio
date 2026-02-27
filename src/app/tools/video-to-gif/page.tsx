import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { VideoToGifClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'video-to-gif';

export const metadata: Metadata = {
    title: 'Video to GIF Converter | Free Online, No Upload Required',
    description: 'Convert video files (MP4, WebM, MOV) to animated GIFs directly in your browser. Trim clips, adjust FPS and resolution. No upload, no watermark, 100% private.',
    keywords: [
        'video to gif',
        'video to gif converter',
        'mp4 to gif',
        'convert video to gif',
        'gif maker',
        'online gif converter',
        'free gif maker',
        'video gif maker online',
        'konversi video ke gif',
        'ubah video jadi gif',
    ],
    openGraph: {
        title: 'Video to GIF Converter | Xenkio Tools',
        description: 'Convert any video to animated GIF. Trim, adjust quality, and download instantly. 100% client-side.',
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
        title: 'Video to GIF Converter | Free Online Tool',
        description: 'Convert MP4, WebM, MOV to GIF in your browser. No upload needed.',
      images: ['/og-image.jpg'],

    },
};

export default function VideoToGifPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Video to GIF Converter',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Convert MP4, WebM, MOV, AVI, MKV to GIF',
            'Trim video clips with start time and duration',
            'Adjustable frame rate (5-30 fps)',
            'Adjustable width (160-1280px)',
            'Quality presets (Low, Medium, High, Ultra)',
            'Two-pass palette generation for high quality',
            'No server upload | 100% client-side',
            'Instant download, no watermarks',
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
                <VideoToGifClient />
            </section>

            {/* SEO Content */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                How It Works
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">1. Upload:</strong>{' '}
                                    Drag and drop your video file or click to browse. Supports MP4, WebM, MOV, AVI, and MKV formats up to 500MB.
                                </p>
                                <p>
                                    <strong className="text-gray-800">2. Trim & Adjust:</strong>{' '}
                                    Select the portion of video you want to convert. Adjust frame rate and resolution using presets or custom sliders.
                                </p>
                                <p>
                                    <strong className="text-gray-800">3. Convert & Download:</strong>{' '}
                                    Click convert and your GIF is created instantly in your browser. Download with no watermarks.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Why Use This Tool?
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    <strong className="text-gray-800">100% Private:</strong>{' '}
                                    Your video never leaves your device. All processing happens directly in your browser using WebAssembly.
                                </p>
                                <p>
                                    <strong className="text-gray-800">High Quality:</strong>{' '}
                                    Uses two-pass palette generation for optimal GIF colors, producing sharper results than most online converters.
                                </p>
                                <p>
                                    <strong className="text-gray-800">No Limits:</strong>{' '}
                                    No file count limits, no daily caps, no sign-up required. Convert as many videos as you need.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
