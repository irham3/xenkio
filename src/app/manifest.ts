
import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Xenkio — Free Browser-Based Tools',
        short_name: 'Xenkio',
        description: 'Free tools for PDFs, images, and developer utilities. Everything runs locally in your browser — your files never leave your device.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    };
}
