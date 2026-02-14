
import { Metadata } from 'next';
import ZipExtractorClient from './client';
import { Shield, Zap, HardDrive } from 'lucide-react';



export const metadata: Metadata = {
    title: 'Free Zip Extractor Online | Unzip Files in Your Browser',
    description: 'Instantly extract and unzip files from ZIP archives online. Private, secure, and fast. No file limits, works entirely in your browser.',
    keywords: ['zip extractor', 'unzip files online', 'extract zip', 'online zip opener', 'free zip extractor'],
    openGraph: {
        title: 'Online Zip Extractor | Secure & Private Unzipping',
        description: 'Extract your zip archives instantly in the browser. High security, no server uploads.',
        type: 'website',
    },
};

export default function ZipExtractorPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Zip Extractor Online",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Extract ZIP archives instantly. Preview contents, download individual files, or save all files in one go. Free and secure browser-based utility.",
        "featureList": [
            "Online ZIP extraction",
            "Individual file download",
            "Search within archive",
            "Privacy-focused local execution"
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
                        Zip <span className="text-primary-600">Extractor</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Securely unzip your archives in seconds. Browse files, search for specific data,
                        and download what you need without ever uploading your files to any server.
                    </p>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 pb-20 max-w-6xl">
                <ZipExtractorClient />
            </section>

            {/* Feature Highlights */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <Zap className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">Lightning Fast</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Process archives instantly using client-side JSZip engine. No waiting for uploads or downloads.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <Shield className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">100% Private</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Your files never leave your computer. All extraction happens directly in your browser session.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <HardDrive className="w-6 h-6 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-gray-900">No Installation</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Works on any device without downloading heavy software. Open zip files on mobile, tablet, or PC.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Content Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-16">
                        <div className="space-y-6 text-center text-balance">
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                How to Unzip Files Online
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                Our tool makes it simple to handle compressed archives. Whether you have a single small
                                file or a large project, you can get your files extracted into 3 simple steps.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 pt-8">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">1</div>
                                <h3 className="text-xl font-bold text-gray-900">Select Zip Archive</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Click the upload area or drag and drop your `.zip` file into the extractor.
                                    Compatible with standard ZIP formats.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">2</div>
                                <h3 className="text-xl font-bold text-gray-900">Browse Contents</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Once processed, you&apos;ll see a list of all files and folders. Use the search bar
                                    to quickly find specific items within large archives.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">3</div>
                                <h3 className="text-xl font-bold text-gray-900">Download Files</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Click the download icon on individual files, or use &quot;Download All&quot; to
                                    save every file from the archive to your device.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">4</div>
                                <h3 className="text-xl font-bold text-gray-900">Safe Session</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your files remain in your browser memory only. Refreshing the page or closing the tab
                                    immediately wipes all session data for your security.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
