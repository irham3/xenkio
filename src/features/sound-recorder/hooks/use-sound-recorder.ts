'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { RecorderStatus, RecorderSettings, RecorderResult } from '../types'

function getSupportedMimeType(format: string): string {
    const candidates =
        format === 'mp4'
            ? [
                  'audio/mp4;codecs=aac',
                  'audio/mp4',
                  'audio/webm;codecs=opus',
                  'audio/webm',
              ]
            : [
                  'audio/webm;codecs=opus',
                  'audio/webm',
              ]

    for (const mime of candidates) {
        if (MediaRecorder.isTypeSupported(mime)) return mime
    }
    return 'audio/webm'
}

export function useSoundRecorder() {
    const [status, setStatus] = useState<RecorderStatus>('idle')
    const [duration, setDuration] = useState(0)
    const [result, setResult] = useState<RecorderResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [audioLevel, setAudioLevel] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = useRef(0)
    const pausedDurationRef = useRef(0)
    const pauseStartRef = useRef(0)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const animFrameRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            stopAllTracks()
            if (timerRef.current) clearInterval(timerRef.current)
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            if (audioContextRef.current) audioContextRef.current.close()
            if (result?.url) URL.revokeObjectURL(result.url)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- result URL is revoked only once on unmount; including it would re-register the effect on every recording
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

    const startLevelMeter = useCallback((stream: MediaStream): void => {
        try {
            const ctx = new AudioContext()
            audioContextRef.current = ctx
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 256
            analyserRef.current = analyser
            const source = ctx.createMediaStreamSource(stream)
            source.connect(analyser)

            const data = new Uint8Array(analyser.frequencyBinCount)
            const tick = (): void => {
                analyser.getByteFrequencyData(data)
                const avg = data.reduce((s, v) => s + v, 0) / data.length
                setAudioLevel(Math.min(100, (avg / 128) * 100))
                animFrameRef.current = requestAnimationFrame(tick)
            }
            animFrameRef.current = requestAnimationFrame(tick)
        } catch {
            // Level meter is optional — ignore errors
        }
    }, [])

    const stopLevelMeter = useCallback((): void => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current)
            animFrameRef.current = null
        }
        setAudioLevel(0)
        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        analyserRef.current = null
    }, [])

    const startRecording = useCallback(
        async (settings: RecorderSettings): Promise<void> => {
            setError(null)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                streamRef.current = stream
                chunksRef.current = []

                const mimeType = getSupportedMimeType(settings.format)
                const recorder = new MediaRecorder(stream, { mimeType })

                recorder.ondataavailable = (e: BlobEvent) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data)
                }

                recorder.onstop = () => {
                    stopTimer()
                    stopLevelMeter()

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
                        fileName: `recording-${Date.now()}.${ext}`,
                        format: ext,
                    })
                    setStatus('stopped')
                    stopAllTracks()
                }

                recorder.start(500)
                mediaRecorderRef.current = recorder
                startTimeRef.current = Date.now()
                pausedDurationRef.current = 0
                setDuration(0)
                setStatus('recording')
                startTimer()
                startLevelMeter(stream)
            } catch (err: unknown) {
                const message =
                    err instanceof DOMException && err.name === 'NotAllowedError'
                        ? 'Microphone access was denied. Please allow microphone permission and try again.'
                        : 'Failed to start recording. Please ensure your browser supports this feature.'
                setError(message)
                stopAllTracks()
            }
        },
        [startTimer, stopTimer, stopAllTracks, startLevelMeter, stopLevelMeter]
    )

    const pauseRecording = useCallback((): void => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause()
            pauseStartRef.current = Date.now()
            stopTimer()
            stopLevelMeter()
            setStatus('paused')
        }
    }, [stopTimer, stopLevelMeter])

    const resumeRecording = useCallback((): void => {
        if (mediaRecorderRef.current?.state === 'paused') {
            pausedDurationRef.current += Date.now() - pauseStartRef.current
            mediaRecorderRef.current.resume()
            startTimer()
            if (streamRef.current) startLevelMeter(streamRef.current)
            setStatus('recording')
        }
    }, [startTimer, startLevelMeter])

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
        setAudioLevel(0)
        chunksRef.current = []
    }, [result])

    return {
        status,
        duration,
        result,
        error,
        audioLevel,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        downloadRecording,
        resetRecording,
    }
}
