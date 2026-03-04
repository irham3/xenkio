
import { Metadata } from 'next';
import { StampPdfClient } from './stamp-pdf-client';

export const metadata: Metadata = {
    title: 'Stamp PDF | Free Online PDF Stamp Tool',
    description: 'Add stamps to PDF documents online for free. Use approval stamps, date stamps, checklists, notes, or cost stamps. No registration required.',
    keywords: ['stamp pdf', 'pdf stamp', 'pdf approval stamp', 'pdf checklist', 'add stamp to pdf', 'free pdf stamping tool'],
    openGraph: {
        title: 'Stamp PDF | Add Stamps to PDF Online',
        description: 'Add professional stamps to your PDF documents — approval, date, checklist, notes, and more.',
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

export default function StampPdfPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Stamp PDF",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Add stamps to PDF documents directly in your browser. Approval, date, checklist, notes, and cost stamps.",
        "featureList": [
            "Approval stamps (Approved, Rejected, Draft, Confidential, Reviewed)",
            "Date stamps",
            "Checklist stamps with checkable items",
            "Notes stamps with free text",
            "Cost/Fee stamps",
            "Drag and resize stamps",
            "Multi-page support",
            "Switch between PDFs",
            "Download stamped PDF"
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Stamp PDF Online
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Add professional stamps to your PDF documents — approval, date, checklist, notes, and more. Secure and private.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 py-8 max-w-7xl">
                <StampPdfClient />
            </section>

            {/* SEO Content */}
            <section className="bg-white py-16 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Professional PDF Stamping</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Add approval stamps, date marks, checklists, notes, or cost information to any PDF document. Simply upload your file, choose a stamp template, drag it to the desired position, and fill in the details.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Secure & Private</h2>
                            <p className="text-gray-600 leading-relaxed">
                                All processing happens in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
