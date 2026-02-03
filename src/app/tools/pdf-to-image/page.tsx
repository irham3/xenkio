import { Metadata } from 'next';
import PdfToImageClient from './client';

export const metadata: Metadata = {
    title: 'PDF to Image Converter | Convert PDF to JPG, PNG Online',
    description: 'Convert PDF pages to high-quality images (JPG or PNG) instantly. Secure, client-side conversion requiring no uploads. Free and fast.',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf', 'online pdf tool', 'pdf converter'],
    openGraph: {
        title: 'PDF to Image Converter | Free Online Tool',
        description: 'Convert PDF files to high-resolution images instantly in your browser.',
        type: 'website',
    }
};

export default function PdfToImagePage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-gray-100">
                <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl relative z-10">
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                            PDF to Image Converter
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Extract pages from your PDF documents as sharp JPG or PNG images
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 max-w-6xl -mt-8 relative z-20">
                <PdfToImageClient />
            </section>

            {/* SEO Content (Below fold) */}
            <section className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Why use our PDF to Image tool?</h2>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center text-success-600 shrink-0">✓</div>
                                <span><strong>High Resolution:</strong> Choose up to 216 DPI for print-quality exports.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center text-success-600 shrink-0">✓</div>
                                <span><strong>Privacy First:</strong> Your files never leave your device. Processing happens locally.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center text-success-600 shrink-0">✓</div>
                                <span><strong>Bulk Export:</strong> Download all pages at once as a ZIP archive.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">How to convert</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>
                                Unlike other tools that upload your sensitive documents to a server, we process everything using
                                <span className="font-mono text-sm bg-gray-100 px-1 py-0.5 rounded mx-1 text-primary-600">WebAssembly</span>
                                technology in your secure browser sandbox.
                            </p>
                            <p>
                                Simply drop your PDF, select your preferred format (JPG for smaller size, PNG for best quality),
                                adjust the resolution, and convert. It&apos;s that simple.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
