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

export function VideoCompressor() {
    const { loaded, isLoading, isCompressing, progress, error: hookError, compressVideo, downloadProgress, reset } = useVideoCompressor()
    const [file, setFile] = useState<VideoFileState | null>(null)
    const [result, setResult] = useState<ReturnType<typeof compressVideo> extends Promise<infer T> ? T : never>(null)
    const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS)

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
                toast.success('Video compressed successfully!')
            }
        } catch {
            toast.error('Compression failed. Please try again.')
        }
    }

    const handleDownload = () => {
        if (!result) return
        const a = document.createElement('a')
        a.href = result.url
        a.download = result.fileName
        a.click()
    }

    const handleReset = () => {
        if (result?.url) URL.revokeObjectURL(result.url)
        setFile(null)
        setResult(null)
        setSettings(DEFAULT_SETTINGS)
    }

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

            {/* Engine Loading State with Progress Bar */}
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
                        onClick={reset}
                        className="bg-white hover:bg-red-50 text-red-700 border-red-200 hover:border-red-300"
                    >
                        Retry
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
                                Compress Video
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
                                {QUALITY_PRESETS.map((preset) => (
                                    <button
                                        key={preset.crf}
                                        onClick={() => setSettings((s) => ({ ...s, crf: preset.crf }))}
                                        className={cn(
                                            'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                                            settings.crf === preset.crf
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-600/50 hover:bg-gray-50'
                                        )}
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{preset.label}</p>
                                            <p className="text-xs text-gray-500">{preset.description}</p>
                                        </div>
                                        {settings.crf === preset.crf && (
                                            <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </TabsContent>

                            <TabsContent value="advanced" className="space-y-5">
                                {/* CRF Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-900">Quality (CRF)</span>
                                        <span className="text-gray-500">{settings.crf}</span>
                                    </div>
                                    <Slider
                                        value={[settings.crf]}
                                        onValueChange={([v]) => setSettings((s) => ({ ...s, crf: v }))}
                                        min={18}
                                        max={40}
                                        step={1}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Better Quality</span>
                                        <span>Smaller File</span>
                                    </div>
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
                        <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-sm text-gray-500">Saved</p>
                            <p className="text-lg font-bold text-green-600 mt-1">
                                {Math.round(((file!.size - result.size) / file!.size) * 100)}%
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <Button onClick={handleDownload} size="lg" className="flex-1 gap-2">
                            <Download className="w-4 h-4" />
                            Download Compressed Video
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
                            <p className="font-medium text-sm text-gray-900">Custom Quality</p>
                            <p className="text-xs text-gray-500 mt-0.5">Fine-tune compression with CRF and resolution controls.</p>
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
