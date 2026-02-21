import { useState, useRef, useEffect, useCallback } from 'react'
import { CompressionSettings, CompressionResult } from '../types'
import { getFFmpeg, ffmpegFetchFile, FFmpegInstance } from '@/lib/ffmpeg-engine'

export interface DownloadProgress {
    label: string
    loaded: number
    total: number
    overallPercent: number
}

// (Simplified types moved to ffmpeg-engine.ts)

export function useVideoCompressor() {
    const [loaded, setLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const ffmpegRef = useRef<FFmpegInstance | null>(null)
    const [progress, setProgress] = useState(0)
    const [isCompressing, setIsCompressing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

    // Helper removed, using centralized manager

    const load = useCallback(async () => {
        if (loaded || isLoading) return
        setIsLoading(true)
        setError(null)

        // Simulated progress
        setDownloadProgress({ label: 'Connecting...', loaded: 0, total: 100, overallPercent: 5 })
        const progressInterval = setInterval(() => {
            setDownloadProgress(prev => {
                if (!prev || prev.overallPercent >= 90) return prev
                return {
                    ...prev,
                    overallPercent: Math.min(90, prev.overallPercent + Math.random() * 5),
                    label: 'Downloading Engine...'
                }
            })
        }, 300)

        try {
            const ffmpeg = await getFFmpeg()

            // Set progress handler whenever we get instance
            ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
                setProgress(Math.round(ratio * 100))
            })

            ffmpegRef.current = ffmpeg
            setDownloadProgress({ label: 'Ready', loaded: 100, total: 100, overallPercent: 100 })
            setLoaded(true)
        } catch (err: unknown) {
            console.error('Failed to load FFmpeg', err)
            setError('Failed to load video engine. Please refresh or try a different browser.')
        } finally {
            clearInterval(progressInterval)
            setIsLoading(false)
        }
    }, [loaded, isLoading])

    const reset = useCallback(() => {
        setError(null)
        setLoaded(false)
    }, [])

    // Auto-load
    useEffect(() => {
        load()
    }, [load])

    const compressVideo = async (
        file: File,
        settings: CompressionSettings
    ): Promise<CompressionResult | null> => {
        if (!loaded || !ffmpegRef.current) return null

        const ffmpeg = ffmpegRef.current
        setIsCompressing(true)
        setProgress(0)
        setError(null)
        const startTime = Date.now()

        try {
            // Write file using shared fetch utility
            const ffmpegFile = await ffmpegFetchFile(file)

            // Re-define filenames
            const inputFileName = `input_${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`
            const outputFileName = `output_${Date.now()}.mp4`

            // Write file
            ffmpeg.FS('writeFile', inputFileName, ffmpegFile)

            // Build args
            const args = ['-i', inputFileName]

            // Video settings
            args.push('-c:v', 'libx264')
            args.push('-crf', settings.crf.toString())
            args.push('-preset', settings.preset)

            if (settings.resolution !== 'original') {
                args.push('-vf', `scale=-2:${settings.resolution}`)
            }

            // Audio settings
            args.push('-c:a', 'aac', '-b:a', '128k')

            // Output settings
            args.push('-movflags', '+faststart')
            args.push(outputFileName)

            // Run
            await ffmpeg.run(...args)

            // Read output
            const data = ffmpeg.FS('readFile', outputFileName) as Uint8Array

            // Create Blob
            const blob = new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' })
            const url = URL.createObjectURL(blob)

            // Cleanup
            try {
                ffmpeg.FS('unlink', inputFileName)
                ffmpeg.FS('unlink', outputFileName)
            } catch { /* ignore cleanup errors */ }

            return {
                url,
                blob,
                size: blob.size,
                fileName: `compressed_${file.name.replace(/\.[^/.]+$/, '')}.mp4`,
                timeTaken: Date.now() - startTime,
            }
        } catch (err: unknown) {
            console.error('Compression failed', err)
            setError('Compression failed. Please try different quality settings.')
            return null
        } finally {
            setIsCompressing(false)
        }
    }

    return {
        loaded,
        isLoading,
        isCompressing,
        progress,
        error,
        compressVideo,
        downloadProgress,
        reset,
    }
}
