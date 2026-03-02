import { useState, useRef, useEffect, useCallback } from 'react'
import { getFFmpeg, ffmpegFetchFile, FFmpegInstance, isFFmpegLoaded } from '@/lib/ffmpeg-engine'

export interface GifSettings {
    fps: number
    width: number
    startTime: number
    duration: number
}

export interface GifResult {
    url: string
    blob: Blob
    size: number
    fileName: string
    timeTaken: number
    width: number
    height: number
}

export interface DownloadProgress {
    label: string
    overallPercent: number
}

// (Simplified types moved to ffmpeg-engine.ts)


export const DEFAULT_GIF_SETTINGS: GifSettings = {
    fps: 15,
    width: 480,
    startTime: 0,
    duration: 5,
}

export function useVideoToGif() {
    const [loaded, setLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const ffmpegRef = useRef<FFmpegInstance | null>(null)
    const [progress, setProgress] = useState(0)
    const [isConverting, setIsConverting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

    // Helper removed, using centralized manager

    const load = useCallback(async () => {
        if (loaded || isLoading) return
        setIsLoading(true)
        setError(null)

        let progressInterval: NodeJS.Timeout | undefined;

        if (!isFFmpegLoaded()) {
            setDownloadProgress({ label: 'Connecting...', overallPercent: 5 })
            progressInterval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (!prev || prev.overallPercent >= 90) return prev
                    return {
                        ...prev,
                        overallPercent: Math.min(90, prev.overallPercent + Math.random() * 5),
                        label: 'Downloading Engine...'
                    }
                })
            }, 300)
        }

        try {
            const ffmpeg = await getFFmpeg()

            ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
                setProgress(Math.round(Math.max(0, Math.min(100, ratio * 100))))
            })

            ffmpegRef.current = ffmpeg
            setDownloadProgress({ label: 'Ready', overallPercent: 100 })
            setLoaded(true)
        } catch (err: unknown) {
            console.error('Failed to load FFmpeg', err)
            setError('Failed to load video engine. Please refresh or try a different browser.')
            setDownloadProgress(null)
        } finally {
            clearInterval(progressInterval)
            setIsLoading(false)
        }
    }, [loaded, isLoading])

    const reset = useCallback(() => {
        setError(null)
        setLoaded(false)
        setDownloadProgress(null)
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const convertToGif = async (
        file: File,
        settings: GifSettings
    ): Promise<GifResult | null> => {
        if (!loaded || !ffmpegRef.current) return null

        const ffmpeg = ffmpegRef.current
        setIsConverting(true)
        setProgress(0)
        setError(null)
        const startTime = Date.now()

        try {
            const ext = file.name.substring(file.name.lastIndexOf('.'))
            const inputFileName = `input_${Date.now()}${ext}`
            const paletteFileName = `palette_${Date.now()}.png`
            const outputFileName = `output_${Date.now()}.gif`

            // Write input using shared fetch utility
            const ffmpegFile = await ffmpegFetchFile(file)
            ffmpeg.FS('writeFile', inputFileName, ffmpegFile)

            // Build filter string
            const scaleFilter = `scale=${settings.width}:-1:flags=lanczos`
            const fpsFilter = `fps=${settings.fps}`
            const filters = `${fpsFilter},${scaleFilter}`

            // Time args
            const timeArgs: string[] = []
            if (settings.startTime > 0) {
                timeArgs.push('-ss', settings.startTime.toString())
            }
            if (settings.duration > 0) {
                timeArgs.push('-t', settings.duration.toString())
            }

            // Step 1: Generate palette for best quality
            await ffmpeg.run(
                ...timeArgs,
                '-i', inputFileName,
                '-vf', `${filters},palettegen=stats_mode=diff`,
                '-y', paletteFileName
            )

            // Step 2: Use palette to create high-quality GIF
            await ffmpeg.run(
                ...timeArgs,
                '-i', inputFileName,
                '-i', paletteFileName,
                '-lavfi', `${filters} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`,
                '-y', outputFileName
            )

            // Read output
            const data = ffmpeg.FS('readFile', outputFileName) as Uint8Array
            const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/gif' })
            const url = URL.createObjectURL(blob)

            // Cleanup
            try {
                ffmpeg.FS('unlink', inputFileName)
                ffmpeg.FS('unlink', paletteFileName)
                ffmpeg.FS('unlink', outputFileName)
            } catch { /* ignore */ }

            return {
                url,
                blob,
                size: blob.size,
                fileName: `${file.name.replace(/\.[^/.]+$/, '')}.gif`,
                timeTaken: Date.now() - startTime,
                width: settings.width,
                height: 0, // auto-calculated by ffmpeg
            }
        } catch (err: unknown) {
            console.error('GIF conversion failed', err)
            setError('Conversion failed. Try a shorter clip or lower resolution.')
            return null
        } finally {
            setIsConverting(false)
        }
    }

    return {
        loaded,
        isLoading,
        isConverting,
        progress,
        error,
        convertToGif,
        downloadProgress,
        reset,
    }
}
