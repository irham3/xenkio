import { Metadata } from 'next';
import ImageAnnotatorClient from './client';

export const metadata: Metadata = {
    title: 'Image Annotator | Free Online Image Markup Tool',
    description:
        'Annotate images directly in your browser with arrows, shapes, text, and freehand drawing. Upload or paste an image and download the annotated result. 100% private — no file is ever uploaded.',
    keywords: [
        'image annotator',
        'annotate image',
        'image markup',
        'draw on image',
        'add arrows to image',
        'image editor online',
        'photo annotation',
        'add text to image',
    ],
    openGraph: {
        title: 'Image Annotator | Free Online Image Markup Tool',
        description:
            'Add arrows, shapes, and text to images in seconds. Works entirely in your browser — zero uploads.',
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

export default function ImageAnnotatorPage() {
    return (
        <div className="container mx-auto max-w-7xl pb-20 pt-10 px-4">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Image Annotator
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload or paste an image, then add arrows, shapes, and text annotations.
                    <br className="hidden md:inline" /> Everything runs locally — your images never leave your device.
                </p>
            </div>

            <ImageAnnotatorClient />
        </div>
    );
}
