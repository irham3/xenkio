export const runtime = 'edge';

import type { Metadata } from 'next';
import { InstagramCarouselClient } from './client';


export const metadata: Metadata = {
    title: 'Seamless Scroll Studio | Instagram Carousel Maker',
    description: 'Design stunning, seamless panoramic carousels for Instagram. The ultimate free tool to create continuous, swipeable layouts that wow your audience.',
    keywords: ['instagram carousel', 'seamless scroll', 'panorama maker', 'scrl alternative', 'instagram design', 'content creator tools'],
    openGraph: {
        title: 'Seamless Scroll Studio',
        description: 'Create premium seamless carousels for Instagram. Free, pro-level design tool.',
        type: 'website',
    }
};

export default function InstagramCarouselPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Seamless Scroll Studio",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "The professional tool for creating seamless Instagram carousels. drag-and-drop, auto-slicing, and premium export quality.",
        "featureList": [
            "Seamless panoramic canvas",
            "Smart auto-slicing",
            "Drag & drop layer management",
            "High-fidelity export"
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-[1600px]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Pro Creator Tools
                </div>
                <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150 relative z-10">
                    Seamless <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary/60">Scroll</span> Studio
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 font-medium">
                    Craft immersive, continuous visual stories for Instagram. Drag, drop, and design on an infinite canvas—we handle the seamless slicing.
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <InstagramCarouselClient />
        </div>
    );
}
