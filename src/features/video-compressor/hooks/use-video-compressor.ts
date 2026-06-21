import { useState, useRef, useEffect, useCallback } from 'react'
import { CompressionSettings, CompressionResult } from '../types'
import { getFFmpeg, ffmpegFetchFile, FFmpegInstance, isFFmpegLoaded } from '@/lib/ffmpeg-engine'

export interface DownloadProgress {
    label: string
    loaded: number
    total: number
    overallPercent: number
}

/**
 * Get video duration using the HTML5 Video element.
 */
function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.preload = 'metadata'

        const url = URL.createObjectURL(file)
        video.src = url

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(url)
            const duration = video.duration
            if (!duration || !isFinite(duration) || duration <= 0) {
                reject(new Error('Could not determine video duration'))
            } else {
                resolve(duration)
            }
        }

        video.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Could not load video metadata'))
        }

        setTimeout(() => {
            URL.revokeObjectURL(url)
            reject(new Error('Timeout loading video metadata'))
        }, 10000)
    })
}

export function useVideoCompressor() {
    const [loaded, setLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const ffmpegRef = useRef<FFmpegInstance | null>(null)
    const [progress, setProgress] = useState(0)
    const [isCompressing, setIsCompressing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasFailed, setHasFailed] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

    const load = useCallback(async () => {
        if (loaded || isLoading || hasFailed) return
        setIsLoading(true)
        setError(null)
        setHasFailed(false)

        let progressInterval: NodeJS.Timeout | undefined;

        if (!isFFmpegLoaded()) {
            setDownloadProgress({ label: 'Connecting...', loaded: 0, total: 100, overallPercent: 5 })
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
                const clamped = Math.max(0, Math.min(1, ratio))
                setProgress(Math.round(clamped * 100))
            })

            ffmpegRef.current = ffmpeg
            setDownloadProgress({ label: 'Ready', loaded: 100, total: 100, overallPercent: 100 })
            setLoaded(true)
        } catch (err: unknown) {
            console.error('Failed to load FFmpeg', err)
            setError('Failed to load video engine. Please refresh or try a different browser.')
            setHasFailed(true)
            setDownloadProgress(null)
        } finally {
            clearInterval(progressInterval)
            setIsLoading(false)
        }
    }, [loaded, isLoading, hasFailed])

    const reset = useCallback(() => {
        setError(null)
        setLoaded(false)
        setHasFailed(false)
        setDownloadProgress(null)
    }, [])

    useEffect(() => {
        load()
    }, [load])

    /**
     * Run a single FFmpeg encode pass and return the output blob.
     * Returns null if encoding fails or produces empty output.
     */
    const runEncode = async (
        ffmpeg: FFmpegInstance,
        file: File,
        targetKbps: number,
        resolution: string,
        audioMode: 'copy' | 'compress' | 'remove',
        audioBitrate: number,
    ): Promise<{ blob: Blob; url: string } | null> => {
        const ext = file.name.substring(file.name.lastIndexOf('.'))
        const ts = Date.now()
        const inputFileName = `in_${ts}${ext}`
        const outputFileName = `out_${ts}.mp4`

        try {
            const ffmpegFile = await ffmpegFetchFile(file)
            ffmpeg.FS('writeFile', inputFileName, ffmpegFile)

            const args = ['-i', inputFileName]

            // Video: Strict Average Bitrate (ABR)
            args.push('-c:v', 'libx264')
            args.push('-preset', 'fast') // Use fast instead of veryfast for better size-efficiency

            // Force strict bitrate to guarantee smaller output file
            if (targetKbps > 0) {
                args.push('-b:v', `${targetKbps}k`)
                args.push('-maxrate', `${Math.round(targetKbps * 1.5)}k`)
                args.push('-bufsize', `${Math.round(targetKbps * 2)}k`)
            } else {
                // Fallback extremely aggressive compression
                args.push('-crf', '40')
            }

            // Resolution downscale
            if (resolution !== 'original') {
                args.push('-vf', `scale=-2:${resolution}`)
            }

            args.push('-pix_fmt', 'yuv420p')

            // Audio
            if (audioMode === 'remove') {
                args.push('-an')
            } else if (audioMode === 'copy') {
                args.push('-c:a', 'copy')
            } else {
                args.push('-c:a', 'aac')
                args.push('-b:a', `${audioBitrate}k`)
            }

            args.push('-movflags', '+faststart')
            args.push('-threads', '1')
            args.push('-y') // overwrite output
            args.push(outputFileName)

            console.log(`[VideoCompressor] Encoding: target=${targetKbps}k res=${resolution} audio=${audioMode}`)
            console.log(`[VideoCompressor] Args: ${args.join(' ')}`)

            await ffmpeg.run(...args)

            // Read output
            let data: Uint8Array
            try {
                data = ffmpeg.FS('readFile', outputFileName) as Uint8Array
            } catch {
                console.error('[VideoCompressor] Could not read output file')
                return null
            }

            // Validate output is not empty
            if (!data || data.length < 1000) {
                console.error(`[VideoCompressor] Output too small: ${data?.length ?? 0} bytes`)
                return null
            }

            const blob = new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' })
            const url = URL.createObjectURL(blob)

            return { blob, url }
        } catch (err) {
            console.error('[VideoCompressor] Encode failed:', err)
            return null
        } finally {
            // Cleanup temp files
            try { ffmpeg.FS('unlink', inputFileName) } catch { /* */ }
            try { ffmpeg.FS('unlink', outputFileName) } catch { /* */ }
        }
    }

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
            // Get video duration to calculate exact target bitrate
            let duration: number
            try {
                duration = await getVideoDuration(file)
            } catch {
                console.warn('[VideoCompressor] Could not get duration, assuming 60s to prevent huge file sizes')
                duration = 60
            }

            // Calculate original bitrate: file size in kilobits / duration
            const originalKbps = (file.size * 8) / duration / 1000
            
            // Deduct requested audio bitrate from target to ensure total size shrinks
            const targetAudioKbps = settings.audioMode === 'compress' ? settings.audioBitrate : 0
            
            // Target video bitrate
            let targetKbps = Math.round((originalKbps * settings.ratio) - targetAudioKbps)
            
            // Guard rail: minimum 50kbps for video
            if (targetKbps < 50) targetKbps = 50

            console.log(`[VideoCompressor] Original: ${Math.round(originalKbps)} kbps, Target Video max: ${targetKbps} kbps, Duration: ${duration.toFixed(1)}s`)

            // ================================================================
            // Attempt 1: Strict Target Bitrate
            // ================================================================
            let encodeResult = await runEncode(
                ffmpeg, file, targetKbps, settings.resolution,
                settings.audioMode, settings.audioBitrate,
            )

            // If audio copy failed, retry with AAC
            if (!encodeResult && settings.audioMode === 'copy') {
                console.warn('[VideoCompressor] Audio copy failed, retrying with AAC...')
                encodeResult = await runEncode(
                    ffmpeg, file, targetKbps, settings.resolution,
                    'compress', 96,
                )
            }

            if (!encodeResult) {
                setError('Compression failed — the video format may not be supported. Try a different file.')
                return null
            }

            // ================================================================
            // Attempt 2: If somehow still larger (unlikely with strict bitrate), retry heavily
            // ================================================================
            if (encodeResult.blob.size >= file.size) {
                console.warn(`[VideoCompressor] Output ${(encodeResult.blob.size / 1024 / 1024).toFixed(2)} MB >= original ${(file.size / 1024 / 1024).toFixed(2)} MB, retrying with nuclear options...`)

                // Revoke first attempt
                URL.revokeObjectURL(encodeResult.url)

                const lowerRes = settings.resolution === 'original' ? '480' : settings.resolution
                const extremelyLowTarget = Math.round(targetKbps * 0.4)

                encodeResult = await runEncode(
                    ffmpeg, file, extremelyLowTarget, lowerRes,
                    'remove', 0,
                )

                if (!encodeResult) {
                    setError('Compression failed on retry.')
                    return null
                }
            }

            // Build final result
            const result: CompressionResult = {
                url: encodeResult.url,
                blob: encodeResult.blob,
                size: encodeResult.blob.size,
                fileName: `compressed_${file.name.replace(/\.[^/.]+$/, '')}.mp4`,
                timeTaken: Date.now() - startTime,
            }

            return result
        } catch (err: unknown) {
            console.error('Compression failed', err)
            setError('Compression failed. Please try again with different settings.')
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
