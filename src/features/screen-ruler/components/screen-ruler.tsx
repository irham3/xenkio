'use client';

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    BoundingBox,
    Camera,
    CrosshairSimple,
    DownloadSimple,
    LineSegment,
    MagnifyingGlassMinus,
    MagnifyingGlassPlus,
    Minus,
    Plus,
    Ruler,
    Trash,
    UploadSimple,
} from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type Point = {
    x: number;
    y: number;
};

type MeasurementMode = 'line' | 'box' | 'calibrate';
type MeasurementShape = 'line' | 'box';
type CalibrationUnit = 'mm' | 'cm' | 'in';

type Measurement = {
    id: string;
    shape: MeasurementShape;
    start: Point;
    end: Point;
    color: string;
    name: string;
};

type ImageInfo = {
    name: string;
    width: number;
    height: number;
};

type CalibrationReference = {
    start: Point;
    end: Point;
    pixels: number;
};

const MEASUREMENT_COLORS = ['#0EA5E9', '#F97316', '#22C55E', '#8B5CF6', '#EF4444'];
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;

function makeId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function distanceBetween(start: Point, end: Point): number {
    return Math.hypot(end.x - start.x, end.y - start.y);
}

function rectFromPoints(start: Point, end: Point) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return { x, y, width, height };
}

function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return '0';
    if (Math.abs(value) >= 100) return value.toFixed(1);
    if (Math.abs(value) >= 10) return value.toFixed(2);
    return value.toFixed(3);
}

function formatPixels(value: number): string {
    return `${Math.round(value)} px`;
}

function getRulerStep(zoom: number): number {
    const target = 90 / zoom;
    const steps = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000];
    return steps.find((step) => step >= target) ?? 10000;
}

function getMeasurementLabel(
    measurement: Measurement,
    unitPerPixel: number | null,
    unit: CalibrationUnit,
): string {
    if (measurement.shape === 'line') {
        const pixels = distanceBetween(measurement.start, measurement.end);
        return unitPerPixel
            ? `${formatNumber(pixels * unitPerPixel)} ${unit}`
            : formatPixels(pixels);
    }

    const rect = rectFromPoints(measurement.start, measurement.end);
    if (!unitPerPixel) {
        return `${Math.round(rect.width)} x ${Math.round(rect.height)} px`;
    }

    return `${formatNumber(rect.width * unitPerPixel)} x ${formatNumber(rect.height * unitPerPixel)} ${unit}`;
}

function getMeasurementDetails(
    measurement: Measurement,
    unitPerPixel: number | null,
    unit: CalibrationUnit,
) {
    if (measurement.shape === 'line') {
        const pixels = distanceBetween(measurement.start, measurement.end);
        return {
            primary: unitPerPixel
                ? `${formatNumber(pixels * unitPerPixel)} ${unit}`
                : formatPixels(pixels),
            secondary: formatPixels(pixels),
        };
    }

    const rect = rectFromPoints(measurement.start, measurement.end);
    if (!unitPerPixel) {
        return {
            primary: `${Math.round(rect.width)} x ${Math.round(rect.height)} px`,
            secondary: `${Math.round(rect.width * rect.height)} px2`,
        };
    }

    const width = rect.width * unitPerPixel;
    const height = rect.height * unitPerPixel;
    return {
        primary: `${formatNumber(width)} x ${formatNumber(height)} ${unit}`,
        secondary: `${formatNumber(width * height)} ${unit}2`,
    };
}

function buildMarks(size: number, step: number): number[] {
    const markCount = Math.floor(size / step);
    return Array.from({ length: markCount + 1 }, (_, index) => index * step);
}

function drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string,
) {
    ctx.save();
    ctx.font = '600 16px Arial, sans-serif';
    const metrics = ctx.measureText(text);
    const width = metrics.width + 16;
    const height = 26;
    const left = Math.max(8, Math.min(x, ctx.canvas.width - width - 8));
    const top = Math.max(8, Math.min(y - height - 8, ctx.canvas.height - height - 8));

    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#111827';
    ctx.fillText(text, left + 8, top + 18);
    ctx.restore();
}

function RulerStrip({
    orientation,
    size,
    zoom,
}: {
    orientation: 'horizontal' | 'vertical';
    size: number;
    zoom: number;
}) {
    const step = getRulerStep(zoom);
    const marks = useMemo(() => buildMarks(size, step), [size, step]);
    const minorStep = Math.max(4, (step / 5) * zoom);

    const backgroundImage =
        orientation === 'horizontal'
            ? 'linear-gradient(to right, rgba(113,113,122,0.28) 1px, transparent 1px)'
            : 'linear-gradient(to bottom, rgba(113,113,122,0.28) 1px, transparent 1px)';
    const backgroundSize =
        orientation === 'horizontal'
            ? `${minorStep}px 100%`
            : `100% ${minorStep}px`;

    return (
        <div
            className={cn(
                'relative bg-white text-[10px] font-medium text-gray-500 select-none',
                orientation === 'horizontal' ? 'h-7 border-b border-gray-200' : 'w-9 border-r border-gray-200',
            )}
            style={{
                width: orientation === 'horizontal' ? size * zoom : 36,
                height: orientation === 'vertical' ? size * zoom : 28,
                backgroundImage,
                backgroundSize,
            }}
        >
            {marks.map((mark) => {
                const offset = mark * zoom;
                return (
                    <div
                        key={mark}
                        className="absolute text-gray-500"
                        style={
                            orientation === 'horizontal'
                                ? { left: offset, top: 0, height: 28 }
                                : { top: offset, left: 0, width: 36 }
                        }
                    >
                        <span
                            className={cn(
                                'absolute bg-gray-400',
                                orientation === 'horizontal' ? 'left-0 top-0 h-3 w-px' : 'left-0 top-0 h-px w-3',
                            )}
                        />
                        <span
                            className="absolute whitespace-nowrap"
                            style={
                                orientation === 'horizontal'
                                    ? { left: 4, top: 13 }
                                    : { left: 13, top: 2, transform: 'rotate(90deg)', transformOrigin: 'left top' }
                            }
                        >
                            {mark}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function EmptyState({
    onCapture,
    onUploadClick,
    isCapturing,
}: {
    onCapture: () => void;
    onUploadClick: () => void;
    isCapturing: boolean;
}) {
    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="p-8 md:p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
                    <Ruler className="w-8 h-8 text-primary-600" weight="duotone" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Measure a Screen Object
                </h2>
                <p className="text-sm text-gray-500 mb-8 max-w-md">
                    Capture a screen, upload an image, or paste a screenshot. The ruler workspace runs locally in your browser.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button
                        type="button"
                        onClick={onCapture}
                        disabled={isCapturing}
                        className="flex-1 gap-2"
                    >
                        <Camera className="w-4 h-4" weight="duotone" />
                        {isCapturing ? 'Capturing...' : 'Capture Screen'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onUploadClick}
                        className="flex-1 gap-2"
                    >
                        <UploadSimple className="w-4 h-4" weight="duotone" />
                        Upload Image
                    </Button>
                </div>

                <p className="text-xs text-gray-400 mt-5">
                    Paste from clipboard with Ctrl+V or Command+V.
                </p>
            </div>
        </div>
    );
}

function ToolButton({
    active,
    icon: Icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={cn(
                'h-10 px-3 rounded-lg border inline-flex items-center gap-2 text-sm font-medium transition-colors',
                active
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300',
            )}
        >
            <Icon className="w-4 h-4" weight="duotone" />
            <span>{label}</span>
        </button>
    );
}

export function ScreenRuler() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
    const [mode, setMode] = useState<MeasurementMode>('line');
    const [zoom, setZoom] = useState(1);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [draft, setDraft] = useState<{
        shape: MeasurementMode;
        start: Point;
        end: Point;
        color: string;
    } | null>(null);
    const [cursorPoint, setCursorPoint] = useState<Point | null>(null);
    const [calibrationReference, setCalibrationReference] = useState<CalibrationReference | null>(null);
    const [knownDistance, setKnownDistance] = useState('10');
    const [unit, setUnit] = useState<CalibrationUnit>('cm');
    const [isDrawing, setIsDrawing] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const unitPerPixel = useMemo(() => {
        const distance = Number.parseFloat(knownDistance);
        if (!calibrationReference || !Number.isFinite(distance) || distance <= 0) {
            return null;
        }
        return distance / calibrationReference.pixels;
    }, [calibrationReference, knownDistance]);

    const displayWidth = imageInfo ? imageInfo.width * zoom : 0;
    const displayHeight = imageInfo ? imageInfo.height * zoom : 0;

    const loadImageSource = useCallback((source: string, name: string) => {
        const image = new window.Image();
        image.onload = () => {
            setImageSrc(source);
            setImageInfo({
                name,
                width: image.naturalWidth,
                height: image.naturalHeight,
            });
            setMeasurements([]);
            setCalibrationReference(null);
            setDraft(null);
            setCursorPoint(null);
            setMode('line');
            setZoom(image.naturalWidth > 1800 ? 0.5 : 1);
        };
        image.onerror = () => {
            toast.error('Unable to load that image');
        };
        image.src = source;
    }, []);

    const loadFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                loadImageSource(reader.result, file.name);
            }
        };
        reader.onerror = () => toast.error('Unable to read that image');
        reader.readAsDataURL(file);
    }, [loadImageSource]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            loadFile(file);
        }
        event.target.value = '';
    }, [loadFile]);

    const captureScreen = useCallback(async () => {
        if (!navigator.mediaDevices?.getDisplayMedia) {
            toast.error('Screen capture is not available in this browser');
            return;
        }

        let stream: MediaStream | null = null;
        setIsCapturing(true);

        try {
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });

            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            await video.play();
            await new Promise((resolve) => requestAnimationFrame(resolve));

            const width = video.videoWidth;
            const height = video.videoHeight;
            if (!width || !height) {
                throw new Error('Screen capture returned an empty frame');
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas is unavailable');
            }
            ctx.drawImage(video, 0, 0, width, height);
            loadImageSource(canvas.toDataURL('image/png'), 'screen-capture.png');
            toast.success('Screen captured');
        } catch (error) {
            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                toast.error('Screen capture was cancelled');
            } else {
                toast.error(error instanceof Error ? error.message : 'Unable to capture the screen');
            }
        } finally {
            stream?.getTracks().forEach((track) => track.stop());
            setIsCapturing(false);
        }
    }, [loadImageSource]);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const file = Array.from(event.clipboardData?.files ?? []).find((item) =>
                item.type.startsWith('image/'),
            );

            if (file) {
                event.preventDefault();
                loadFile(file);
                toast.success('Image pasted');
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [loadFile]);

    const getPointFromEvent = useCallback((event: React.PointerEvent<HTMLDivElement>): Point | null => {
        if (!stageRef.current || !imageInfo) return null;

        const rect = stageRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / zoom;
        const y = (event.clientY - rect.top) / zoom;

        return {
            x: Math.max(0, Math.min(imageInfo.width, x)),
            y: Math.max(0, Math.min(imageInfo.height, y)),
        };
    }, [imageInfo, zoom]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const point = getPointFromEvent(event);
        if (!point) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        const color = MEASUREMENT_COLORS[measurements.length % MEASUREMENT_COLORS.length];
        setIsDrawing(true);
        setDraft({
            shape: mode,
            start: point,
            end: point,
            color: mode === 'calibrate' ? '#F97316' : color,
        });
    }, [getPointFromEvent, measurements.length, mode]);

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const point = getPointFromEvent(event);
        setCursorPoint(point);

        if (!point || !isDrawing) return;
        setDraft((current) => current ? { ...current, end: point } : null);
    }, [getPointFromEvent, isDrawing]);

    const handlePointerLeave = useCallback(() => {
        if (!isDrawing) {
            setCursorPoint(null);
        }
    }, [isDrawing]);

    const finishDraft = useCallback(() => {
        setIsDrawing(false);

        setDraft((current) => {
            if (!current) return null;

            const shape = current.shape;
            const pixels = distanceBetween(current.start, current.end);
            if (pixels < 3) return null;

            if (shape === 'calibrate') {
                setCalibrationReference({
                    start: current.start,
                    end: current.end,
                    pixels,
                });
                toast.success(`Calibration reference set to ${formatPixels(pixels)}`);
                return null;
            }

            setMeasurements((items) => [
                ...items,
                {
                    id: makeId(),
                    shape,
                    start: current.start,
                    end: current.end,
                    color: current.color,
                    name: `M${items.length + 1}`,
                },
            ]);

            return null;
        });
    }, []);

    const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        finishDraft();
    }, [finishDraft]);

    const handlePointerCancel = useCallback(() => {
        setIsDrawing(false);
        setDraft(null);
    }, []);

    const removeMeasurement = useCallback((id: string) => {
        setMeasurements((items) => items.filter((item) => item.id !== id));
    }, []);

    const resetWorkspace = useCallback(() => {
        setImageSrc(null);
        setImageInfo(null);
        setMeasurements([]);
        setCalibrationReference(null);
        setDraft(null);
        setCursorPoint(null);
        setZoom(1);
    }, []);

    const exportImage = useCallback(() => {
        if (!imageRef.current || !imageInfo) return;

        const canvas = document.createElement('canvas');
        canvas.width = imageInfo.width;
        canvas.height = imageInfo.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast.error('Unable to export image');
            return;
        }

        ctx.drawImage(imageRef.current, 0, 0, imageInfo.width, imageInfo.height);

        measurements.forEach((measurement) => {
            ctx.save();
            ctx.strokeStyle = measurement.color;
            ctx.fillStyle = measurement.color;
            ctx.lineWidth = Math.max(3, imageInfo.width / 900);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (measurement.shape === 'line') {
                ctx.beginPath();
                ctx.moveTo(measurement.start.x, measurement.start.y);
                ctx.lineTo(measurement.end.x, measurement.end.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(measurement.start.x, measurement.start.y, 5, 0, Math.PI * 2);
                ctx.arc(measurement.end.x, measurement.end.y, 5, 0, Math.PI * 2);
                ctx.fill();
                drawLabel(
                    ctx,
                    getMeasurementLabel(measurement, unitPerPixel, unit),
                    (measurement.start.x + measurement.end.x) / 2,
                    (measurement.start.y + measurement.end.y) / 2,
                    measurement.color,
                );
            } else {
                const rect = rectFromPoints(measurement.start, measurement.end);
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                drawLabel(
                    ctx,
                    getMeasurementLabel(measurement, unitPerPixel, unit),
                    rect.x + rect.width / 2,
                    rect.y,
                    measurement.color,
                );
            }

            ctx.restore();
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'screen-ruler-measurement.png';
        link.click();
        toast.success('Measurement image downloaded');
    }, [imageInfo, measurements, unit, unitPerPixel]);

    const renderedItems = useMemo(() => {
        const allItems: Array<{
            id: string;
            shape: MeasurementShape | 'calibrate';
            start: Point;
            end: Point;
            color: string;
            label: string;
            isDraft?: boolean;
        }> = measurements.map((measurement) => ({
            id: measurement.id,
            shape: measurement.shape,
            start: measurement.start,
            end: measurement.end,
            color: measurement.color,
            label: getMeasurementLabel(measurement, unitPerPixel, unit),
        }));

        if (calibrationReference) {
            allItems.push({
                id: 'calibration-reference',
                shape: 'calibrate',
                start: calibrationReference.start,
                end: calibrationReference.end,
                color: '#F97316',
                label: unitPerPixel
                    ? `${knownDistance || '0'} ${unit} reference`
                    : `${formatPixels(calibrationReference.pixels)} reference`,
            });
        }

        if (draft) {
            allItems.push({
                id: 'draft',
                shape: draft.shape,
                start: draft.start,
                end: draft.end,
                color: draft.color,
                label:
                    draft.shape === 'calibrate'
                        ? formatPixels(distanceBetween(draft.start, draft.end))
                        : getMeasurementLabel(
                            {
                                id: 'draft',
                                shape: draft.shape,
                                start: draft.start,
                                end: draft.end,
                                color: draft.color,
                                name: 'Draft',
                            },
                            unitPerPixel,
                            unit,
                        ),
                isDraft: true,
            });
        }

        return allItems;
    }, [calibrationReference, draft, knownDistance, measurements, unit, unitPerPixel]);

    if (!imageSrc || !imageInfo) {
        return (
            <>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <EmptyState
                    onCapture={captureScreen}
                    onUploadClick={() => fileInputRef.current?.click()}
                    isCapturing={isCapturing}
                />
            </>
        );
    }

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    <ToolButton
                        active={mode === 'line'}
                        icon={LineSegment}
                        label="Line"
                        onClick={() => setMode('line')}
                    />
                    <ToolButton
                        active={mode === 'box'}
                        icon={BoundingBox}
                        label="Box"
                        onClick={() => setMode('box')}
                    />
                    <ToolButton
                        active={mode === 'calibrate'}
                        icon={CrosshairSimple}
                        label="Calibrate"
                        onClick={() => setMode('calibrate')}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={captureScreen}
                        disabled={isCapturing}
                        className="gap-2"
                    >
                        <Camera className="w-4 h-4" weight="duotone" />
                        Capture
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                    >
                        <UploadSimple className="w-4 h-4" weight="duotone" />
                        Replace
                    </Button>
                    <Button
                        type="button"
                        onClick={exportImage}
                        disabled={measurements.length === 0}
                        className="gap-2"
                    >
                        <DownloadSimple className="w-4 h-4" weight="duotone" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-100 overflow-hidden">
                    <div className="overflow-auto max-h-[72vh] scrollbar-themed">
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `36px ${displayWidth}px`,
                                gridTemplateRows: `28px ${displayHeight}px`,
                                width: displayWidth + 36,
                                height: displayHeight + 28,
                            }}
                        >
                            <div className="sticky top-0 left-0 z-30 bg-gray-100 border-r border-b border-gray-200" />
                            <div className="sticky top-0 z-20">
                                <RulerStrip orientation="horizontal" size={imageInfo.width} zoom={zoom} />
                            </div>
                            <div className="sticky left-0 z-20">
                                <RulerStrip orientation="vertical" size={imageInfo.height} zoom={zoom} />
                            </div>
                            <div
                                ref={stageRef}
                                className="relative bg-white overflow-hidden touch-none"
                                style={{
                                    width: displayWidth,
                                    height: displayHeight,
                                    cursor: mode === 'calibrate' ? 'crosshair' : 'cell',
                                }}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerCancel}
                                onPointerLeave={handlePointerLeave}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element -- Local data URLs cannot go through next/image optimization. */}
                                <img
                                    ref={imageRef}
                                    src={imageSrc}
                                    alt={imageInfo.name}
                                    draggable={false}
                                    className="block pointer-events-none select-none"
                                    style={{
                                        width: displayWidth,
                                        height: displayHeight,
                                    }}
                                />
                                <svg
                                    className="absolute inset-0 pointer-events-none"
                                    width={displayWidth}
                                    height={displayHeight}
                                >
                                    {cursorPoint && (
                                        <g opacity="0.35">
                                            <line
                                                x1={0}
                                                y1={cursorPoint.y * zoom}
                                                x2={displayWidth}
                                                y2={cursorPoint.y * zoom}
                                                stroke="#0284C7"
                                                strokeWidth={1}
                                            />
                                            <line
                                                x1={cursorPoint.x * zoom}
                                                y1={0}
                                                x2={cursorPoint.x * zoom}
                                                y2={displayHeight}
                                                stroke="#0284C7"
                                                strokeWidth={1}
                                            />
                                        </g>
                                    )}

                                    {renderedItems.map((item) => {
                                        const start = {
                                            x: item.start.x * zoom,
                                            y: item.start.y * zoom,
                                        };
                                        const end = {
                                            x: item.end.x * zoom,
                                            y: item.end.y * zoom,
                                        };
                                        const labelX = item.shape === 'box'
                                            ? (Math.min(item.start.x, item.end.x) + Math.abs(item.end.x - item.start.x) / 2) * zoom
                                            : (start.x + end.x) / 2;
                                        const labelY = item.shape === 'box'
                                            ? Math.min(item.start.y, item.end.y) * zoom
                                            : (start.y + end.y) / 2;
                                        const labelWidth = Math.min(
                                            Math.max(70, item.label.length * 7 + 14),
                                            Math.max(70, displayWidth - 12),
                                        );
                                        const labelLeft = Math.min(
                                            Math.max(6, labelX - labelWidth / 2),
                                            Math.max(6, displayWidth - labelWidth - 6),
                                        );
                                        const labelTop = Math.min(
                                            Math.max(6, labelY - 32),
                                            Math.max(6, displayHeight - 30),
                                        );

                                        if (item.shape === 'box') {
                                            const rect = rectFromPoints(item.start, item.end);
                                            return (
                                                <g key={item.id} opacity={item.isDraft ? 0.75 : 1}>
                                                    <rect
                                                        x={rect.x * zoom}
                                                        y={rect.y * zoom}
                                                        width={rect.width * zoom}
                                                        height={rect.height * zoom}
                                                        fill={`${item.color}17`}
                                                        stroke={item.color}
                                                        strokeWidth={2}
                                                        strokeDasharray={item.isDraft ? '6 5' : undefined}
                                                    />
                                                    <rect
                                                        x={labelLeft}
                                                        y={labelTop}
                                                        width={labelWidth}
                                                        height={24}
                                                        rx={6}
                                                        fill="rgba(255,255,255,0.94)"
                                                        stroke={item.color}
                                                    />
                                                    <text
                                                        x={labelLeft + 7}
                                                        y={labelTop + 17}
                                                        fill="#111827"
                                                        fontSize={12}
                                                        fontWeight={700}
                                                    >
                                                        {item.label}
                                                    </text>
                                                </g>
                                            );
                                        }

                                        return (
                                            <g key={item.id} opacity={item.isDraft ? 0.75 : 1}>
                                                <line
                                                    x1={start.x}
                                                    y1={start.y}
                                                    x2={end.x}
                                                    y2={end.y}
                                                    stroke={item.color}
                                                    strokeWidth={item.shape === 'calibrate' ? 2.5 : 2}
                                                    strokeDasharray={item.shape === 'calibrate' || item.isDraft ? '6 5' : undefined}
                                                    strokeLinecap="round"
                                                />
                                                <circle cx={start.x} cy={start.y} r={4} fill={item.color} />
                                                <circle cx={end.x} cy={end.y} r={4} fill={item.color} />
                                                <rect
                                                    x={labelLeft}
                                                    y={labelTop}
                                                    width={labelWidth}
                                                    height={24}
                                                    rx={6}
                                                    fill="rgba(255,255,255,0.94)"
                                                    stroke={item.color}
                                                />
                                                <text
                                                    x={labelLeft + 7}
                                                    y={labelTop + 17}
                                                    fill="#111827"
                                                    fontSize={12}
                                                    fontWeight={700}
                                                >
                                                    {item.label}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-gray-900">Workspace</h2>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {imageInfo.name}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                title="Clear image"
                                onClick={resetWorkspace}
                            >
                                <Trash className="w-4 h-4" weight="duotone" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Image</p>
                                <p className="font-mono text-gray-900 mt-1">
                                    {imageInfo.width} x {imageInfo.height}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Pointer</p>
                                <p className="font-mono text-gray-900 mt-1">
                                    {cursorPoint
                                        ? `${Math.round(cursorPoint.x)}, ${Math.round(cursorPoint.y)}`
                                        : '0, 0'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Zoom
                                </Label>
                                <span className="text-xs font-mono text-gray-500">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    title="Zoom out"
                                    onClick={() => setZoom((value) => Math.max(ZOOM_MIN, Number((value - 0.1).toFixed(2))))}
                                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                >
                                    <MagnifyingGlassMinus className="w-4 h-4" weight="duotone" />
                                </button>
                                <Slider
                                    value={[zoom]}
                                    min={ZOOM_MIN}
                                    max={ZOOM_MAX}
                                    step={0.05}
                                    onValueChange={(value) => setZoom(value[0])}
                                />
                                <button
                                    type="button"
                                    title="Zoom in"
                                    onClick={() => setZoom((value) => Math.min(ZOOM_MAX, Number((value + 0.1).toFixed(2))))}
                                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                >
                                    <MagnifyingGlassPlus className="w-4 h-4" weight="duotone" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <CrosshairSimple className="w-5 h-5 text-primary-600" weight="duotone" />
                            <h2 className="font-semibold text-gray-900">Calibration</h2>
                        </div>

                        <div className="grid grid-cols-[1fr_88px] gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="known-distance" className="text-xs text-gray-500">
                                    Known distance
                                </Label>
                                <Input
                                    id="known-distance"
                                    value={knownDistance}
                                    onChange={(event) => setKnownDistance(event.target.value)}
                                    inputMode="decimal"
                                    placeholder="10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit" className="text-xs text-gray-500">
                                    Unit
                                </Label>
                                <select
                                    id="unit"
                                    value={unit}
                                    onChange={(event) => setUnit(event.target.value as CalibrationUnit)}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="mm">mm</option>
                                    <option value="cm">cm</option>
                                    <option value="in">in</option>
                                </select>
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            {calibrationReference ? (
                                <div className="space-y-1">
                                    <p>
                                        Reference: <span className="font-mono text-gray-900">{formatPixels(calibrationReference.pixels)}</span>
                                    </p>
                                    <p>
                                        Scale:{' '}
                                        <span className="font-mono text-gray-900">
                                            {unitPerPixel ? `${formatNumber(unitPerPixel)} ${unit}/px` : 'Set known distance'}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <p>Choose Calibrate, then draw across an object with a known size.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ruler className="w-5 h-5 text-primary-600" weight="duotone" />
                                <h2 className="font-semibold text-gray-900">Measurements</h2>
                            </div>
                            <span className="text-xs font-mono text-gray-500">
                                {measurements.length}
                            </span>
                        </div>

                        {measurements.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 text-center">
                                No measurements yet.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[280px] overflow-auto pr-1 scrollbar-themed">
                                {measurements.map((measurement) => {
                                    const details = getMeasurementDetails(measurement, unitPerPixel, unit);
                                    return (
                                        <div
                                            key={measurement.id}
                                            className="rounded-lg border border-gray-200 p-3 flex items-start gap-3"
                                        >
                                            <span
                                                className="mt-1 h-3 w-3 rounded-full shrink-0"
                                                style={{ backgroundColor: measurement.color }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {measurement.name}
                                                    </p>
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-400">
                                                        {measurement.shape}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-mono text-gray-800 mt-1">
                                                    {details.primary}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {details.secondary}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                title="Delete measurement"
                                                onClick={() => removeMeasurement(measurement.id)}
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
                                            >
                                                <Trash className="w-4 h-4" weight="duotone" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMeasurements([])}
                                disabled={measurements.length === 0}
                                className="gap-2"
                            >
                                <Minus className="w-4 h-4" weight="duotone" />
                                Clear
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMode('line')}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" weight="duotone" />
                                Add
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
