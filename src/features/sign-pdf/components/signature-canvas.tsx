import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { COLORS } from '../constants';
import { cn } from '@/lib/utils';
import { Eraser, Check, PenTool, Trash2, Undo, Redo, Palette } from 'lucide-react';

export function SignatureCanvas({
    onSave,
    color = COLORS.black,
    initialImage
}: {
    onSave: (dataUrl: string) => void,
    color?: string,
    initialImage?: string
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [drawMode, setDrawMode] = useState<'brush' | 'eraser'>('brush');

    // History for Undo/Redo
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const saveState = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => {
            const newHistory = prev.slice(0, historyStep + 1);
            return [...newHistory, imageData];
        });
        setHistoryStep(prev => prev + 1);
        setHasContent(true);
    }, [historyStep]);

    // Initialize canvas
    useEffect(() => {
        // Initialize
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Clear canvas synchronously (DOM operation)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (initialImage) {
            const img = new Image();
            img.src = initialImage;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setHistory([imageData]);
                setHistoryStep(0);
                setHasContent(true);
            };
        } else {
            // Save blank initial state
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([imageData]);
            setHistoryStep(0);
            setHasContent(false);
        }

    }, [initialImage]);

    // Update Brush/Eraser Settings
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = drawMode === 'eraser' ? 20 : 3;
        ctx.strokeStyle = color;
        ctx.globalCompositeOperation = drawMode === 'eraser' ? 'destination-out' : 'source-over';
    }, [color, drawMode]);

    // Handle tinting existing content when color changes if user wants to "Apply Color to All"
    // Note: We don't auto-tint on color change to avoid destroying multi-color drawings
    // But we can offer a button or do it if it's a single color mode.
    // For now, let's keep it simple: Color applies to NEW strokes.

    const handleUndo = () => {
        if (historyStep > 0) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            ctx.putImageData(history[newStep], 0, 0);
        }
    };

    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            ctx.putImageData(history[newStep], 0, 0);
        }
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        ctx.beginPath();
        const { x, y } = getCoordinates(e, canvas);
        ctx.moveTo(x, y);
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.closePath();
                    saveState(ctx, canvas);
                }
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure settings are correct (sometimes lost on context reset)
        ctx.lineWidth = drawMode === 'eraser' ? 20 : 3;
        ctx.strokeStyle = color;
        ctx.globalCompositeOperation = drawMode === 'eraser' ? 'destination-out' : 'source-over';

        const { x, y } = getCoordinates(e, canvas);

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        saveState(ctx, canvas);
        setHasContent(false);
    };

    const applyColorToAll = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Simple composite operation trick to recolor
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Reset
        ctx.globalCompositeOperation = 'source-over';
        saveState(ctx, canvas);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="space-y-4">
            <div className="relative bg-white border rounded-xl shadow-sm w-full overflow-hidden touch-none select-none group">
                {/* Checkerboard background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'conic-gradient(#000 0.25turn, #fff 0.25turn 0.5turn, #000 0.5turn 0.75turn, #fff 0.75turn)', backgroundSize: '16px 16px' }} />

                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className={cn(
                        "w-full h-64 relative z-10 touch-none",
                        drawMode === 'brush' ? "cursor-crosshair" : "cursor-cell"
                    )}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />

                {/* Floating Toolbar */}
                <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                        variant={drawMode === 'brush' ? "default" : "secondary"}
                        size="icon"
                        onClick={() => setDrawMode('brush')}
                        className={cn("h-8 w-8 rounded-full shadow-sm", drawMode === 'brush' ? "bg-primary-600 text-white" : "bg-white/90")}
                        title="Brush"
                    >
                        <PenTool className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={drawMode === 'eraser' ? "default" : "secondary"}
                        size="icon"
                        onClick={() => setDrawMode('eraser')}
                        className={cn("h-8 w-8 rounded-full shadow-sm", drawMode === 'eraser' ? "bg-primary-600 text-white" : "bg-white/90")}
                        title="Eraser"
                    >
                        <Eraser className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={applyColorToAll}
                        className="h-8 w-8 rounded-full bg-white/90 shadow-sm text-gray-700"
                        title="Tint All"
                    >
                        <Palette className="w-4 h-4" />
                    </Button>
                    <div className="h-px bg-gray-200 my-1 mx-2" />
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleUndo}
                        disabled={historyStep <= 0}
                        className="h-8 w-8 rounded-full bg-white/90 shadow-sm disabled:opacity-50"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleRedo}
                        disabled={historyStep >= history.length - 1}
                        className="h-8 w-8 rounded-full bg-white/90 shadow-sm disabled:opacity-50"
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </Button>
                    <div className="h-px bg-gray-200 my-1 mx-2" />
                    <Button variant="secondary" size="icon" onClick={clearCanvas} className="h-8 w-8 rounded-full bg-white/90 shadow-sm border-red-100 hover:bg-red-50 hover:text-red-500" title="Clear All">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Button onClick={handleSave} disabled={!hasContent && !initialImage} className="w-full bg-primary-600 hover:bg-primary-700 h-11 text-base font-semibold shadow-lg shadow-primary-500/20">
                <Check className="w-4 h-4 mr-2" />
                Apply Signature
            </Button>
        </div>
    );
}
