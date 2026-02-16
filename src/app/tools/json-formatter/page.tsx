import { Metadata } from 'next';
import JsonFormatterClient from './client';
import { Braces } from 'lucide-react';

export const metadata: Metadata = {
    title: 'JSON Formatter & Validator | Free Online JSON Beautifier',
    description: 'Format, beautify, and validate JSON data instantly. Free online tool with syntax validation, custom indentation, and key sorting. 100% client-side.',
    keywords: ['json formatter', 'json beautifier', 'json validator', 'format json online', 'beautify json', 'json minifier', 'json prettifier', 'validate json'],
    openGraph: {
        title: 'JSON Formatter & Validator | Free Online Tool',
        description: 'Format, beautify, and validate JSON data instantly with customizable options. 100% secure client-side processing.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JSON Formatter & Validator',
        description: 'Format and beautify JSON data instantly with customizable indentation options.',
    },
};

export default function JsonFormatterPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JSON Formatter",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Format, beautify, and validate JSON data instantly. Free online tool with customizable indentation.",
        "featureList": [
            "Beautify JSON",
            "Minify JSON",
            "Validate JSON",
            "Sort JSON keys",
            "Custom indentation"
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 pt-20 pb-16 max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-gray-100 rounded-full text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-6">
                        <Braces className="w-3.5 h-3.5" />
                        100% Client-Side Private Processing
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-6">
                        JSON Formatter <span className="text-primary-600">&</span> Validator
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Merapikan dan memvalidasi struktur data JSON Anda secara instan dengan standar industri.
                        <span className="text-gray-900"> Gratis dan aman.</span>
                    </p>
                </div>
            </section>

            {/* Tool Section */}
            <section className="container mx-auto px-4 pb-20 max-w-5xl">
                <JsonFormatterClient />
            </section>

            {/* Educational Content */}
            <section className="bg-gray-50/50 border-t border-gray-100">
                <div className="container mx-auto px-4 py-20 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Apa itu JSON Formatter?</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                                <p>
                                    <strong className="text-gray-900">JSON Formatter</strong> adalah alat yang digunakan untuk mengubah format data JSON (JavaScript Object Notation) yang padat dan sulit dibaca menjadi lebih terstruktur dengan spasi dan baris baru yang tepat.
                                </p>
                                <p>
                                    Format JSON sangat populer dalam integrasi API dan konfigurasi aplikasi modern. Dengan menggunakan alat ini, Anda dapat menemukan kesalahan sintaks dan memahami hubungan data dengan jauh lebih cepat.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Fitur Unggulan</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'Live Validation', desc: 'Validasi otomatis saat Anda mengetik.' },
                                    { title: 'Custom Spacing', desc: 'Pilihan indentasi 2, 4, atau 8 spasi.' },
                                    { title: 'Auto-Sort', desc: 'Urutkan kunci JSON secara alfabetis.' },
                                    { title: 'One-Click Copy', desc: 'Salin hasil ke clipboard instan.' }
                                ].map((f, i) => (
                                    <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
