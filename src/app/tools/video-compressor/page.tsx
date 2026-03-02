import type { Metadata } from 'next'
import { VideoCompressorClient } from './client'

export const metadata: Metadata = {
    title: 'Video Compressor | Reduce Video File Size Online Free',
    description: 'Compress MP4, WebM, MOV video files online for free. Reduce file size while maintaining quality. No watermarks, no file limits, 100% private.',
    keywords: 'video compressor, compress video, reduce video size, mp4 compressor, online video compressor, free video compressor',
    openGraph: {
        title: 'Video Compressor - Reduce Video File Size Online',
        description: 'Compress videos directly in your browser. No upload needed, 100% private.',
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
    twitter: {
        card: 'summary_large_image',
        title: 'Video Compressor - Free Online Tool',
        description: 'Compress MP4, WebM, MOV videos in your browser. No upload, no watermarks.',
      images: ['/og-image.jpg'],

    },
}

export default function VideoCompressorPage() {
    return <VideoCompressorClient />
}
