'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, FileVideo, Settings2, Image, AlertCircle, RefreshCw, Play, Pause, Scissors, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useVideoToGif, GifSettings, DEFAULT_GIF_SETTINGS, GifResult } from '../hooks/use-video-to-gif'

// ─── Helpers ───
function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Preset Definitions ───
interface Preset {
    label: string
    description: string
    fps: number
    width: number
}

const PRESETS: Preset[] = [
    { label: 'Low', description: '10 fps · 320px', fps: 10, width: 320 },
    { label: 'Medium', description: '15 fps · 480px', fps: 15, width: 480 },
    { label: 'High', description: '20 fps · 640px', fps: 20, width: 640 },
    { label: 'Ultra', description: '24 fps · 800px', fps: 24, width: 800 },
]

// ─── Video Preview State ───
interface VideoFile {
    file: File
    name: string
    size: number
    url: string
    duration: number
}

// ─── Main Component ───
export function VideoToGif() {
    // Hook
    const { loaded, isConverting, progress, error: ffmpegError, convertToGif, downloadProgress } = useVideoToGif()

    // State
    const [video, setVideo] = useState<VideoFile | null>(null)
    const [settings, setSettings] = useState<GifSettings>(DEFAULT_GIF_SETTINGS)
    const [result, setResult] = useState<GifResult | null>(null)
    const [activePreset, setActivePreset] = useState(1) // Medium
    const [isPlaying, setIsPlaying] = useState(false)

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null)
    const rangeTrackRef = useRef<HTMLDivElement>(null)

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            if (video?.url) URL.revokeObjectURL(video.url)
            if (result?.url) URL.revokeObjectURL(result.url)
        }
    }, [video, result])

    // ─── Drop Handler ───
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        if (!file.type.startsWith('video/')) {
            toast.error('Please upload a video file')
            return
        }

        if (file.size > 500 * 1024 * 1024) {
            toast.error('File too large. Maximum 500MB.')
            return
        }

        // Revoke old URLs
        if (video?.url) URL.revokeObjectURL(video.url)
        if (result?.url) URL.revokeObjectURL(result.url)

        const url = URL.createObjectURL(file)

        // Get duration
        const tempVideo = document.createElement('video')
        tempVideo.preload = 'metadata'
        tempVideo.src = url
        tempVideo.onloadedmetadata = () => {
            const dur = tempVideo.duration
            setVideo({
                file,
                name: file.name,
                size: file.size,
                url,
                duration: dur,
            })
            setSettings(prev => ({
                ...prev,
                startTime: 0,
                duration: Math.min(prev.duration, dur),
            }))
            setResult(null)
        }
    }, [video, result])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'] },
        maxFiles: 1,
        disabled: isConverting,
    })

    // ─── Apply Preset ───
    const applyPreset = (index: number) => {
        setActivePreset(index)
        const preset = PRESETS[index]
        setSettings(prev => ({ ...prev, fps: preset.fps, width: preset.width }))
    }

    // ─── Video Playback ───
    const togglePlayback = () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.currentTime = settings.startTime
            videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    // Stop playback when reaching end of selected range
    useEffect(() => {
        const vid = videoRef.current
        if (!vid) return

        const handleTimeUpdate = () => {
            if (vid.currentTime >= settings.startTime + settings.duration) {
                vid.pause()
                vid.currentTime = settings.startTime
                setIsPlaying(false)
            }
        }

        vid.addEventListener('timeupdate', handleTimeUpdate)
        return () => vid.removeEventListener('timeupdate', handleTimeUpdate)
    }, [settings.startTime, settings.duration])

    // ─── Convert ───
    const handleConvert = async () => {
        if (!video || !loaded) return
        if (result?.url) URL.revokeObjectURL(result.url)

        const res = await convertToGif(video.file, settings)
        if (res) {
            setResult(res)
            toast.success(`GIF created! ${formatSize(res.size)}`)
        }
    }

    // ─── Download ───
    const handleDownload = () => {
        if (!result) return
        const a = document.createElement('a')
        a.href = result.url
        a.download = result.fileName
        a.click()
    }

    // ─── Reset ───
    const handleReset = () => {
        if (video?.url) URL.revokeObjectURL(video.url)
        if (result?.url) URL.revokeObjectURL(result.url)
        setVideo(null)
        setResult(null)
        setSettings(DEFAULT_GIF_SETTINGS)
        setActivePreset(1)
        setIsPlaying(false)
    }

    // ─── Loading FFmpeg ───
    if (!loaded) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        {ffmpegError ? (
                            <>
                                <AlertCircle className="w-10 h-10 text-red-400" />
                                <p className="text-red-600 text-sm">{ffmpegError}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Reload Page
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-700">
                                        {downloadProgress?.label || 'Initializing...'}
                                    </p>
                                    {downloadProgress && (
                                        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-auto">
                                            <div
                                                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                                style={{ width: `${downloadProgress.overallPercent}%` }}
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400">Loading video engine (~5MB)</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ─── No Video Selected ───
    if (!video) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div
                    {...getRootProps()}
                    className={cn(
                        'bg-white rounded-2xl border-2 border-dashed p-16 transition-all cursor-pointer shadow-sm',
                        isDragActive
                            ? 'border-primary-400 bg-primary-50/30'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    )}
                >
                    <input {...getInputProps()} id="video-upload" />
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className={cn(
                            'p-4 rounded-2xl transition-colors',
                            isDragActive ? 'bg-primary-100' : 'bg-gray-100'
                        )}>
                            <Upload className={cn('w-8 h-8', isDragActive ? 'text-primary-600' : 'text-gray-400')} />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-base font-semibold text-gray-700">
                                {isDragActive ? 'Drop your video here' : 'Upload a Video'}
                            </p>
                            <p className="text-sm text-gray-400">
                                Drag & drop or click to browse · MP4, WebM, MOV, AVI, MKV
                            </p>
                            <p className="text-xs text-gray-300">Maximum file size: 500MB</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Main UI ───
    return (
        <div className="w-full max-w-4xl mx-auto space-y-5">
            {/* Top Row: Video Preview + Settings */}
            <div className="grid lg:grid-cols-5 gap-5">
                {/* Video Preview — 3 cols */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Video */}
                    <div className="relative bg-gray-950 aspect-video">
                        <video
                            ref={videoRef}
                            src={video.url}
                            className="w-full h-full object-contain"
                            muted
                            playsInline
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                        />
                        {/* Play overlay */}
                        <button
                            onClick={togglePlayback}
                            className="absolute inset-0 flex items-center justify-center group"
                        >
                            <div className={cn(
                                'p-3 rounded-full bg-black/40 backdrop-blur-sm transition-all group-hover:bg-black/60',
                                isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                            )}>
                                {isPlaying
                                    ? <Pause className="w-6 h-6 text-white" />
                                    : <Play className="w-6 h-6 text-white ml-0.5" />}
                            </div>
                        </button>
                    </div>

                    {/* Timeline / Range */}
                    <div className="px-4 py-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Scissors className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Trim</span>
                            <span className="text-[11px] text-gray-400 ml-auto font-mono">
                                {formatTime(settings.startTime)} – {formatTime(settings.startTime + settings.duration)} / {formatTime(video.duration)}
                            </span>
                        </div>

                        {/* Custom Range Slider */}
                        <div
                            ref={rangeTrackRef}
                            className="relative h-8 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        >
                            {/* Selected range highlight */}
                            <div
                                className="absolute top-0 bottom-0 bg-primary-100 border-x-2 border-primary-400"
                                style={{
                                    left: `${(settings.startTime / video.duration) * 100}%`,
                                    width: `${(settings.duration / video.duration) * 100}%`,
                                }}
                            />
                            {/* Start slider */}
                            <input
                                type="range"
                                min={0}
                                max={video.duration}
                                step={0.1}
                                value={settings.startTime}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value)
                                    setSettings(prev => ({
                                        ...prev,
                                        startTime: val,
                                        duration: Math.min(prev.duration, video.duration - val),
                                    }))
                                    if (videoRef.current) videoRef.current.currentTime = val
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Duration input */}
                        <div className="flex items-center gap-3 mt-2">
                            <label className="text-xs text-gray-500">Duration:</label>
                            <input
                                type="range"
                                min={0.5}
                                max={Math.min(30, video.duration - settings.startTime)}
                                step={0.5}
                                value={settings.duration}
                                onChange={(e) => setSettings(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                                className="flex-1 h-1.5 accent-primary-600"
                            />
                            <span className="text-xs font-mono text-gray-500 w-8 text-right">{settings.duration}s</span>
                        </div>
                    </div>

                    {/* File info */}
                    <div className="px-4 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2">
                        <FileVideo className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate flex-1">{video.name}</span>
                        <span className="text-xs text-gray-400">{formatSize(video.size)}</span>
                    </div>
                </div>

                {/* Settings Panel — 2 cols */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-800">Settings</span>
                    </div>

                    <div className="p-4 space-y-5">
                        {/* Quality Presets */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map((preset, i) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => applyPreset(i)}
                                        className={cn(
                                            'p-2.5 rounded-xl text-left transition-all border',
                                            activePreset === i
                                                ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-200'
                                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                        )}
                                    >
                                        <p className={cn(
                                            'text-sm font-semibold',
                                            activePreset === i ? 'text-primary-700' : 'text-gray-700'
                                        )}>
                                            {preset.label}
                                        </p>
                                        <p className="text-[10px] text-gray-400">{preset.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FPS */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Frame Rate</label>
                                <span className="text-xs font-mono text-gray-500">{settings.fps} fps</span>
                            </div>
                            <input
                                type="range"
                                min={5}
                                max={30}
                                step={1}
                                value={settings.fps}
                                onChange={(e) => {
                                    setSettings(prev => ({ ...prev, fps: parseInt(e.target.value) }))
                                    setActivePreset(-1)
                                }}
                                className="w-full h-1.5 accent-primary-600"
                            />
                            <div className="flex justify-between text-[10px] text-gray-300">
                                <span>5 fps</span>
                                <span>30 fps</span>
                            </div>
                        </div>

                        {/* Width */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Width</label>
                                <span className="text-xs font-mono text-gray-500">{settings.width}px</span>
                            </div>
                            <input
                                type="range"
                                min={160}
                                max={1280}
                                step={10}
                                value={settings.width}
                                onChange={(e) => {
                                    setSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))
                                    setActivePreset(-1)
                                }}
                                className="w-full h-1.5 accent-primary-600"
                            />
                            <div className="flex justify-between text-[10px] text-gray-300">
                                <span>160px</span>
                                <span>1280px</span>
                            </div>
                        </div>

                        {/* Estimated info */}
                        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Estimated</p>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Total frames</span>
                                <span className="font-mono">{Math.ceil(settings.fps * settings.duration)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Duration</span>
                                <span className="font-mono">{settings.duration}s</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 pt-0 space-y-2">
                        <button
                            onClick={handleConvert}
                            disabled={isConverting}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
                                isConverting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm active:scale-[0.98]'
                            )}
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Converting... {progress}%
                                </>
                            ) : (
                                <>
                                    <Image className="w-4 h-4" />
                                    Convert to GIF
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleReset}
                            disabled={isConverting}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Upload different video
                        </button>
                    </div>
                </div>
            </div>

            {/* Converting Progress Bar */}
            {isConverting && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-primary-600 animate-spin shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Creating GIF...</span>
                                <span className="text-sm font-mono text-gray-500">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-gray-400">
                                Generating palette and encoding frames. This may take a moment for longer clips.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-800">Result</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatSize(result.size)}</span>
                            <span className="text-gray-300">·</span>
                            <span>{(result.timeTaken / 1000).toFixed(1)}s</span>
                        </div>
                    </div>

                    {/* GIF Preview */}
                    <div className="bg-gray-950 flex items-center justify-center p-4" style={{ maxHeight: '400px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={result.url}
                            alt="Converted GIF"
                            className="max-w-full max-h-[368px] rounded-lg"
                        />
                    </div>

                    {/* Stats + Download */}
                    <div className="px-5 py-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-700">{result.fileName}</p>
                            <p className="text-xs text-gray-400">
                                {formatSize(video.size)} → {formatSize(result.size)}
                                {result.size < video.size && (
                                    <span className="text-emerald-500 ml-1">
                                        ({Math.round((1 - result.size / video.size) * 100)}% smaller)
                                    </span>
                                )}
                                {result.size >= video.size && (
                                    <span className="text-amber-500 ml-1">
                                        (GIFs are typically larger than compressed video)
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm active:scale-[0.98]"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                </div>
            )}

            {/* FFmpeg Error */}
            {ffmpegError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-700">Conversion Error</p>
                        <p className="text-xs text-red-500 mt-0.5">{ffmpegError}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
