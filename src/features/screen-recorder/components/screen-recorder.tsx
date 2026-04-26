'use client'

import { useState, useRef } from 'react'
import {
    MonitorUp,
    Mic,
    Volume2,
    Settings2,
    Circle,
    Pause,
    Square,
    Play,
    Download,
    RotateCcw,
    AlertCircle,
    Clock,
    Film,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    useScreenRecorder,
    RecordingSettings,
    DEFAULT_SETTINGS,
    RecordingStatus,
} from '../hooks/use-screen-recorder'

// ─── Helpers ───
function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ─── Quality options ───
const QUALITY_OPTIONS = [
    { value: 'low', label: 'Low', desc: '1 Mbps' },
    { value: 'medium', label: 'Medium', desc: '2.5 Mbps' },
    { value: 'high', label: 'High', desc: '5 Mbps' },
] as const

// ─── Format options ───
const FORMAT_OPTIONS = [
    { value: 'webm', label: 'WebM' },
    { value: 'mp4', label: 'MP4' },
] as const

// ─── Status badge ───
function StatusBadge({ status }: { status: RecordingStatus }) {
    const config = {
        idle: { label: 'Ready', color: 'bg-gray-100 text-gray-600' },
        recording: { label: 'Recording', color: 'bg-red-50 text-red-600' },
        paused: { label: 'Paused', color: 'bg-amber-50 text-amber-600' },
        stopped: { label: 'Completed', color: 'bg-green-50 text-green-700' },
    }
    const { label, color } = config[status]
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                color
            )}
        >
            {status === 'recording' && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            )}
            {label}
        </span>
    )
}

// ─── Main component ───
export function ScreenRecorder() {
    const {
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
    } = useScreenRecorder()

    const [settings, setSettings] = useState<RecordingSettings>(DEFAULT_SETTINGS)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleStart = async (): Promise<void> => {
        await startRecording(settings)
    }

    const handleDownload = (): void => {
        downloadRecording()
        toast.success('Recording downloaded successfully')
    }

    const handleReset = (): void => {
        resetRecording()
    }

    // ─── Idle / Settings View ───
    if (status === 'idle' && !result) {
        return (
            <div className="space-y-6">
                {/* Start area */}
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <div className="p-8 md:p-12 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
                            <MonitorUp className="w-8 h-8 text-primary-600" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Record Your Screen
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 max-w-md">
                            Capture your entire screen, a window, or a browser tab. Everything is processed locally in your browser — nothing is uploaded.
                        </p>

                        {/* Audio toggles */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-sm">
                            <button
                                onClick={() =>
                                    setSettings((s) => ({
                                        ...s,
                                        includeAudio: !s.includeAudio,
                                    }))
                                }
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                                    settings.includeAudio
                                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                )}
                            >
                                <Mic className="w-4 h-4" />
                                Microphone
                            </button>
                            <button
                                onClick={() =>
                                    setSettings((s) => ({
                                        ...s,
                                        includeSystemAudio: !s.includeSystemAudio,
                                    }))
                                }
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                                    settings.includeSystemAudio
                                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                )}
                            >
                                <Volume2 className="w-4 h-4" />
                                System Audio
                            </button>
                        </div>

                        {/* Start button */}
                        <button
                            onClick={handleStart}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors shadow-sm"
                        >
                            <Circle className="w-4 h-4 fill-current" />
                            Start Recording
                        </button>

                        {/* Advanced settings */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="mt-4 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Settings2 className="w-3.5 h-3.5" />
                            Advanced Settings
                            {showAdvanced ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>

                    {/* Advanced settings panel */}
                    {showAdvanced && (
                        <div className="border-t border-gray-100 bg-gray-50/50 px-8 py-5">
                            <div className="max-w-sm mx-auto space-y-4">
                                {/* Format */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Output Format
                                    </label>
                                    <div className="flex gap-2">
                                        {FORMAT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() =>
                                                    setSettings((s) => ({
                                                        ...s,
                                                        format: opt.value,
                                                    }))
                                                }
                                                className={cn(
                                                    'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                                                    settings.format === opt.value
                                                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Quality */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Video Quality
                                    </label>
                                    <div className="flex gap-2">
                                        {QUALITY_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() =>
                                                    setSettings((s) => ({
                                                        ...s,
                                                        quality: opt.value,
                                                    }))
                                                }
                                                className={cn(
                                                    'flex-1 px-3 py-2 rounded-lg border text-sm transition-colors text-center',
                                                    settings.quality === opt.value
                                                        ? 'border-primary-300 bg-primary-50 text-primary-700 font-medium'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                )}
                                            >
                                                <span className="block text-sm font-medium">
                                                    {opt.label}
                                                </span>
                                                <span className="block text-[10px] mt-0.5 opacity-70">
                                                    {opt.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
            </div>
        )
    }

    // ─── Recording / Paused View ───
    if (status === 'recording' || status === 'paused') {
        return (
            <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <div className="p-8 md:p-12 flex flex-col items-center text-center">
                        {/* Recording indicator */}
                        <div className="mb-6">
                            <div
                                className={cn(
                                    'w-20 h-20 rounded-full flex items-center justify-center',
                                    status === 'recording'
                                        ? 'bg-red-50 ring-4 ring-red-100'
                                        : 'bg-amber-50 ring-4 ring-amber-100'
                                )}
                            >
                                {status === 'recording' ? (
                                    <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse" />
                                ) : (
                                    <Pause className="w-7 h-7 text-amber-600" />
                                )}
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="mb-2">
                            <StatusBadge status={status} />
                        </div>
                        <p className="text-4xl font-mono font-bold text-gray-900 tracking-wider mb-8">
                            {formatDuration(duration)}
                        </p>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {status === 'recording' ? (
                                <button
                                    onClick={pauseRecording}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                                >
                                    <Pause className="w-4 h-4" />
                                    Pause
                                </button>
                            ) : (
                                <button
                                    onClick={resumeRecording}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary-300 bg-primary-50 text-primary-700 font-medium text-sm hover:bg-primary-100 transition-colors"
                                >
                                    <Play className="w-4 h-4" />
                                    Resume
                                </button>
                            )}
                            <button
                                onClick={stopRecording}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors"
                            >
                                <Square className="w-4 h-4 fill-current" />
                                Stop Recording
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Result View ───
    if (status === 'stopped' && result) {
        return (
            <div className="space-y-6">
                {/* Video preview */}
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <div className="bg-gray-950 relative">
                        <video
                            ref={videoRef}
                            src={result.url}
                            controls
                            className="w-full max-h-[480px] object-contain"
                        />
                    </div>

                    {/* Info bar */}
                    <div className="p-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-gray-400" />
                            {result.format.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatDuration(result.duration)}
                        </span>
                        <span className="text-gray-400">
                            {formatSize(result.size)}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download Recording
                    </button>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        New Recording
                    </button>
                </div>
            </div>
        )
    }

    return null
}
