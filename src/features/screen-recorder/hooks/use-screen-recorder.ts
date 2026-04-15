'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped'

export interface RecordingSettings {
    includeAudio: boolean
    includeSystemAudio: boolean
    format: 'webm' | 'mp4'
    quality: 'low' | 'medium' | 'high'
}

export interface RecordingResult {
    url: string
    blob: Blob
    size: number
    duration: number
    fileName: string
    format: string
}

export const DEFAULT_SETTINGS: RecordingSettings = {
    includeAudio: false,
    includeSystemAudio: true,
    format: 'webm',
    quality: 'high',
}

const QUALITY_MAP: Record<string, number> = {
    low: 1_000_000,
    medium: 2_500_000,
    high: 5_000_000,
}

function getSupportedMimeType(format: string): string {
    const candidates =
        format === 'mp4'
            ? [
                  'video/mp4;codecs=h264,aac',
                  'video/mp4;codecs=h264',
                  'video/mp4',
                  'video/webm;codecs=h264',
                  'video/webm;codecs=vp9,opus',
                  'video/webm;codecs=vp8,opus',
                  'video/webm',
              ]
            : [
                  'video/webm;codecs=vp9,opus',
                  'video/webm;codecs=vp8,opus',
                  'video/webm;codecs=vp9',
                  'video/webm;codecs=vp8',
                  'video/webm',
              ]

    for (const mime of candidates) {
        if (MediaRecorder.isTypeSupported(mime)) return mime
    }
    return 'video/webm'
}

export function useScreenRecorder() {
    const [status, setStatus] = useState<RecordingStatus>('idle')
    const [duration, setDuration] = useState(0)
    const [result, setResult] = useState<RecordingResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = useRef(0)
    const pausedDurationRef = useRef(0)
    const pauseStartRef = useRef(0)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAllTracks()
            if (timerRef.current) clearInterval(timerRef.current)
            if (result?.url) URL.revokeObjectURL(result.url)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const stopAllTracks = useCallback((): void => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
    }, [])

    const startTimer = useCallback((): void => {
        timerRef.current = setInterval(() => {
            const elapsed =
                (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000
            setDuration(Math.floor(elapsed))
        }, 200)
    }, [])

    const stopTimer = useCallback((): void => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const startRecording = useCallback(
        async (settings: RecordingSettings): Promise<void> => {
            setError(null)

            try {
                // Request screen capture
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: { ideal: 30 } },
                    audio: settings.includeSystemAudio,
                })

                let combinedStream = displayStream

                // Add microphone audio if requested
                if (settings.includeAudio) {
                    try {
                        const micStream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                        })
                        const tracks = [
                            ...displayStream.getVideoTracks(),
                            ...displayStream.getAudioTracks(),
                            ...micStream.getAudioTracks(),
                        ]
                        combinedStream = new MediaStream(tracks)
                    } catch {
                        // Continue without mic if permission denied
                    }
                }

                streamRef.current = combinedStream
                chunksRef.current = []

                const mimeType = getSupportedMimeType(settings.format)
                const videoBitsPerSecond = QUALITY_MAP[settings.quality] ?? QUALITY_MAP.high

                const recorder = new MediaRecorder(combinedStream, {
                    mimeType,
                    videoBitsPerSecond,
                })

                recorder.ondataavailable = (e: BlobEvent) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data)
                }

                recorder.onstop = () => {
                    stopTimer()

                    const actualMime = recorder.mimeType || mimeType
                    const ext = actualMime.includes('mp4') ? 'mp4' : 'webm'
                    const blob = new Blob(chunksRef.current, { type: actualMime })
                    const url = URL.createObjectURL(blob)
                    const elapsed =
                        (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000

                    setResult({
                        url,
                        blob,
                        size: blob.size,
                        duration: Math.round(elapsed),
                        fileName: `screen-recording-${Date.now()}.${ext}`,
                        format: ext,
                    })
                    setStatus('stopped')
                    stopAllTracks()
                }

                // Handle user stopping share via browser UI
                displayStream.getVideoTracks()[0].addEventListener('ended', () => {
                    if (recorder.state !== 'inactive') {
                        recorder.stop()
                    }
                })

                recorder.start(1000) // collect data every 1s
                mediaRecorderRef.current = recorder
                startTimeRef.current = Date.now()
                pausedDurationRef.current = 0
                setDuration(0)
                setStatus('recording')
                startTimer()
            } catch (err: unknown) {
                const message =
                    err instanceof DOMException && err.name === 'NotAllowedError'
                        ? 'Screen sharing was cancelled or denied.'
                        : 'Failed to start screen recording. Please ensure your browser supports this feature.'
                setError(message)
                stopAllTracks()
            }
        },
        [startTimer, stopTimer, stopAllTracks]
    )

    const pauseRecording = useCallback((): void => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause()
            pauseStartRef.current = Date.now()
            stopTimer()
            setStatus('paused')
        }
    }, [stopTimer])

    const resumeRecording = useCallback((): void => {
        if (mediaRecorderRef.current?.state === 'paused') {
            pausedDurationRef.current += Date.now() - pauseStartRef.current
            mediaRecorderRef.current.resume()
            startTimer()
            setStatus('recording')
        }
    }, [startTimer])

    const stopRecording = useCallback((): void => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== 'inactive'
        ) {
            mediaRecorderRef.current.stop()
        }
    }, [])

    const downloadRecording = useCallback((): void => {
        if (!result) return
        const a = document.createElement('a')
        a.href = result.url
        a.download = result.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }, [result])

    const resetRecording = useCallback((): void => {
        if (result?.url) URL.revokeObjectURL(result.url)
        setResult(null)
        setStatus('idle')
        setDuration(0)
        setError(null)
        chunksRef.current = []
    }, [result])

    return {
        status,
        duration,
        result,
        error,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        downloadRecording,
        resetRecording,
    }
}
