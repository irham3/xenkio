
import { Metadata } from 'next';
import ImageToBase64Client from './client';
import { ImageIcon, Zap, Shield, Code2 } from 'lucide-react';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'Image to Base64 Converter | Free Online Tool',
    description: 'Convert images to Base64 encoded strings instantly. Support for PNG, JPG, WebP, SVG, and more. Generate HTML and CSS snippets for easy embedding.',
    keywords: ['image to base64', 'convert image to base64', 'online image to base64', 'base64 image converter', 'png to base64', 'jpg to base64'],
    openGraph: {
        title: 'Image to Base64 Converter | Free Online Tool',
        description: 'Convert images to Base64 instantly. Perfect for web developers and designers.',
        type: 'website',
    },
};

export default function ImageToBase64Page() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Image to Base64 Converter",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Convert images to Base64 encoded strings instantly. Free online tool with support for various image formats.",
        "featureList": [
            "Convert PNG to Base64",
            "Convert JPG to Base64",
            "Convert SVG to Base64",
            "Generate HTML img snippets",
            "Generate CSS background-image code"
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="bg-white pt-16 pb-12">
                <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                        Image to Base64
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Transform your images into encoded strings for seamless web embedding.
                        Perfect for HTML, CSS, and API integrations.
                    </p>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <ImageToBase64Client />
            </section>

            {/* Feature Highlights */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <ImageIcon className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">All Formats</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Supports PNG, JPG, WebP, SVG, GIF, BMP, and ICO. No matter the format, we&apos;ve got you covered.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <Shield className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">Privacy First</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Your images are processed locally in your browser. They are never uploaded to our servers.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <Code2 className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">Code Snippets</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Get ready-to-use HTML img tags and CSS background-image properties instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Content Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-16">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                Why Use Base64 for Images?
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Base64 encoding allows you to embed image data directly into your HTML or CSS files.
                                This eliminates the need for browsers to make additional HTTP requests to fetch image files,
                                which can improve page load performance for small icons, logos, and UI elements.
                                It&apos;s also incredibly useful for email templates where external images might be blocked.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                                    <h4 className="font-bold text-gray-900 text-sm italic">Performance Tip</h4>
                                    <p className="text-xs text-gray-500">Only use Base64 for small images (under 10KB). Large files can significantly increase your CSS/HTML file size and slow down parsing.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                                    <h4 className="font-bold text-gray-900 text-sm italic">CSS Optimization</h4>
                                    <p className="text-xs text-gray-500">Embed icons directly in your stylesheet to prevent &quot;flash of unstyled content&quot; (FOUC) for critical UI elements.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                    How the Conversion Works
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Upload Your Image</h4>
                                            <p className="text-sm text-gray-500">Drag your image file into the converter or click to browse your computer.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Automatic Encoding</h4>
                                            <p className="text-sm text-gray-500">Our tool instantly converts the binary data of your image into a Base64 string.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Copy Your Snippet</h4>
                                            <p className="text-sm text-gray-500">Choose between raw base64, Data URL, HTML tag, or CSS property and copy it to your clipboard.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-3xl aspect-square flex items-center justify-center p-12">
                                <div className="w-full aspect-video bg-white rounded-xl shadow-xl flex flex-col p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
                                    <div className="w-[80%] h-4 bg-gray-100 rounded animate-pulse" />
                                    <div className="w-[90%] h-24 bg-primary-50 rounded-lg flex items-center justify-center">
                                        <Code2 className="w-8 h-8 text-primary-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
