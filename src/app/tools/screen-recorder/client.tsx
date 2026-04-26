"use client"

import dynamic from 'next/dynamic'

const ScreenRecorder = dynamic(
    () => import("@/features/screen-recorder/components/screen-recorder").then(mod => mod.ScreenRecorder),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary-600"></div>
                <p className="text-gray-500 animate-pulse">Loading screen recorder...</p>
            </div>
        ),
    }
)

export function ScreenRecorderClient() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <ScreenRecorder />
        </div>
    )
}
