import type { Metadata } from 'next';
import { CarouselGeneratorClient } from './carousel-generator-client';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'Instagram Carousel Generator | Xenkio',
    description: 'Create seamless, swipeable Instagram carousels. Upload images, design layouts spanning multiple slides, and export automatically sliced images ready to post.',
    keywords: ['instagram carousel', 'seamless carousel', 'instagram grid', 'social media tools', 'content creator'],
};

export default function InstagramCarouselPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                    Content Creator Tools
                </div>
                <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150">
                    Instagram <span className="text-primary bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">Carousel</span> Generator
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    Create seamless, swipeable carousels. Upload images, design your layout spanning multiple slides, and export automatically sliced slides ready to post.
                </p>
            </div>

            {/* Feature UI (Client Component) */}
            <CarouselGeneratorClient />
        </div>
    );
}
