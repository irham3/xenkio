import { Metadata } from 'next';
import { FaceAnonymizerClient } from './client';
import { UserFocus, Shield, DownloadSimple } from '@phosphor-icons/react/dist/ssr';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';

const slug = 'face-anonymizer';

export const metadata: Metadata = {
    title: 'Face Anonymizer — Blur or Pixelate Faces Online Free',
    description:
        'Automatically detect and anonymize faces in photos. Apply blur or pixelate effect to all faces or only selected ones. 100% free, runs entirely in your browser.',
    keywords: [
        'face anonymizer',
        'blur faces online',
        'pixelate faces',
        'face blur tool',
        'anonymize photo',
        'hide face in photo',
        'face detection blur',
        'privacy photo tool',
        'online face blurring free',
    ],
    openGraph: {
        title: 'Face Anonymizer | Blur & Pixelate Faces Online — Xenkio',
        description:
            'Detect faces automatically and blur or pixelate them. Free, private, runs in your browser — no upload needed.',
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

export default function FaceAnonymizerPage() {
    const tool = TOOLS.find((t) => t.slug === slug);
    if (!tool) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Face Anonymizer',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Automatically detect and anonymize faces in photos. Apply blur or pixelate effect to all faces or only selected ones. 100% free and private.',
        featureList: [
            'Automatic face detection',
            'Blur effect with adjustable intensity',
            'Pixelate effect with adjustable block size',
            'Apply to all or selected faces',
            '100% client-side — no server upload',
            'Full-resolution PNG download',
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero */}
            <section className="bg-white pt-16 pb-12">
                <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                        Face Anonymizer
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Automatically detect faces in any photo and blur or pixelate them — all
                        inside your browser, nothing ever uploaded.
                    </p>
                </div>
            </section>

            {/* Tool */}
            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <FaceAnonymizerClient />
            </section>

            {/* Feature highlights */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            {
                                Icon: UserFocus,
                                title: 'AI-Powered Detection',
                                body: 'BlazeFace model detects every face in the photo automatically — no manual regions needed.',
                            },
                            {
                                Icon: Shield,
                                title: 'Fully Private',
                                body: 'Your image never leaves the browser. All face detection and anonymization happens locally on your device.',
                            },
                            {
                                Icon: DownloadSimple,
                                title: 'Full-Resolution Output',
                                body: 'Download the anonymized image at the original resolution as a lossless PNG file.',
                            },
                        ].map(({ Icon, title, body }) => (
                            <div key={title} className="p-6 space-y-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                    <Icon className="w-6 h-6 text-primary-500"/>
                                </div>
                                <h3 className="font-bold text-gray-900">{title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEO content */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-16">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                Why Anonymize Faces in Photos?
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Publishing photos on the web, in reports, or on social media without
                                consent can violate privacy laws such as GDPR. Blurring or
                                pixelating faces is the simplest way to protect the identity of
                                individuals who did not consent to being photographed or shared.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Journalists, researchers, event photographers, and content creators
                                regularly need to anonymize photos before publishing them. Our tool
                                makes this effortless — upload once, get a privacy-safe image in
                                seconds.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                Blur vs. Pixelate — Which to Choose?
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900">🌫️ Gaussian Blur</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Applies a smooth, soft blur that obscures facial features
                                        while looking natural. Works well for news articles, social
                                        posts, and anywhere you want the anonymization to be subtle.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900">🟦 Pixelate</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Replaces face regions with large colored blocks. Gives a
                                        recognizable &quot;censored&quot; look often used in TV production and
                                        official documents.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                How to Use the Face Anonymizer
                            </h2>
                            <ol className="space-y-4 list-decimal list-inside text-gray-600">
                                <li className="leading-relaxed">
                                    <strong className="text-gray-900">Upload your photo</strong> —
                                    drag and drop or click to select a JPG, PNG, or WebP file.
                                </li>
                                <li className="leading-relaxed">
                                    <strong className="text-gray-900">Faces are detected automatically</strong>{' '}
                                    — numbered bounding boxes appear on each face found.
                                </li>
                                <li className="leading-relaxed">
                                    <strong className="text-gray-900">Choose an effect</strong> —
                                    select Blur or Pixelate and adjust the intensity with the slider.
                                </li>
                                <li className="leading-relaxed">
                                    <strong className="text-gray-900">Pick which faces to anonymize</strong>{' '}
                                    — use &quot;All Faces&quot; to process everything, or switch to
                                    &quot;Selected&quot; and click individual face boxes to choose.
                                </li>
                                <li className="leading-relaxed">
                                    <strong className="text-gray-900">Download</strong> — save the
                                    full-resolution anonymized PNG to your device.
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
