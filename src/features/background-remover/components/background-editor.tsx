'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Eraser, Brush, Undo, Redo, Save, X, ZoomIn, ZoomOut, Check, MousePointer2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface BackgroundEditorProps {
    originalUrl: string
    resultUrl: string
    onSave: (blob: Blob) => void
    onCancel: () => void
}

export function BackgroundEditor({ originalUrl, resultUrl, onSave, onCancel }: BackgroundEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Tools
    const [mode, setMode] = useState<'erase' | 'restore'>('erase')
    const [brushSize, setBrushSize] = useState([30])

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
        imgResult.src = resultUrl

        const imgOriginal = new Image()
        imgOriginal.src = originalUrl

        Promise.all([
            new Promise(r => imgResult.onload = r),
            new Promise(r => imgOriginal.onload = r)
        ]).then(() => {
            // Set internal resolution matches image resolution
            canvas.width = imgResult.naturalWidth
            canvas.height = imgResult.naturalHeight
            setCanvasDims({ width: imgResult.naturalWidth, height: imgResult.naturalHeight })

            // Draw initial result
            ctx.drawImage(imgResult, 0, 0)

            setOriginalImage(imgOriginal)

            // Save initial state
            const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height)
            setHistory([initialState])
            setHistoryStep(0)

            // Fit zoom to screen initially (with padding)
            const container = containerRef.current
            if (container) {
                const padding = 40
                const availableW = container.clientWidth - padding
                const availableH = container.clientHeight - padding
                const scaleW = availableW / imgResult.naturalWidth
                const scaleH = availableH / imgResult.naturalHeight
                const fitScale = Math.min(scaleW, scaleH, 1) // Don't zoom in initially, only shrink
                setZoom(parseFloat(fitScale.toFixed(2)))
            }
        })
    }, [originalUrl, resultUrl])

    // History Logic
    const saveHistory = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const newState = ctx.getImageData(0, 0, canvas.width, canvas.height)

        setHistory(prev => {
            const newHistory = prev.slice(0, historyStep + 1)
            newHistory.push(newState)
            if (newHistory.length > 20) newHistory.shift()
            return newHistory
        })

        setHistoryStep(prev => {
            const newLen = Math.min(prev + 1 + 1, 20) // simplistic approximation, correct is based on history length logic above.
            // Actually better:
            return Math.min(prev + 1, 19) // Cap step index if history capped
        })
        // Correct way with state updater:
        setHistory(prev => {
            const newHistory = prev.slice(0, historyStep + 1)
            newHistory.push(newState)
            if (newHistory.length > 20) newHistory.shift()
            return newHistory
        })
        // Actually historyStep logic depends on result of history update.
        // Let's simplify history logic to avoid race conditions:
        // Reads from current state are stale inside callback without deps.
        // But saveHistory is called from event handler, so direct access is fine if we update deps.
        // Or simpler:
    }, [history, historyStep])

    // Re-implement simplified history to avoid closure stale state
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

    // Zoom Logic
    const handleZoomIn = () => setZoom(prev => Math.min(MAX_ZOOM, prev + 0.25))
    const handleZoomOut = () => setZoom(prev => Math.max(MIN_ZOOM, prev - 0.25))

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)))
        }
    }

    // Drawing Logic
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
        if (!isDrawing || !originalImage || !canvasRef.current) return

        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        const { x, y } = getCanvasPoint(e)
        const radius = brushSize[0] / 2

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

    const handleSave = () => {
        canvasRef.current?.toBlob((blob) => {
            if (blob) onSave(blob)
        }, 'image/png')
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in zoom-in duration-200 select-none">

            {/* Custom Brush Cursor Overlay */}
            {showCursor && (
                <div
                    className="pointer-events-none fixed rounded-full border border-white/90 bg-white/20 z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{
                        left: cursorPos.x,
                        top: cursorPos.y,
                        width: brushSize[0] * zoom,
                        height: brushSize[0] * zoom,
                    }}
                />
            )}

            {/* Header */}
            <div className="h-16 shrink-0 flex items-center justify-between px-6 bg-black/40 border-b border-white/10 backdrop-blur text-white z-40">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold mr-4">Edit Result</h3>
                    <div className="flex bg-white/10 rounded-lg p-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className={cn("h-8 gap-2 hover:bg-white/20 hover:text-white", mode === 'erase' ? "bg-white/20 text-white shadow-sm" : "text-white/70")}
                            onClick={() => setMode('erase')}
                        >
                            <Eraser className="w-4 h-4" />
                            Erase
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className={cn("h-8 gap-2 hover:bg-white/20 hover:text-white", mode === 'restore' ? "bg-white/20 text-white shadow-sm" : "text-white/70")}
                            onClick={() => setMode('restore')}
                        >
                            <Brush className="w-4 h-4" />
                            Restore
                        </Button>
                    </div>
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

            {/* Canvas Container (Scrollable) */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#1a1a1a] cursor-none relative"
                onWheel={handleWheel}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Checkerboard Pattern */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none z-0"
                    style={{
                        backgroundImage: `linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                />

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
                    className="shadow-2xl border border-white/10 bg-transparent z-10 touch-none block"
                    style={{
                        width: canvasDims ? canvasDims.width * zoom : 'auto',
                        height: canvasDims ? canvasDims.height * zoom : 'auto',
                        imageRendering: 'auto'
                    }}
                />
            </div>

            {/* Bottom Controls */}
            <div className="h-20 shrink-0 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-8 relative z-40 px-4">
                {/* Zoom Controls */}
                <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white rounded-full hover:bg-white/20" onClick={handleZoomOut}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-white/90 min-w-12 text-center font-mono">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white rounded-full hover:bg-white/20" onClick={handleZoomIn}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>

                <div className="h-8 w-px bg-white/20" />

                {/* Brush Size */}
                <div className="flex items-center gap-4 w-64">
                    <MousePointer2 className="w-4 h-4 text-white/80" />
                    <Slider
                        value={brushSize}
                        onValueChange={setBrushSize}
                        min={5}
                        max={200}
                        step={5}
                        className="flex-1"
                    />
                    <div className="w-8 text-right text-xs text-white/90 font-mono">
                        {brushSize[0]}px
                    </div>
                </div>
            </div>
        </div>
    )
}
