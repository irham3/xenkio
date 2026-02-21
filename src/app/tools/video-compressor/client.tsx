"use client"

import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled | FFmpeg.wasm only works in browser
const VideoCompressor = dynamic(
    () => import("@/features/video-compressor/components/video-compressor").then(mod => mod.VideoCompressor),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary-600"></div>
                <p className="text-gray-500 animate-pulse">Loading video compressor...</p>
            </div>
        ),
    }
)

export function VideoCompressorClient() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <VideoCompressor />
        </div>
    )
}
