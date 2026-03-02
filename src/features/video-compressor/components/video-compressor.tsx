'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, FileVideo, Settings2, Zap, Shield, AlertCircle, CheckCircle2, Film, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useVideoCompressor } from '../hooks/use-video-compressor'
import { CompressionSettings } from '../types'
import { DEFAULT_SETTINGS, QUALITY_PRESETS, RESOLUTION_OPTIONS } from '../constants'

interface VideoFileState {
    file: File
    name: string
    size: number
}

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatTime(ms: number): string {
    const seconds = Math.round(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}m ${sec}s`
}

export function VideoCompressor() {
    const { loaded, isLoading, isCompressing, progress, error: hookError, compressVideo, downloadProgress } = useVideoCompressor()
    const [file, setFile] = useState<VideoFileState | null>(null)
    const [result, setResult] = useState<ReturnType<typeof compressVideo> extends Promise<infer T> ? T : never>(null)
    const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS)
    const [activeQualityPreset, setActiveQualityPreset] = useState<number>(1) // 0=high, 1=balanced, 2=small, 3=tiny

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const video = acceptedFiles[0]
        if (!video) return

        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/avi']
        if (!validTypes.includes(video.type) && !video.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
            toast.error('Unsupported file type. Please upload MP4, WebM, MOV, MKV, or AVI.')
            return
        }

        if (video.size > 500 * 1024 * 1024) {
            toast.error('File too large. Maximum 500MB for browser compression.')
            return
        }

        setFile({ file: video, name: video.name, size: video.size })
        setResult(null)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.webm', '.mov', '.mkv', '.avi'] },
        maxFiles: 1,
        disabled: isCompressing,
    })

    const handleCompress = async () => {
        if (!file || !loaded) return
        try {
            const res = await compressVideo(file.file, settings)
            if (res) {
                setResult(res)
                const pctSaved = Math.round(((file.size - res.size) / file.size) * 100)
                if (pctSaved > 0) {
                    toast.success(`Compressed! ${pctSaved}% smaller in ${formatTime(res.timeTaken)}`)
                } else {
                    toast.info('Compression complete.')
                }
            }
        } catch {
            toast.error('Compression failed. Please try again.')
        }
    }

    const handleDownload = () => {
        if (!result || !result.url || !result.blob || result.blob.size === 0) {
            toast.error('Download not available — file may be corrupted.')
            return
        }

        // Re-create blob URL fresh to avoid stale/revoked URL issues
        const freshUrl = URL.createObjectURL(result.blob)
        const a = document.createElement('a')
        a.href = freshUrl
        a.download = result.fileName
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()

        // Cleanup after a short delay so the browser has time to start the download
        setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(freshUrl)
        }, 1000)
    }

    const handleReset = () => {
        if (result?.url) URL.revokeObjectURL(result.url)
        setFile(null)
        setResult(null)
        setSettings(DEFAULT_SETTINGS)
        setActiveQualityPreset(1)
    }

    const handlePresetClick = (presetIndex: number) => {
        const preset = QUALITY_PRESETS[presetIndex]
        setActiveQualityPreset(presetIndex)
        setSettings(s => ({
            ...s,
            ratio: preset.ratio,
            resolution: preset.resolution,
        }))
    }

    // Compute stats
    const savedPct = result && file ? Math.round(((file.size - result.size) / file.size) * 100) : 0

    // Estimated target size for display
    const estimatedSize = file ? file.size * settings.ratio : 0

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Video Compressor
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Compress MP4, WebM, MOV videos directly in your browser. <br /> No upload needed, your files stay private.
                </p>
            </div>

            {/* Engine Loading State */}
            {isLoading && downloadProgress && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary-50">
                            <RefreshCw className="w-5 h-5 text-primary-600 animate-spin" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Downloading Video Engine</p>
                            <p className="text-sm text-gray-500">
                                {downloadProgress.label}
                                {downloadProgress.total > 0 && (
                                    <> | {formatSize(downloadProgress.loaded)} / {formatSize(downloadProgress.total)}</>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Progress value={downloadProgress.overallPercent} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>First time only (~31MB)</span>
                            <span>{Math.round(downloadProgress.overallPercent)}%</span>
                        </div>
                    </div>
                </div>
            )}

            {hookError && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-700">Engine Error</p>
                            <p className="text-sm text-red-600 mt-1">{hookError}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="bg-white hover:bg-red-50 text-red-700 border-red-200 hover:border-red-300"
                    >
                        Reload Page
                    </Button>
                </div>
            )}

            {/* Dropzone */}
            {loaded && !file && !hookError && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative group border-2 border-dashed rounded-2xl px-12 py-32 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden bg-white shadow-sm hover:shadow-md",
                        isDragActive
                            ? 'border-primary-600 bg-primary-50 scale-[1.01]'
                            : 'border-gray-200 hover:border-primary-600/50 hover:bg-gray-50'
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className={cn(
                            'p-4 rounded-full bg-gray-100 transition-transform duration-300 group-hover:scale-110',
                            isDragActive && 'bg-white'
                        )}>
                            <Upload className="w-8 h-8 text-gray-900" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-medium text-gray-900">
                                {isDragActive ? 'Drop your video here' : 'Drop a video file here or click to browse'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Supports MP4, WebM, MOV, MKV, AVI • Max 500MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* File Selected | Settings & Compress */}
            {file && !result && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* File Info + Compress Button */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        {/* File Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gray-100 shrink-0">
                                <FileVideo className="w-6 h-6 text-gray-900" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-medium truncate max-w-md">{file.name}</h4>
                                <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleReset} disabled={isCompressing}>
                                Change
                            </Button>
                        </div>

                        {/* Estimated size indicator */}
                        <div className="bg-primary-50 border border-primary-100 rounded-xl px-5 py-3 flex items-center justify-between">
                            <span className="text-sm text-primary-700">
                                Target: ~{formatSize(estimatedSize)} ({Math.round(settings.ratio * 100)}% of original)
                            </span>
                            <span className="text-xs text-primary-500">
                                {settings.resolution !== 'original' && `${settings.resolution}p • `}
                                {settings.audioMode === 'remove' ? 'No audio' : settings.audioMode === 'copy' ? 'Audio copied' : `Audio ${settings.audioBitrate}k`}
                            </span>
                        </div>

                        {/* Progress or Compress Button */}
                        {isCompressing ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-primary-600 animate-spin" />
                                        <span className="font-medium text-gray-900">Compressing...</span>
                                    </div>
                                    <span className="text-gray-500">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-gray-400 text-center">
                                    This may take a while depending on file size and settings.
                                </p>
                            </div>
                        ) : (
                            <Button
                                onClick={handleCompress}
                                disabled={!loaded || isCompressing}
                                size="lg"
                                className="w-full"
                            >
                                <Zap className="mr-2 h-4 w-4" />
                                Compress to ~{formatSize(estimatedSize)}
                            </Button>
                        )}
                    </div>

                    {/* Settings Panel */}
                    <div className="col-span-1 bg-white border border-gray-200 rounded-2xl p-6 space-y-6 h-fit sticky top-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <Settings2 className="w-5 h-5 text-primary-600" />
                            <h2 className="font-semibold text-lg">Settings</h2>
                        </div>

                        <Tabs defaultValue="simple">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="simple">Simple</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            </TabsList>

                            <TabsContent value="simple" className="space-y-3">
                                {QUALITY_PRESETS.map((preset, idx) => (
                                    <button
                                        key={preset.ratio}
                                        onClick={() => handlePresetClick(idx)}
                                        className={cn(
                                            'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                                            activeQualityPreset === idx
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-600/50 hover:bg-gray-50'
                                        )}
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{preset.label}</p>
                                            <p className="text-xs text-gray-500">{preset.description}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="text-sm font-semibold text-primary-600">
                                                ~{formatSize(file.size * preset.ratio)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {Math.round((1 - preset.ratio) * 100)}% smaller
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </TabsContent>

                            <TabsContent value="advanced" className="space-y-5">
                                {/* Compression Ratio Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-900">Compression</span>
                                        <span className="text-gray-500">{Math.round(settings.ratio * 100)}% of original</span>
                                    </div>
                                    <Slider
                                        value={[settings.ratio * 100]}
                                        onValueChange={([v]) => setSettings((s) => ({ ...s, ratio: v / 100 }))}
                                        min={5}
                                        max={90}
                                        step={5}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Smallest (5%)</span>
                                        <span>Largest (90%)</span>
                                    </div>
                                    <p className="text-xs text-primary-600 font-medium text-center">
                                        Target: ~{formatSize(file.size * settings.ratio)}
                                    </p>
                                </div>

                                {/* Resolution */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-gray-900">Resolution</span>
                                    <Select
                                        value={settings.resolution}
                                        onValueChange={(v) => setSettings((s) => ({ ...s, resolution: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RESOLUTION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Audio Settings */}
                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <span className="text-sm font-medium text-gray-900">Audio</span>
                                    <Select
                                        value={settings.audioMode}
                                        onValueChange={(v: 'copy' | 'compress' | 'remove') => setSettings(s => ({ ...s, audioMode: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="copy">Copy audio (fastest)</SelectItem>
                                            <SelectItem value="compress">Re-encode audio</SelectItem>
                                            <SelectItem value="remove">Remove audio</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {settings.audioMode === 'compress' && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Audio Bitrate</span>
                                                <span className="text-gray-500">{settings.audioBitrate} kbps</span>
                                            </div>
                                            <Slider
                                                value={[settings.audioBitrate]}
                                                onValueChange={([v]) => setSettings(s => ({ ...s, audioBitrate: v }))}
                                                min={32}
                                                max={192}
                                                step={16}
                                            />
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Compression Complete</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-sm text-gray-500">Original</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{formatSize(file!.size)}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-sm text-gray-500">Compressed</p>
                            <p className="text-lg font-bold text-primary-600 mt-1">{formatSize(result.size)}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
                            <p className="text-sm text-gray-500">Saved</p>
                            <p className="text-lg font-bold text-green-600 mt-1">
                                {savedPct > 0 ? `${savedPct}%` : '<1%'}
                            </p>
                        </div>
                    </div>

                    {result.timeTaken > 0 && (
                        <p className="text-xs text-gray-400 text-center">
                            Processed in {formatTime(result.timeTaken)}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <Button onClick={handleDownload} size="lg" className="flex-1 gap-2">
                            <Download className="w-4 h-4" />
                            Download ({formatSize(result.size)})
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleReset}>
                            New Video
                        </Button>
                    </div>
                </div>
            )}

            {/* Info Cards */}
            {!file && loaded && (
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                        <Shield className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-gray-900">100% Private</p>
                            <p className="text-xs text-gray-500 mt-0.5">Videos are processed in your browser. Nothing is uploaded.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                        <Settings2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-gray-900">Target Size Control</p>
                            <p className="text-xs text-gray-500 mt-0.5">Set your desired output size — guaranteed smaller every time.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                        <Film className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-gray-900">H.264 Output</p>
                            <p className="text-xs text-gray-500 mt-0.5">Universal MP4 format playable on all devices.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
