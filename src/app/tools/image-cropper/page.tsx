
import { Metadata } from 'next';
import ImageCropperClient from './client';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'Image Cropper | Free Online Photo Cropping Tool',
    description: 'Crop images online with custom aspect ratios, freehand selection, and precise controls. Support for JPG, PNG, WebP. No upload required - works locally.',
    keywords: ['image cropper', 'crop photo online', 'resize image', 'photo editor', 'crop jpg', 'crop png'],
    openGraph: {
        title: 'Image Cropper | Free Online Tool',
        description: 'Crop images instantly in your browser. Secure, fast, and free.',
        type: 'website',
    }
};

export default function ImageCropperPage() {
    return (
        <div className="container mx-auto max-w-7xl pb-20 pt-10 px-4">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Image Cropper
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Crop, rotate, and resize your images directly in the browser.
                    <br className="hidden md:inline" /> Secure processing - your photos never leave your device.
                </p>
            </div>

            <ImageCropperClient />
        </div>
    );
}
