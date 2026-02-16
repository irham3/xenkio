
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Xenkio - All-in-One Online Productivity Tools',
        short_name: 'Xenkio',
        description: 'Xenkio offers a comprehensive collection of free, instant online tools for PDF processing, image compression, data format conversion, and more. No signup required, zero cost, 100% secure.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
