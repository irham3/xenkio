'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ============================================================
// FFmpeg v0.10.1 — same stable implementation as video-compressor
// ============================================================

const FFMPEG_SCRIPT_URL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js'
const FFMPEG_CORE_URL = 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'

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

interface FFmpegInstance {
    load: () => Promise<void>
    FS: (method: string, ...args: unknown[]) => unknown
    run: (...args: string[]) => Promise<void>
    setProgress: (callback: (p: { ratio: number }) => void) => void
    exit: () => void
}


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

    const loadScript = useCallback((): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (window.FFmpeg) {
                resolve()
                return
            }
            const script = document.createElement('script')
            script.src = FFMPEG_SCRIPT_URL
            script.async = true
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load FFmpeg script'))
            document.body.appendChild(script)
        })
    }, [])

    const load = useCallback(async () => {
        if (loaded || isLoading || error) return
        setIsLoading(true)
        setError(null)

        setDownloadProgress({ label: 'Connecting...', overallPercent: 5 })
        const progressInterval = setInterval(() => {
            setDownloadProgress(prev => {
                if (!prev || prev.overallPercent >= 90) return prev
                return {
                    ...prev,
                    overallPercent: Math.min(90, prev.overallPercent + Math.random() * 5),
                    label: 'Downloading Engine...'
                }
            })
        }, 500)

        try {
            await loadScript()
            if (!window.FFmpeg) throw new Error('FFmpeg script failed to load')

            const ffmpeg = window.FFmpeg.createFFmpeg({
                corePath: FFMPEG_CORE_URL,
                log: false,
            })

            ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
                setProgress(Math.round(Math.max(0, Math.min(100, ratio * 100))))
            })

            ffmpegRef.current = ffmpeg
            await ffmpeg.load()

            setDownloadProgress({ label: 'Ready', overallPercent: 100 })
            setLoaded(true)
        } catch (err: unknown) {
            console.error('Failed to load FFmpeg', err)
            setError('Failed to load video engine. Please refresh or try a different browser.')
        } finally {
            clearInterval(progressInterval)
            setIsLoading(false)
        }
    }, [loaded, isLoading, loadScript, error])

    const reset = useCallback(() => {
        setError(null)
        setLoaded(false)
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
            const { fetchFile } = window.FFmpeg!
            const ext = file.name.substring(file.name.lastIndexOf('.'))
            const inputFileName = `input_${Date.now()}${ext}`
            const paletteFileName = `palette_${Date.now()}.png`
            const outputFileName = `output_${Date.now()}.gif`

            // Write input
            ffmpeg.FS('writeFile', inputFileName, await fetchFile(file))

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
