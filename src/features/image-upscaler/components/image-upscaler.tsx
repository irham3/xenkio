"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Download, RefreshCw, ZoomIn, X, ArrowRight, Sparkles, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type ScaleFactor, type UpscaleState } from "../types"
import { upscaleWithAI, type UpscalePhase } from "../lib/upscale-engine"

const SCALE_OPTIONS: { value: ScaleFactor; label: string; description: string }[] = [
    { value: 2, label: "2×", description: "Double resolution" },
    { value: 4, label: "4×", description: "Quadruple resolution" },
]

const LARGE_IMAGE_THRESHOLD = 1000

const DEFAULT_SLIDER_WIDTH = 600

function formatSize(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function formatDimension(w: number, h: number): string {
    return `${w} × ${h} px`
}

function getProcessingLabel(phase: UpscalePhase | null, progress: number): string {
    if (phase === "loading-model") return "Downloading AI model..."
    if (phase === "processing") {
        return progress > 0 ? `Enhancing... ${Math.round(progress * 100)}%` : "Enhancing..."
    }
    return "Processing..."
}

const INITIAL_STATE: UpscaleState = {
    originalFile: null,
    originalPreview: null,
    upscaledDataUrl: null,
    originalWidth: 0,
    originalHeight: 0,
    upscaledWidth: 0,
    upscaledHeight: 0,
    status: "idle",
    error: null,
    progress: 0,
    phase: null,
}

export function ImageUpscaler() {
    const [state, setState] = useState<UpscaleState>(INITIAL_STATE)
    const [scaleFactor, setScaleFactor] = useState<ScaleFactor>(4)
    const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png">("image/jpeg")
    const [compareMode, setCompareMode] = useState<"side" | "slider">("side")
    const [sliderX, setSliderX] = useState(50)

    const sliderContainerRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)

    const loadImage = useCallback((file: File) => {
        const preview = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            setState({
                ...INITIAL_STATE,
                originalFile: file,
                originalPreview: preview,
                originalWidth: img.naturalWidth,
                originalHeight: img.naturalHeight,
            })
        }
        img.src = preview
    }, [])

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles[0]) loadImage(acceptedFiles[0])
        },
        [loadImage]
    )

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
        multiple: false,
        noClick: true,
    })

    const handleUpscale = async () => {
        if (!state.originalFile) return
        setState((prev) => ({
            ...prev,
            status: "loading-model",
            upscaledDataUrl: null,
            error: null,
            progress: 0,
            phase: "loading-model",
        }))
        try {
            const { dataUrl, width, height } = await upscaleWithAI(
                state.originalFile,
                scaleFactor,
                outputFormat,
                (amount, phase) => {
                    setState((prev) => ({ ...prev, status: phase, progress: amount, phase }))
                }
            )
            setState((prev) => ({
                ...prev,
                status: "done",
                upscaledDataUrl: dataUrl,
                upscaledWidth: width,
                upscaledHeight: height,
                phase: null,
            }))
        } catch (err) {
            setState((prev) => ({
                ...prev,
                status: "error",
                error: err instanceof Error ? err.message : "Upscaling failed",
                phase: null,
            }))
        }
    }

    const handleDownload = () => {
        if (!state.upscaledDataUrl || !state.originalFile) return
        const ext = outputFormat === "image/png" ? "png" : "jpg"
        const baseName = state.originalFile.name.replace(/\.[^.]+$/, "")
        const link = document.createElement("a")
        link.href = state.upscaledDataUrl
        link.download = `upscaled-${scaleFactor}x-${baseName}.${ext}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleClear = () => {
        if (state.originalPreview) URL.revokeObjectURL(state.originalPreview)
        setState(INITIAL_STATE)
    }

    const handleSliderMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !sliderContainerRef.current) return
        const rect = sliderContainerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        setSliderX(Math.round((x / rect.width) * 100))
    }, [])

    const handleSliderTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (!sliderContainerRef.current) return
        const touch = e.touches[0]
        const rect = sliderContainerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
        setSliderX(Math.round((x / rect.width) * 100))
    }, [])

    const hasImage = !!state.originalFile
    const isProcessing = state.status === "loading-model" || state.status === "processing"
    const isDone = state.status === "done"

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8" {...getRootProps()}>
            <input {...getInputProps()} />

            {/* Header */}
            <div className="text-center space-y-4 mb-2">
                <div className="inline-flex items-center gap-2 text-primary-600 bg-primary-50 border border-primary-100 rounded-full px-3 py-1 text-xs font-medium mb-2">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered • Swin2SR Super-Resolution
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                    Image Upscaler
                </h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Enlarge images up to 4× with AI super-resolution — sharper detail, better textures. Processed entirely in your browser.
                </p>
            </div>

            {!hasImage ? (
                /* ── Empty State ── */
                <div
                    onClick={open}
                    className={cn(
                        "group relative border-2 border-dashed rounded-3xl p-20 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden bg-white hover:border-primary-500 hover:bg-gray-50",
                        isDragActive ? "border-primary-500 bg-primary-50 scale-[1.01]" : "border-gray-200"
                    )}
                >
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <div
                            className={cn(
                                "p-6 rounded-full bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md",
                                isDragActive && "bg-white shadow-md scale-110"
                            )}
                        >
                            <ZoomIn className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-semibold text-gray-900">
                                {isDragActive ? "Drop image here" : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-gray-500">JPG, PNG or WEBP</p>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── Active State ── */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left: Preview Panel ── */}
                    <div className="col-span-1 lg:col-span-2 space-y-4">

                        {/* Toolbar */}
                        <div className="flex items-center justify-between">
                            <Button onClick={open} variant="outline" size="sm" className="gap-2">
                                <Upload className="w-4 h-4" />
                                Change Image
                            </Button>

                            {isDone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5">
                                    <span
                                        className={cn("cursor-pointer hover:text-gray-900 transition-colors", compareMode === "side" && "text-gray-900 font-medium")}
                                        onClick={() => setCompareMode("side")}
                                    >
                                        Side by side
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span
                                        className={cn("cursor-pointer hover:text-gray-900 transition-colors", compareMode === "slider" && "text-gray-900 font-medium")}
                                        onClick={() => setCompareMode("slider")}
                                    >
                                        Slider
                                    </span>
                                </div>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 gap-1.5"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </Button>
                        </div>

                        {/* Image Preview */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden min-h-[360px] flex items-center justify-center p-4">
                            {!isDone ? (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={state.originalPreview ?? ""}
                                        alt="Original"
                                        className={cn(
                                            "max-h-[400px] max-w-full object-contain rounded-xl shadow-sm transition-opacity",
                                            isProcessing && "opacity-50"
                                        )}
                                    />
                                    {isProcessing && (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                {getProcessingLabel(state.phase, state.progress)}
                                            </div>
                                            {state.phase === "processing" && state.progress > 0 && (
                                                <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${state.progress * 100}%` }}
                                                    />
                                                </div>
                                            )}
                                            {state.phase === "loading-model" && (
                                                <p className="text-xs text-gray-400">
                                                    Downloading AI model (~10 MB) — cached after first use…
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {state.status === "error" && (
                                        <p className="text-red-500 text-sm">{state.error}</p>
                                    )}
                                </div>
                            ) : compareMode === "side" ? (
                                /* Side-by-side */
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                            Original
                                        </span>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={state.originalPreview ?? ""}
                                            alt="Original"
                                            className="w-full max-h-[360px] object-contain rounded-xl shadow-sm"
                                        />
                                        <span className="text-xs text-gray-400">
                                            {formatDimension(state.originalWidth, state.originalHeight)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xs font-medium text-primary-600 uppercase tracking-wide bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            AI {scaleFactor}×
                                        </span>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={state.upscaledDataUrl ?? ""}
                                            alt="Upscaled"
                                            className="w-full max-h-[360px] object-contain rounded-xl shadow-sm"
                                        />
                                        <span className="text-xs text-gray-400">
                                            {formatDimension(state.upscaledWidth, state.upscaledHeight)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* Slider compare */
                                <div
                                    ref={sliderContainerRef}
                                    className="relative w-full select-none overflow-hidden rounded-xl cursor-col-resize"
                                    style={{ aspectRatio: `${state.originalWidth}/${state.originalHeight}`, maxHeight: "400px" }}
                                    onMouseDown={() => { isDraggingRef.current = true }}
                                    onMouseUp={() => { isDraggingRef.current = false }}
                                    onMouseLeave={() => { isDraggingRef.current = false }}
                                    onMouseMove={handleSliderMouseMove}
                                    onTouchMove={handleSliderTouchMove}
                                >
                                    {/* Upscaled (full width, bottom layer) */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={state.upscaledDataUrl ?? ""}
                                        alt="Upscaled"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    {/* Original (left side, clipped) */}
                                    <div
                                        className="absolute inset-0 overflow-hidden"
                                        style={{ width: `${sliderX}%` }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={state.originalPreview ?? ""}
                                            alt="Original"
                                            className="absolute inset-0 h-full object-cover"
                                            style={{ width: `${sliderContainerRef.current?.offsetWidth ?? DEFAULT_SLIDER_WIDTH}px`, maxWidth: "none" }}
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
                                        style={{ left: `${sliderX}%` }}
                                    >
                                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                                            <ArrowRight className="w-3 h-3 text-gray-600 -ml-0.5" />
                                        </div>
                                    </div>
                                    <span className="absolute top-2 left-2 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        Original
                                    </span>
                                    <span className="absolute top-2 right-2 text-xs font-medium text-white bg-primary-600/80 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        AI {scaleFactor}×
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Dimension info bar */}
                        {isDone && (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-4 text-sm text-gray-600 bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
                                >
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-0.5">Original</p>
                                        <p className="font-medium">{formatDimension(state.originalWidth, state.originalHeight)}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                    <div className="text-center">
                                        <p className="text-xs text-primary-500 mb-0.5">AI Enhanced</p>
                                        <p className="font-medium text-primary-700">{formatDimension(state.upscaledWidth, state.upscaledHeight)}</p>
                                    </div>
                                    {state.originalFile && (
                                        <>
                                            <div className="w-px h-8 bg-gray-100" />
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 mb-0.5">Original size</p>
                                                <p className="font-medium">{formatSize(state.originalFile.size)}</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>

                    {/* ── Right: Settings Sidebar ── */}
                    <div className="col-span-1">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 sticky top-6 shadow-sm">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                                <Sparkles className="w-5 h-5 text-primary-600" />
                                <h2 className="font-semibold text-gray-900">Upscale Settings</h2>
                            </div>

                            {/* Scale Factor */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">Scale Factor</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {SCALE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setScaleFactor(opt.value)}
                                            disabled={isProcessing}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed",
                                                scaleFactor === opt.value
                                                    ? "border-primary-500 bg-primary-50 text-primary-700"
                                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                            )}
                                        >
                                            <span className="text-lg font-bold">{opt.label}</span>
                                            <span className="text-xs text-gray-400 mt-0.5">{opt.description}</span>
                                        </button>
                                    ))}
                                </div>
                                {state.originalWidth > 0 && (
                                    <p className="text-xs text-gray-400 text-center">
                                        Result: {state.originalWidth * scaleFactor} × {state.originalHeight * scaleFactor} px
                                    </p>
                                )}
                                {(state.originalWidth > LARGE_IMAGE_THRESHOLD || state.originalHeight > LARGE_IMAGE_THRESHOLD) && (
                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        <span>Large image detected — processing may take a while. For faster results, use an image under 1000 × 1000 px.</span>
                                    </div>
                                )}
                            </div>

                            {/* Output Format */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">Output Format</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {(["image/jpeg", "image/png"] as const).map((fmt) => (
                                        <button
                                            key={fmt}
                                            onClick={() => setOutputFormat(fmt)}
                                            disabled={isProcessing}
                                            className={cn(
                                                "py-2.5 rounded-xl border-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                                outputFormat === fmt
                                                    ? "border-primary-500 bg-primary-50 text-primary-700"
                                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                            )}
                                        >
                                            {fmt === "image/jpeg" ? "JPG" : "PNG"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI badge */}
                            <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-xs text-primary-700 space-y-1">
                                <p className="font-medium flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    Swin2SR Super-Resolution
                                </p>
                                <p className="text-primary-600/80 leading-relaxed">
                                    AI model fetched from Hugging Face CDN on first use, then cached. Sharper edges, reconstructed textures — noticeably better than interpolation.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 border-t border-gray-100 space-y-3">
                                <Button
                                    className="w-full h-12 text-base font-medium shadow-primary-500/20 shadow-lg hover:shadow-primary-500/30 transition-all"
                                    size="lg"
                                    onClick={handleUpscale}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            {state.phase === "loading-model" ? "Loading AI..." : `${Math.round(state.progress * 100)}%`}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Upscale with AI
                                        </>
                                    )}
                                </Button>

                                {isDone && (
                                    <Button
                                        variant="outline"
                                        className="w-full h-12"
                                        onClick={handleDownload}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Result
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
