'use client';

import React, {
    useState,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
    Minus,
    Plus,
    Download,
    Upload,
    Trash2,
    Undo2,
    Redo2,
    ArrowUpRight,
    Square,
    Circle,
    Type,
    Pencil,
    Minus as LineIcon,
    ZoomIn,
    ZoomOut,
    MousePointer2,
    Settings2,
    EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type {
    Annotation,
    AnnotationTool,
    ArrowAnnotation,
    EllipseAnnotation,
    FreehandAnnotation,
    LineAnnotation,
    Point,
    RectangleAnnotation,
    TextAnnotation,
    SensorAnnotation,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function drawArrow(ctx: CanvasRenderingContext2D, start: Point, end: Point, strokeWidth: number) {
    const headLen = Math.max(12, strokeWidth * 4);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
        end.x - headLen * Math.cos(angle - Math.PI / 6),
        end.y - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
        end.x - headLen * Math.cos(angle + Math.PI / 6),
        end.y - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();
}

function renderAnnotation(ctx: CanvasRenderingContext2D, ann: Annotation, imageEl: HTMLImageElement | null) {
    ctx.save();
    ctx.strokeStyle = ann.color;
    ctx.lineWidth = ann.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (ann.type) {
        case 'arrow': {
            drawArrow(ctx, ann.start, ann.end, ann.strokeWidth);
            break;
        }
        case 'rectangle': {
            const w = ann.end.x - ann.start.x;
            const h = ann.end.y - ann.start.y;
            if (ann.fill) {
                ctx.fillStyle = hexToRgba(ann.color, ann.fillOpacity);
                ctx.fillRect(ann.start.x, ann.start.y, w, h);
            }
            ctx.strokeRect(ann.start.x, ann.start.y, w, h);
            break;
        }
        case 'ellipse': {
            ctx.beginPath();
            ctx.ellipse(ann.center.x, ann.center.y, Math.abs(ann.radiusX), Math.abs(ann.radiusY), 0, 0, Math.PI * 2);
            if (ann.fill) {
                ctx.fillStyle = hexToRgba(ann.color, ann.fillOpacity);
                ctx.fill();
            }
            ctx.stroke();
            break;
        }
        case 'line': {
            ctx.beginPath();
            ctx.moveTo(ann.start.x, ann.start.y);
            ctx.lineTo(ann.end.x, ann.end.y);
            ctx.stroke();
            break;
        }
        case 'text': {
            ctx.font = `bold ${ann.fontSize}px ${ann.fontFamily}`;
            ctx.fillStyle = ann.color;
            const lines = ann.text.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, ann.position.x, ann.position.y + i * (ann.fontSize * 1.25));
            });
            break;
        }
        case 'freehand': {
            if (ann.points.length < 2) break;
            ctx.beginPath();
            ctx.moveTo(ann.points[0].x, ann.points[0].y);
            ann.points.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
            break;
        }
        case 'sensor': {
            if (!imageEl) break;
            const x = Math.min(ann.start.x, ann.end.x);
            const y = Math.min(ann.start.y, ann.end.y);
            const w = Math.abs(ann.end.x - ann.start.x);
            const h = Math.abs(ann.end.y - ann.start.y);
            if (w < 1 || h < 1) break;
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();
            ctx.filter = 'blur(15px)';
            ctx.drawImage(imageEl, 0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
            
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
            break;
        }
    }
    ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset colors
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#FFFFFF', // white
    '#000000', // black
];

// ─────────────────────────────────────────────────────────────────────────────
// Tool definitions
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS: { id: AnnotationTool; label: string; icon: React.ElementType; cursor: string }[] = [
    { id: 'select', label: 'Select / Pan', icon: MousePointer2, cursor: 'default' },
    { id: 'arrow', label: 'Arrow', icon: ArrowUpRight, cursor: 'crosshair' },
    { id: 'rectangle', label: 'Rectangle', icon: Square, cursor: 'crosshair' },
    { id: 'ellipse', label: 'Ellipse', icon: Circle, cursor: 'crosshair' },
    { id: 'line', label: 'Line', icon: LineIcon, cursor: 'crosshair' },
    { id: 'text', label: 'Text', icon: Type, cursor: 'text' },
    { id: 'freehand', label: 'Freehand', icon: Pencil, cursor: 'crosshair' },
    { id: 'sensor', label: 'Sensor / Blur', icon: EyeOff, cursor: 'crosshair' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Text input overlay component
// ─────────────────────────────────────────────────────────────────────────────

interface TextInputOverlayProps {
    position: { canvasX: number; canvasY: number; screenX: number; screenY: number };
    color: string;
    fontSize: number;
    onSubmit: (text: string) => void;
    onCancel: () => void;
}

function TextInputOverlay({ position, color, fontSize, onSubmit, onCancel }: TextInputOverlayProps) {
    const [value, setValue] = useState('');
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) onSubmit(value);
            else onCancel();
        }
        if (e.key === 'Escape') onCancel();
    };

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                if (value.trim()) onSubmit(value);
                else onCancel();
            }}
            className="absolute z-20 bg-transparent border border-dashed resize-none outline-none min-w-[100px]"
            style={{
                left: position.screenX,
                top: position.screenY,
                color,
                fontSize,
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                lineHeight: 1.25,
                caretColor: color,
                borderColor: color,
                padding: '2px',
            }}
            rows={1}
            placeholder="Type here..."
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Selection Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getBoundingBox(ann: Annotation) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const addPt = (x: number, y: number) => {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
    };
    switch (ann.type) {
        case 'arrow':
        case 'line':
        case 'rectangle':
        case 'sensor':
            addPt(ann.start.x, ann.start.y);
            addPt(ann.end.x, ann.end.y);
            break;
        case 'ellipse':
            addPt(ann.center.x - ann.radiusX, ann.center.y - ann.radiusY);
            addPt(ann.center.x + ann.radiusX, ann.center.y + ann.radiusY);
            break;
        case 'freehand':
            ann.points.forEach(p => addPt(p.x, p.y));
            break;
        case 'text':
            addPt(ann.position.x, ann.position.y - ann.fontSize);
            addPt(ann.position.x + ann.text.length * ann.fontSize * 0.6, ann.position.y);
            break;
    }
    const padding = Math.max(10, ann.strokeWidth || 3);
    return { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding };
}

function hitTest(pt: Point, ann: Annotation): boolean {
    const box = getBoundingBox(ann);
    return pt.x >= box.minX && pt.x <= box.maxX && pt.y >= box.minY && pt.y <= box.maxY;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function ImageAnnotator() {
    // ── image state ──────────────────────────────────────────────────────────
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);

    // ── annotation state ─────────────────────────────────────────────────────
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [history, setHistory] = useState<Annotation[][]>([[]]);
    const [historyIdx, setHistoryIdx] = useState(0);

    // ── tool settings ────────────────────────────────────────────────────────
    const [activeTool, setActiveTool] = useState<AnnotationTool>('arrow');
    const [activeColor, setActiveColor] = useState('#EF4444');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [fontSize, setFontSize] = useState(24);
    const [fillShape, setFillShape] = useState(false);
    const [fillOpacity, setFillOpacity] = useState(0.2);
    const [zoom, setZoom] = useState(1);

    // ── drawing state ────────────────────────────────────────────────────────
    const isDrawing = useRef(false);
    const drawStart = useRef<Point>({ x: 0, y: 0 });
    const currentFreehand = useRef<Point[]>([]);
    const [previewAnnotation, setPreviewAnnotation] = useState<Annotation | null>(null);

    // ── text input state ─────────────────────────────────────────────────────
    const [textInput, setTextInput] = useState<{
        canvasX: number;
        canvasY: number;
        screenX: number;
        screenY: number;
    } | null>(null);

    // ── selection state ──────────────────────────────────────────────────────
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const draggedAnnotationInitial = useRef<Annotation | null>(null);

    // ── refs ─────────────────────────────────────────────────────────────────
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // Render canvas
    // ─────────────────────────────────────────────────────────────────────────

    const renderCanvas = useCallback(
        (anns: Annotation[], preview: Annotation | null, activeSelId: string | null) => {
            const canvas = canvasRef.current;
            if (!canvas || !imageEl) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageEl, 0, 0, canvas.width, canvas.height);
            anns.forEach((a) => {
                renderAnnotation(ctx, a, imageEl);
                if (a.id === activeSelId) {
                    const box = getBoundingBox(a);
                    ctx.save();
                    ctx.setLineDash([5, 5]);
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(box.minX, box.minY, box.maxX - box.minX, box.maxY - box.minY);
                    ctx.restore();
                }
            });
            if (preview) renderAnnotation(ctx, preview, imageEl);
        },
        [imageEl],
    );

    useEffect(() => {
        renderCanvas(annotations, previewAnnotation, selectedAnnotationId);
    }, [annotations, previewAnnotation, selectedAnnotationId, renderCanvas]);

    // ─────────────────────────────────────────────────────────────────────────
    // History helpers
    // ─────────────────────────────────────────────────────────────────────────

    const pushHistory = useCallback(
        (newAnns: Annotation[]) => {
            const truncated = history.slice(0, historyIdx + 1);
            const next = [...truncated, newAnns];
            setHistory(next);
            setHistoryIdx(next.length - 1);
            setAnnotations(newAnns);
        },
        [history, historyIdx],
    );

    const undo = useCallback(() => {
        if (historyIdx === 0) return;
        const idx = historyIdx - 1;
        setHistoryIdx(idx);
        setAnnotations(history[idx]);
    }, [history, historyIdx]);

    const redo = useCallback(() => {
        if (historyIdx >= history.length - 1) return;
        const idx = historyIdx + 1;
        setHistoryIdx(idx);
        setAnnotations(history[idx]);
    }, [history, historyIdx]);

    // ─────────────────────────────────────────────────────────────────────────
    // Image loading
    // ─────────────────────────────────────────────────────────────────────────

    const loadImage = useCallback((src: string) => {
        const img = new Image();
        img.onload = () => {
            setImageEl(img);
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            setAnnotations([]);
            setHistory([[]]);
            setHistoryIdx(0);
            setPreviewAnnotation(null);
            setZoom(1);
        };
        img.src = src;
    }, []);

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload a valid image file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target?.result as string;
                setImageSrc(src);
                loadImage(src);
            };
            reader.readAsDataURL(file);
        },
        [loadImage],
    );

    // Paste handler
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) handleFile(file);
                    break;
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handleFile]);

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (activeTool === 'select' && selectedAnnotationId) {
                    const tag = document.activeElement?.tagName.toLowerCase();
                    if (tag === 'input' || tag === 'textarea') return;

                    const newAnns = annotations.filter(a => a.id !== selectedAnnotationId);
                    pushHistory(newAnns);
                    setSelectedAnnotationId(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTool, selectedAnnotationId, annotations, pushHistory]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => { if (files[0]) handleFile(files[0]); },
        accept: { 'image/*': [] },
        multiple: false,
        noClick: !!imageSrc,
        noDrag: !!imageSrc,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Canvas coordinate helpers
    // ─────────────────────────────────────────────────────────────────────────

    const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * canvas.width,
            y: ((e.clientY - rect.top) / rect.height) * canvas.height,
        };
    }, []);

    const getScreenPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): { screenX: number; screenY: number } => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            screenX: e.clientX - rect.left,
            screenY: e.clientY - rect.top,
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Annotation ID
    // ─────────────────────────────────────────────────────────────────────────

    const nextId = useCallback(() => crypto.randomUUID(), []);

    // ─────────────────────────────────────────────────────────────────────────
    // Mouse / touch handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (activeTool === 'select') {
            const pt = getCanvasPoint(e);
            let hitId: string | null = null;
            for (let i = annotations.length - 1; i >= 0; i--) {
                if (hitTest(pt, annotations[i])) {
                    hitId = annotations[i].id;
                    break;
                }
            }
            setSelectedAnnotationId(hitId);
            if (hitId) {
                e.currentTarget.setPointerCapture(e.pointerId);
                isDrawing.current = true;
                drawStart.current = pt;
                const initial = annotations.find((a) => a.id === hitId);
                draggedAnnotationInitial.current = initial ? JSON.parse(JSON.stringify(initial)) : null;
            }
            return;
        }

        if (activeTool === 'text') {
            const pt = getCanvasPoint(e);
            const { screenX, screenY } = getScreenPoint(e);
            setTextInput({ canvasX: pt.x, canvasY: pt.y, screenX, screenY });
            return;
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        isDrawing.current = true;
        const pt = getCanvasPoint(e);
        drawStart.current = pt;
        if (activeTool === 'freehand') {
            currentFreehand.current = [pt];
        }
    }, [activeTool, getCanvasPoint, getScreenPoint, annotations]);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const pt = getCanvasPoint(e);
        const start = drawStart.current;

        if (activeTool === 'select') {
            if (selectedAnnotationId && draggedAnnotationInitial.current) {
                const dx = pt.x - start.x;
                const dy = pt.y - start.y;
                const initial = draggedAnnotationInitial.current;
                
                const shiftPoint = (p: Point) => ({ x: p.x + dx, y: p.y + dy });
                const moved = JSON.parse(JSON.stringify(initial)) as Annotation;

                switch (moved.type) {
                    case 'arrow':
                    case 'line':
                    case 'rectangle':
                    case 'sensor':
                        (moved as any).start = shiftPoint((initial as any).start);
                        (moved as any).end = shiftPoint((initial as any).end);
                        break;
                    case 'ellipse':
                        (moved as any).center = shiftPoint((initial as any).center);
                        break;
                    case 'freehand':
                        (moved as FreehandAnnotation).points = (initial as FreehandAnnotation).points.map(shiftPoint);
                        break;
                    case 'text':
                        (moved as TextAnnotation).position = shiftPoint((initial as TextAnnotation).position);
                        break;
                }
                
                setAnnotations(prev => prev.map(a => a.id === selectedAnnotationId ? moved : a));
            }
            return;
        }

        let preview: Annotation | null = null;

        switch (activeTool) {
            case 'arrow':
                preview = { id: '__preview__', type: 'arrow', color: activeColor, strokeWidth, start, end: pt } as ArrowAnnotation;
                break;
            case 'rectangle':
                preview = { id: '__preview__', type: 'rectangle', color: activeColor, strokeWidth, start, end: pt, fill: fillShape, fillOpacity } as RectangleAnnotation;
                break;
            case 'ellipse': {
                const cx = (start.x + pt.x) / 2;
                const cy = (start.y + pt.y) / 2;
                preview = { id: '__preview__', type: 'ellipse', color: activeColor, strokeWidth, center: { x: cx, y: cy }, radiusX: Math.abs(pt.x - start.x) / 2, radiusY: Math.abs(pt.y - start.y) / 2, fill: fillShape, fillOpacity } as EllipseAnnotation;
                break;
            }
            case 'line':
                preview = { id: '__preview__', type: 'line', color: activeColor, strokeWidth, start, end: pt } as LineAnnotation;
                break;
            case 'freehand': {
                currentFreehand.current.push(pt);
                preview = { id: '__preview__', type: 'freehand', color: activeColor, strokeWidth, points: [...currentFreehand.current] } as FreehandAnnotation;
                break;
            }
            case 'sensor':
                preview = { id: '__preview__', type: 'sensor', color: activeColor, strokeWidth, start, end: pt } as SensorAnnotation;
                break;
            default:
                break;
        }
        setPreviewAnnotation(preview);
    }, [activeTool, activeColor, strokeWidth, fillShape, fillOpacity, getCanvasPoint, selectedAnnotationId]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        e.currentTarget.releasePointerCapture(e.pointerId);
        isDrawing.current = false;
        const pt = getCanvasPoint(e);
        const start = drawStart.current;
        setPreviewAnnotation(null);

        if (activeTool === 'select') {
            if (draggedAnnotationInitial.current && (Math.abs(pt.x - start.x) > 1 || Math.abs(pt.y - start.y) > 1)) {
                pushHistory(annotations);
            }
            draggedAnnotationInitial.current = null;
            return;
        }

        let newAnn: Annotation | null = null;

        switch (activeTool) {
            case 'arrow': {
                const dx = pt.x - start.x;
                const dy = pt.y - start.y;
                if (Math.hypot(dx, dy) < 5) break;
                newAnn = { id: nextId(), type: 'arrow', color: activeColor, strokeWidth, start, end: pt } as ArrowAnnotation;
                break;
            }
            case 'rectangle': {
                const w = Math.abs(pt.x - start.x);
                const h = Math.abs(pt.y - start.y);
                if (w < 4 || h < 4) break;
                newAnn = { id: nextId(), type: 'rectangle', color: activeColor, strokeWidth, start, end: pt, fill: fillShape, fillOpacity } as RectangleAnnotation;
                break;
            }
            case 'ellipse': {
                const rx = Math.abs(pt.x - start.x) / 2;
                const ry = Math.abs(pt.y - start.y) / 2;
                if (rx < 4 || ry < 4) break;
                const cx = (start.x + pt.x) / 2;
                const cy = (start.y + pt.y) / 2;
                newAnn = { id: nextId(), type: 'ellipse', color: activeColor, strokeWidth, center: { x: cx, y: cy }, radiusX: rx, radiusY: ry, fill: fillShape, fillOpacity } as EllipseAnnotation;
                break;
            }
            case 'line': {
                const dx = pt.x - start.x;
                const dy = pt.y - start.y;
                if (Math.hypot(dx, dy) < 5) break;
                newAnn = { id: nextId(), type: 'line', color: activeColor, strokeWidth, start, end: pt } as LineAnnotation;
                break;
            }
            case 'freehand': {
                if (currentFreehand.current.length < 2) break;
                newAnn = { id: nextId(), type: 'freehand', color: activeColor, strokeWidth, points: [...currentFreehand.current] } as FreehandAnnotation;
                currentFreehand.current = [];
                break;
            }
            case 'sensor': {
                const w = Math.abs(pt.x - start.x);
                const h = Math.abs(pt.y - start.y);
                if (w < 4 || h < 4) break;
                newAnn = { id: nextId(), type: 'sensor', color: activeColor, strokeWidth, start, end: pt } as SensorAnnotation;
                break;
            }
            default:
                break;
        }

        if (newAnn) {
            pushHistory([...annotations, newAnn]);
        }
    }, [activeTool, activeColor, strokeWidth, fillShape, fillOpacity, getCanvasPoint, nextId, pushHistory, annotations]);

    // Text submission
    const handleTextSubmit = useCallback((text: string) => {
        if (!textInput) return;
        const ann: TextAnnotation = {
            id: nextId(),
            type: 'text',
            color: activeColor,
            strokeWidth,
            position: { x: textInput.canvasX, y: textInput.canvasY + fontSize },
            text,
            fontSize,
            fontFamily: 'sans-serif',
        };
        pushHistory([...annotations, ann]);
        setTextInput(null);
    }, [textInput, activeColor, strokeWidth, fontSize, nextId, pushHistory, annotations]);

    // ─────────────────────────────────────────────────────────────────────────
    // Clear all
    // ─────────────────────────────────────────────────────────────────────────

    const clearAll = useCallback(() => {
        pushHistory([]);
    }, [pushHistory]);

    const resetImage = useCallback(() => {
        setImageSrc(null);
        setImageEl(null);
        setAnnotations([]);
        setHistory([[]]);
        setHistoryIdx(0);
        setPreviewAnnotation(null);
        setZoom(1);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Download
    // ─────────────────────────────────────────────────────────────────────────

    const handleDownload = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'annotated-image.png';
        link.href = url;
        link.click();
        toast.success('Annotated image downloaded!');
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Cursor
    // ─────────────────────────────────────────────────────────────────────────

    const cursor = TOOLS.find((t) => t.id === activeTool)?.cursor ?? 'crosshair';

    // ─────────────────────────────────────────────────────────────────────────
    // Upload screen
    // ─────────────────────────────────────────────────────────────────────────

    if (!imageSrc) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer',
                        isDragActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50',
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <div className={cn(
                            'w-20 h-20 rounded-2xl flex items-center justify-center transition-all',
                            isDragActive ? 'bg-primary-100' : 'bg-gray-100',
                        )}>
                            <Upload className={cn(
                                'w-10 h-10 transition-colors',
                                isDragActive ? 'text-primary-600' : 'text-gray-400',
                            )} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-gray-900">
                                {isDragActive ? 'Drop your image here' : 'Select an image to annotate'}
                            </p>
                            <p className="text-gray-500 text-sm">
                                Drag & drop, click to browse, or{' '}
                                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded font-mono">Ctrl+V</kbd>{' '}
                                to paste
                            </p>
                        </div>
                        <Button size="lg" className="mt-4 pointer-events-none">
                            <Plus className="w-4 h-4 mr-2" />
                            Select Image
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Editor layout
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">

            {/* ── Toolbar ───────────────────────────────────────────────────── */}
            <div className="flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
                {TOOLS.map((t) => (
                    <button
                        key={t.id}
                        title={t.label}
                        onClick={() => { setActiveTool(t.id); setTextInput(null); setSelectedAnnotationId(null); }}
                        className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer',
                            activeTool === t.id
                                ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300',
                        )}
                    >
                        <t.icon className="w-4 h-4" />
                    </button>
                ))}

                <div className="my-0 lg:my-2 h-px lg:h-[1px] w-full bg-gray-200 hidden lg:block" />

                {/* Undo */}
                <button
                    title="Undo"
                    onClick={undo}
                    disabled={historyIdx === 0}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                    <Undo2 className="w-4 h-4" />
                </button>

                {/* Redo */}
                <button
                    title="Redo"
                    onClick={redo}
                    disabled={historyIdx >= history.length - 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                    <Redo2 className="w-4 h-4" />
                </button>

                {/* Zoom In */}
                <button
                    title="Zoom In"
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-all"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>

                {/* Zoom Out */}
                <button
                    title="Zoom Out"
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-all"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
            </div>

            {/* ── Canvas area ───────────────────────────────────────────────── */}
            <div
                ref={containerRef}
                className="flex-1 bg-[url('/transparent-grid.svg')] rounded-2xl border-2 border-dashed border-gray-200 overflow-auto min-h-[500px] flex items-start justify-start p-4"
                style={{ minHeight: '500px' }}
            >
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', position: 'relative' }}>
                    <canvas
                        ref={canvasRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className="block shadow-xl rounded-sm"
                        style={{ cursor, maxWidth: '100%' }}
                    />
                    {textInput && (
                        <TextInputOverlay
                            position={textInput}
                            color={activeColor}
                            fontSize={fontSize}
                            onSubmit={handleTextSubmit}
                            onCancel={() => setTextInput(null)}
                        />
                    )}
                </div>
            </div>

            {/* ── Settings panel ────────────────────────────────────────────── */}
            <div className="w-full lg:w-64 bg-white border border-gray-200 rounded-2xl p-5 space-y-5 sticky top-6 h-fit">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Settings2 className="w-5 h-5 text-primary-600" />
                    <h2 className="font-semibold text-sm">Settings</h2>
                    <button
                        title="New image"
                        onClick={resetImage}
                        className="ml-auto p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Colour presets */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color</Label>
                    <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setActiveColor(c)}
                                title={c}
                                className={cn(
                                    'w-7 h-7 rounded-full border-2 cursor-pointer transition-all',
                                    activeColor === c ? 'border-primary-500 scale-110 shadow-md' : 'border-transparent hover:scale-105',
                                )}
                                style={{ backgroundColor: c, outline: c === '#FFFFFF' ? '1px solid #d1d5db' : undefined }}
                            />
                        ))}
                    </div>
                    <input
                        type="color"
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="w-full h-8 rounded cursor-pointer border border-gray-200"
                        title="Custom color"
                    />
                </div>

                {/* Stroke width */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stroke</Label>
                        <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{strokeWidth}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Minus className="w-3 h-3 text-gray-400" />
                        <Slider value={[strokeWidth]} min={1} max={20} step={1} onValueChange={(v) => setStrokeWidth(v[0])} className="cursor-pointer" />
                        <Plus className="w-3 h-3 text-gray-400" />
                    </div>
                </div>

                {/* Font size (text tool only) */}
                {activeTool === 'text' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Size</Label>
                            <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Minus className="w-3 h-3 text-gray-400" />
                            <Slider value={[fontSize]} min={10} max={120} step={2} onValueChange={(v) => setFontSize(v[0])} className="cursor-pointer" />
                            <Plus className="w-3 h-3 text-gray-400" />
                        </div>
                    </div>
                )}

                {/* Fill (shape tools only) */}
                {(activeTool === 'rectangle' || activeTool === 'ellipse') && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fill Shape</Label>
                            <button
                                onClick={() => setFillShape((f) => !f)}
                                className={cn(
                                    'w-10 h-5 rounded-full transition-colors cursor-pointer relative',
                                    fillShape ? 'bg-primary-500' : 'bg-gray-200',
                                )}
                            >
                                <span className={cn(
                                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                                    fillShape ? 'translate-x-5' : 'translate-x-0.5',
                                )} />
                            </button>
                        </div>
                        {fillShape && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fill Opacity</Label>
                                    <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{Math.round(fillOpacity * 100)}%</span>
                                </div>
                                <Slider value={[fillOpacity]} min={0.05} max={1} step={0.05} onValueChange={(v) => setFillOpacity(v[0])} className="cursor-pointer" />
                            </div>
                        )}
                    </div>
                )}

                {/* Zoom display */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-semibold uppercase tracking-wider">Zoom</span>
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{Math.round(zoom * 100)}%</span>
                </div>

                {/* Annotation count */}
                <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span>Annotations</span>
                    <span className="font-mono">{annotations.length}</span>
                </div>

                {/* Clear button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    disabled={annotations.length === 0}
                    className="w-full cursor-pointer disabled:opacity-50"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Clear All
                </Button>

                {/* Download */}
                <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full h-12 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 cursor-pointer"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Download
                </Button>
            </div>
        </div>
    );
}
