'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Eraser, Brush, Undo, Redo, Save, X, ZoomIn, ZoomOut, Check, MousePointer2, Image as ImageIcon, Palette, PaintBucket, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SOLID_COLORS, GRADIENTS, IMAGE_TEMPLATES, Gradient } from '../constants'

interface BackgroundEditorProps {
    originalUrl: string
    resultUrl: string
    onSave: (blob: Blob) => void
    onCancel: () => void
}

type BackgroundType = 'transparent' | 'color' | 'gradient' | 'image'

export function BackgroundEditor({ originalUrl, resultUrl, onSave, onCancel }: BackgroundEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Editor State
    const [activeTab, setActiveTab] = useState<'manual' | 'background'>('manual')

    // Manual Tools
    const [mode, setMode] = useState<'erase' | 'restore'>('erase')
    const [brushSize, setBrushSize] = useState([30])

    // Background Tools
    const [bgType, setBgType] = useState<BackgroundType>('transparent')
    const [bgValue, setBgValue] = useState<string>('') // Hex, Gradient ID, or URL
    const [bgImageFile, setBgImageFile] = useState<HTMLImageElement | null>(null) // Loaded image for drawing

    // Zoom & Pan
    const [zoom, setZoom] = useState(1)
    const MIN_ZOOM = 0.5
    const MAX_ZOOM = 3.0

    // Images & State
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [canvasDims, setCanvasDims] = useState<{ width: number, height: number } | null>(null)

    // History
    const [history, setHistory] = useState<ImageData[]>([])
    const [historyStep, setHistoryStep] = useState(-1)

    // Cursor
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
    const [showCursor, setShowCursor] = useState(false)

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const imgResult = new Image()
        imgResult.setAttribute('crossOrigin', 'anonymous')
        imgResult.src = resultUrl

        const imgOriginal = new Image()
        imgOriginal.setAttribute('crossOrigin', 'anonymous')
        imgOriginal.src = originalUrl

        Promise.all([
            new Promise(r => imgResult.onload = r),
            new Promise(r => imgOriginal.onload = r)
        ]).then(() => {
            canvas.width = imgResult.naturalWidth
            canvas.height = imgResult.naturalHeight
            setCanvasDims({ width: imgResult.naturalWidth, height: imgResult.naturalHeight })

            ctx.drawImage(imgResult, 0, 0)
            setOriginalImage(imgOriginal)

            const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height)
            setHistory([initialState])
            setHistoryStep(0)

            // Fit zoom
            const container = containerRef.current
            if (container) {
                const padding = 40
                const availableW = container.clientWidth - padding
                const availableH = container.clientHeight - padding
                const scaleW = availableW / imgResult.naturalWidth
                const scaleH = availableH / imgResult.naturalHeight
                const fitScale = Math.min(scaleW, scaleH, 1)
                setZoom(parseFloat(fitScale.toFixed(2)))
            }
        })
    }, [originalUrl, resultUrl])

    // Load Background Image if selected
    useEffect(() => {
        if (bgType === 'image' && bgValue) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = bgValue
            img.onload = () => setBgImageFile(img)
        } else {
            setBgImageFile(null)
        }
    }, [bgType, bgValue])

    // History Logic
    const pushHistory = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const newState = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const newHistory = history.slice(0, historyStep + 1)
        newHistory.push(newState)
        if (newHistory.length > 20) newHistory.shift()

        setHistory(newHistory)
        setHistoryStep(newHistory.length - 1)
    }

    const undo = useCallback(() => {
        if (historyStep <= 0) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const prevStep = historyStep - 1
        ctx.putImageData(history[prevStep], 0, 0)
        setHistoryStep(prevStep)
    }, [history, historyStep])

    const redo = useCallback(() => {
        if (historyStep >= history.length - 1) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const nextStep = historyStep + 1
        ctx.putImageData(history[nextStep], 0, 0)
        setHistoryStep(nextStep)
    }, [history, historyStep])

    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) {
                    e.preventDefault()
                    redo()
                } else {
                    e.preventDefault()
                    undo()
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault()
                redo()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo])

    // Main interaction Logic
    const handleZoomIn = () => setZoom(prev => Math.min(MAX_ZOOM, prev + 0.25))
    const handleZoomOut = () => setZoom(prev => Math.max(MIN_ZOOM, prev - 0.25))

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)))
        }
    }

    const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        let clientX, clientY
        if ('touches' in e) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else {
            clientX = (e as React.MouseEvent).clientX
            clientY = (e as React.MouseEvent).clientY
        }
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        }
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !originalImage || !canvasRef.current || activeTab !== 'manual') return
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        const { x, y } = getCanvasPoint(e)
        const scaleFactor = Math.max(canvasDims?.width || 1000, canvasDims?.height || 1000) / 1000
        const radius = (brushSize[0] * scaleFactor) / 2

        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)

        if (mode === 'erase') {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.fill()
        } else {
            ctx.clip()
            ctx.globalCompositeOperation = 'source-over'
            ctx.drawImage(originalImage, 0, 0)
        }
        ctx.restore()
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (activeTab !== 'manual') return
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false)
            pushHistory()
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setCursorPos({ x: e.clientX, y: e.clientY })
        if (!showCursor) setShowCursor(true)
        draw(e)
    }

    const handleMouseEnter = () => setShowCursor(true)
    const handleMouseLeave = () => {
        setShowCursor(false)
        stopDrawing()
    }

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setBgType('image')
            setBgValue(url)
        }
    }

    const handleSave = () => {
        if (!canvasRef.current || !canvasDims) return

        // Create temporary canvas for composition
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvasDims.width
        tempCanvas.height = canvasDims.height
        const ctx = tempCanvas.getContext('2d')
        if (!ctx) return

        // 1. Draw Background
        if (bgType === 'color') {
            ctx.fillStyle = bgValue
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        } else if (bgType === 'gradient') {
            const gradientData = GRADIENTS.find(g => g.id === bgValue)
            if (gradientData) {
                let grad: CanvasGradient
                const w = tempCanvas.width
                const h = tempCanvas.height

                switch (gradientData.direction) {
                    case 'horizontal':
                        grad = ctx.createLinearGradient(0, 0, w, 0)
                        break
                    case 'vertical':
                        grad = ctx.createLinearGradient(0, 0, 0, h)
                        break
                    case 'diagonal-br':
                        grad = ctx.createLinearGradient(0, 0, w, h)
                        break
                    case 'diagonal-bl':
                        grad = ctx.createLinearGradient(w, 0, 0, h)
                        break
                    default:
                        grad = ctx.createLinearGradient(0, 0, w, 0)
                }

                // Assuming 2 stops for now based on constants
                if (gradientData.stops.length >= 2) {
                    grad.addColorStop(0, gradientData.stops[0])
                    grad.addColorStop(1, gradientData.stops[1])
                }

                ctx.fillStyle = grad
                ctx.fillRect(0, 0, w, h)
            }
        } else if (bgType === 'image' && bgImageFile) {
            const imgRatio = bgImageFile.width / bgImageFile.height
            const canvasRatio = tempCanvas.width / tempCanvas.height
            let renderW, renderH, renderX, renderY

            if (imgRatio > canvasRatio) {
                renderH = tempCanvas.height
                renderW = tempCanvas.height * imgRatio
                renderX = (tempCanvas.width - renderW) / 2
                renderY = 0
            } else {
                renderW = tempCanvas.width
                renderH = tempCanvas.width / imgRatio
                renderX = 0
                renderY = (tempCanvas.height - renderH) / 2
            }
            ctx.drawImage(bgImageFile, renderX, renderY, renderW, renderH)
        }

        // 2. Draw Foreground (Main Canvas)
        ctx.drawImage(canvasRef.current, 0, 0)

        tempCanvas.toBlob((blob) => {
            if (blob) onSave(blob)
        }, 'image/png')
    }

    const scaleFactor = Math.max(canvasDims?.width || 1000, canvasDims?.height || 1000) / 1000

    // Compute current background style for preview
    const getBgStyle = () => {
        if (bgType === 'color') return { background: bgValue }
        if (bgType === 'gradient') {
            const grad = GRADIENTS.find(g => g.id === bgValue)
            return { background: grad?.css || 'transparent' }
        }
        if (bgType === 'image') return { backgroundImage: `url(${bgValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        return { background: 'transparent' }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in zoom-in duration-200 select-none">

            {/* Custom Brush Cursor Overlay */}
            {showCursor && activeTab === 'manual' && (
                <div
                    className="pointer-events-none fixed rounded-full border border-white/90 bg-white/20 z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{
                        left: cursorPos.x,
                        top: cursorPos.y,
                        width: brushSize[0] * scaleFactor * zoom,
                        height: brushSize[0] * scaleFactor * zoom,
                    }}
                />
            )}

            {/* Header */}
            <div className="h-14 shrink-0 flex items-center justify-between px-6 bg-black/40 border-b border-white/10 backdrop-blur text-white z-40">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold mr-4">Edit Result</h3>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-2 bg-white/10 text-white">
                            <TabsTrigger value="manual" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">Manual Edit</TabsTrigger>
                            <TabsTrigger value="background" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">Backround</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm" variant="ghost" className="h-9 w-9 p-0 text-white/70 hover:text-white hover:bg-white/20"
                        onClick={undo} disabled={historyStep <= 0}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="w-5 h-5" />
                    </Button>
                    <Button
                        size="sm" variant="ghost" className="h-9 w-9 p-0 text-white/70 hover:text-white hover:bg-white/20"
                        onClick={redo} disabled={historyStep >= history.length - 1}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="w-5 h-5" />
                    </Button>

                    <div className="h-6 w-px bg-white/20 mx-4" />

                    <Button
                        size="sm" variant="ghost" className="h-9 w-24 gap-2 text-white hover:bg-white/20 border border-white/20"
                        onClick={onCancel}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button
                        size="sm" className="h-9 w-24 gap-2 bg-primary-600 hover:bg-primary-700 text-white border-0"
                        onClick={handleSave}
                    >
                        <Check className="w-4 h-4" />
                        Done
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Canvas Container */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#1a1a1a] relative"
                    onWheel={handleWheel}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: activeTab === 'manual' ? 'none' : 'default' }}
                >
                    {/* Checkerboard Level 0 */}
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none z-0"
                        style={{
                            backgroundImage: `linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)`,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }}
                    />

                    {/* Canvas Wrapper for Stacking */}
                    <div
                        className="relative z-10 shadow-2xl border border-white/10"
                        style={{
                            width: canvasDims ? canvasDims.width * zoom : 'auto',
                            height: canvasDims ? canvasDims.height * zoom : 'auto',
                        }}
                    >
                        {/* 1. Dynamic Background Layer */}
                        <div
                            className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat"
                            style={getBgStyle()}
                        />

                        {/* 2. Main Editing Canvas (Foreground) */}
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={handleMouseMove}
                            onMouseUp={stopDrawing}
                            onMouseLeave={handleMouseLeave}
                            onMouseEnter={handleMouseEnter}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="absolute inset-0 z-10 w-full h-full touch-none"
                            style={{
                                imageRendering: 'auto'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-auto shrink-0 bg-black/80 backdrop-blur-md border-t border-white/10 flex flex-col relative z-40">

                {/* Main Controls Row */}
                <div className="flex items-center justify-center gap-8 p-4">
                    {/* Scale Info */}
                    <div className="absolute left-4 bottom-4 flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white/80 hover:text-white rounded-full" onClick={handleZoomOut}>
                            <ZoomOut className="w-3 h-3" />
                        </Button>
                        <span className="text-[10px] text-white/90 min-w-8 text-center font-mono">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white/80 hover:text-white rounded-full" onClick={handleZoomIn}>
                            <ZoomIn className="w-3 h-3" />
                        </Button>
                    </div>

                    {activeTab === 'manual' ? (
                        <>
                            <div className="flex bg-white/10 rounded-lg p-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={cn("h-9 px-4 gap-2 hover:bg-white/20 hover:text-white", mode === 'erase' ? "bg-white/20 text-white shadow-sm" : "text-white/70")}
                                    onClick={() => setMode('erase')}
                                >
                                    <Eraser className="w-4 h-4" />
                                    Erase
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={cn("h-9 px-4 gap-2 hover:bg-white/20 hover:text-white", mode === 'restore' ? "bg-white/20 text-white shadow-sm" : "text-white/70")}
                                    onClick={() => setMode('restore')}
                                >
                                    <Brush className="w-4 h-4" />
                                    Restore
                                </Button>
                            </div>
                            <div className="h-8 w-px bg-white/20" />
                            <div className="flex items-center gap-4 w-64">
                                <MousePointer2 className="w-4 h-4 text-white/80" />
                                <Slider
                                    value={brushSize}
                                    onValueChange={setBrushSize}
                                    min={10}
                                    max={300}
                                    step={10}
                                    className="flex-1"
                                />
                                <div className="w-8 text-right text-xs text-white/90 font-mono">
                                    {brushSize[0]}px
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full max-w-5xl overflow-x-auto pb-2 scrollbar-hide">
                            <Tabs defaultValue="color" className="w-full">
                                <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none h-auto p-0 mb-4 gap-6">
                                    <TabsTrigger value="color" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-primary-500 rounded-none px-0 py-2 text-white/60 data-[state=active]:text-white">
                                        <Palette className="w-4 h-4 mr-2" /> Colors
                                    </TabsTrigger>
                                    <TabsTrigger value="gradient" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-primary-500 rounded-none px-0 py-2 text-white/60 data-[state=active]:text-white">
                                        <PaintBucket className="w-4 h-4 mr-2" /> Gradients
                                    </TabsTrigger>
                                    <TabsTrigger value="image" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-primary-500 rounded-none px-0 py-2 text-white/60 data-[state=active]:text-white">
                                        <ImageIcon className="w-4 h-4 mr-2" /> Images
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="color" className="flex items-center gap-3">
                                    <button
                                        onClick={() => { setBgType('transparent'); setBgValue('') }}
                                        className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center bg-[url('/transparent-grid.png')] bg-contain", bgType === 'transparent' ? "border-white" : "border-white/20")}
                                        title="Transparent"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>

                                    {/* Custom Color Input */}
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50 cursor-pointer">
                                        <input
                                            type="color"
                                            className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 p-0 cursor-pointer border-0"
                                            onChange={(e) => { setBgType('color'); setBgValue(e.target.value) }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference">
                                            <Plus className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    <div className="h-6 w-px bg-white/20 mx-2" />

                                    {SOLID_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => { setBgType('color'); setBgValue(color) }}
                                            className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", bgValue === color && bgType === 'color' ? "border-white scale-110" : "border-white/10")}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </TabsContent>

                                <TabsContent value="gradient" className="flex items-center gap-3 overflow-x-auto pb-2">
                                    {GRADIENTS.map((grad) => (
                                        <button
                                            key={grad.id}
                                            onClick={() => { setBgType('gradient'); setBgValue(grad.id) }}
                                            className={cn("w-12 h-12 rounded-lg border-2 transition-transform hover:scale-105", bgValue === grad.id && bgType === 'gradient' ? "border-white" : "border-white/10")}
                                            style={{ background: grad.css }}
                                        />
                                    ))}
                                </TabsContent>

                                <TabsContent value="image" className="space-y-4">
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        <label className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-white/50 flex flex-col items-center justify-center cursor-pointer text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                                            <Upload className="w-6 h-6 mb-2" />
                                            <span className="text-[10px]">Upload</span>
                                        </label>

                                        {IMAGE_TEMPLATES.map(img => (
                                            <button
                                                key={img.id}
                                                onClick={() => { setBgType('image'); setBgValue(img.url) }}
                                                className={cn("shrink-0 w-24 h-24 rounded-lg border-2 overflow-hidden relative transition-all", bgValue === img.url && bgType === 'image' ? "border-white ring-2 ring-white/50" : "border-white/10")}
                                            >
                                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 flex items-end p-1 bg-gradient-to-t from-black/60 to-transparent">
                                                    <span className="text-[10px] text-white font-medium">{img.label}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
