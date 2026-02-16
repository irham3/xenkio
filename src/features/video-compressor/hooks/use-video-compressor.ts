import { useState, useRef, useEffect, useCallback } from 'react'
import { CompressionSettings, CompressionResult } from '../types'

// ============================================================
// FFmpeg v0.10.1 Implementation (Single Threaded - Stable)
// ============================================================
// We use v0.10.1 because v0.12.x (Multi-Threaded) requires
// SharedArrayBuffer and COOP/COEP headers which cause 92% stuck
// issues in many environments. v0.10.1 is robust and works everywhere.
// ============================================================

const FFMPEG_SCRIPT_URL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js'
const FFMPEG_CORE_URL = 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'

export interface DownloadProgress {
    label: string
    loaded: number
    total: number
    overallPercent: number
}

// Global types for window.FFmpeg
declare global {
    interface Window {
        FFmpeg: {
            createFFmpeg: (options: any) => any
            fetchFile: (file: File | Blob | string) => Promise<Uint8Array>
        }
    }
}

export function useVideoCompressor() {
    const [loaded, setLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const ffmpegRef = useRef<any>(null)
    const [progress, setProgress] = useState(0)
    const [isCompressing, setIsCompressing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [logs, setLogs] = useState<string[]>([])
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

    // Helper to load script
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
        if (loaded || isLoading) return
        setIsLoading(true)
        setError(null)

        // Start simulated progress (since v0.10 doesn't support download hooks)
        setDownloadProgress({ label: 'Connecting...', loaded: 0, total: 100, overallPercent: 5 })
        const progressInterval = setInterval(() => {
            setDownloadProgress(prev => {
                if (!prev || prev.overallPercent >= 90) return prev
                // Increment by random amount (1-5%) every 500ms
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

            // Create instance
            const ffmpeg = window.FFmpeg.createFFmpeg({
                corePath: FFMPEG_CORE_URL,
                log: true,
                logger: ({ message }: { message: string }) => {
                    setLogs(prev => [...prev.slice(-4), message])
                }
            })

            // Set progress handler
            ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
                setProgress(Math.round(ratio * 100))
            })

            ffmpegRef.current = ffmpeg
            await ffmpeg.load()

            setDownloadProgress({ label: 'Ready', loaded: 100, total: 100, overallPercent: 100 })
            setLoaded(true)
        } catch (err: any) {
            console.error('Failed to load FFmpeg', err)
            setError('Failed to load video engine. Please refresh or try a different browser.')
        } finally {
            clearInterval(progressInterval)
            setIsLoading(false)
        }
    }, [loaded, isLoading, loadScript])

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
            const { fetchFile } = window.FFmpeg
            // Use time-based input name to avoid cache/conflict
            const inputFileName = `input_${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`
            const outputFileName = `output_${Date.now()}.mp4`

            // Write file
            ffmpeg.FS('writeFile', inputFileName, await fetchFile(file))

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
            const data = ffmpeg.FS('readFile', outputFileName)

            // Create Blob
            const blob = new Blob([data.buffer], { type: 'video/mp4' })
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
        } catch (err: any) {
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
        logs,
        downloadProgress,
    }
}
