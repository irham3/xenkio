'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    Plus,
    Download,
    RotateCcw,
    Loader2,
    FileText,
    Crop,
    Copy,
    ChevronLeft,
    ChevronRight,
    Check,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCropPdf } from '../hooks/use-crop-pdf';
import { PdfFile, CropRect, PageDimensions, CropMode } from '../types';
import { getPdfjs } from '@/lib/pdf-worker';

// ============================================================================
// Paper size presets (dimensions in PDF points: 1 inch = 72 points)
// ============================================================================
interface CropPreset {
    id: string;
    label: string;
    /** Width in points (portrait). null = free crop */
    width: number | null;
    /** Height in points (portrait). null = free crop */
    height: number | null;
    group: 'paper' | 'ratio' | 'special';
}

const CROP_PRESETS: CropPreset[] = [
    { id: 'free', label: 'Free Crop', width: null, height: null, group: 'special' },
    // ISO Paper Sizes
    { id: 'a3', label: 'A3 (297×420 mm)', width: 841.89, height: 1190.55, group: 'paper' },
    { id: 'a4', label: 'A4 (210×297 mm)', width: 595.28, height: 841.89, group: 'paper' },
    { id: 'a5', label: 'A5 (148×210 mm)', width: 419.53, height: 595.28, group: 'paper' },
    { id: 'a6', label: 'A6 (105×148 mm)', width: 297.64, height: 419.53, group: 'paper' },
    // US Paper Sizes
    { id: 'letter', label: 'US Letter (8.5×11")', width: 612, height: 792, group: 'paper' },
    { id: 'legal', label: 'US Legal (8.5×14")', width: 612, height: 1008, group: 'paper' },
    // JIS
    { id: 'b5', label: 'B5 (176×250 mm)', width: 498.90, height: 708.66, group: 'paper' },
    // Common Ratios
    { id: 'square', label: 'Square (1:1)', width: 1, height: 1, group: 'ratio' },
    { id: '16-9', label: 'Widescreen (16:9)', width: 16, height: 9, group: 'ratio' },
    { id: '4-3', label: 'Standard (4:3)', width: 4, height: 3, group: 'ratio' },
    { id: '3-2', label: 'Photo (3:2)', width: 3, height: 2, group: 'ratio' },
];

// ============================================================================
// PDF Page Canvas (renders a PDF page onto a canvas)
// ============================================================================
interface PdfCanvasProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDocument?: any;
    arrayBuffer: ArrayBuffer;
    pageNumber: number;
    scale: number;
    onDimensionsReady?: (width: number, height: number) => void;
}

function PdfCanvas({ pdfDocument, arrayBuffer, pageNumber, scale, onDimensionsReady }: PdfCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const render = async () => {
            if (!canvasRef.current) return;

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }

            try {
                let pdf = pdfDocument;
                if (!pdf) {
                    const pdfjsLib = await getPdfjs();
                    const bufferCopy = arrayBuffer.slice(0);
                    pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise;
                }

                if (isCancelled) return;
                const page = await pdf.getPage(pageNumber);
                const canvas = canvasRef.current;
                if (!canvas || isCancelled) return;
                const context = canvas.getContext('2d');
                if (!context) return;

                const viewport = page.getViewport({ scale });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                if (onDimensionsReady) {
                    const originalViewport = page.getViewport({ scale: 1 });
                    onDimensionsReady(originalViewport.width, originalViewport.height);
                }

                const renderTask = page.render({
                    canvasContext: context,
                    viewport,
                    canvas,
                });
                renderTaskRef.current = renderTask;
                await renderTask.promise;

                if (!isCancelled) {
                    setIsLoading(false);
                }
            } catch (error) {
                if (error instanceof Error && error.message.includes('Rendering cancelled')) return;
                console.error(`Failed to render PDF page ${pageNumber}:`, error);
                if (!isCancelled) {
                    setIsLoading(false);
                    setHasError(true);
                }
            }
        };

        render();

        return () => {
            isCancelled = true;
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }
        };
    }, [pdfDocument, arrayBuffer, pageNumber, scale, onDimensionsReady]);

    if (hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
                <FileText className="w-10 h-10 text-red-300" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={cn(
                    'w-full h-full object-contain rounded-lg bg-white transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
            />
        </div>
    );
}

// ============================================================================
// Crop Overlay - The interactive crop rectangle on top of the canvas
// ============================================================================
interface CropOverlayProps {
    containerWidth: number;
    containerHeight: number;
    pdfWidth: number;
    pdfHeight: number;
    cropRect: CropRect;
    onCropChange: (rect: CropRect) => void;
}

function CropOverlay({
    containerWidth,
    containerHeight,
    pdfWidth,
    pdfHeight,
    cropRect,
    onCropChange,
}: CropOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<{
        type: 'move' | 'resize';
        handlePos?: string;
        startX: number;
        startY: number;
        startRect: CropRect;
    } | null>(null);

    // Scale factors: PDF points to screen pixels
    const scaleX = containerWidth / pdfWidth;
    const scaleY = containerHeight / pdfHeight;

    // Convert crop rect from PDF points to screen pixels
    const screenX = cropRect.x * scaleX;
    const screenY = cropRect.y * scaleY;
    const screenW = cropRect.width * scaleX;
    const screenH = cropRect.height * scaleY;

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, type: 'move' | 'resize', handlePos?: string) => {
            e.preventDefault();
            e.stopPropagation();
            setDragState({
                type,
                handlePos,
                startX: e.clientX,
                startY: e.clientY,
                startRect: { ...cropRect },
            });
        },
        [cropRect]
    );

    useEffect(() => {
        if (!dragState) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = (e.clientX - dragState.startX) / scaleX;
            const dy = (e.clientY - dragState.startY) / scaleY;
            const sr = dragState.startRect;

            if (dragState.type === 'move') {
                const newX = Math.max(0, Math.min(pdfWidth - sr.width, sr.x + dx));
                const newY = Math.max(0, Math.min(pdfHeight - sr.height, sr.y + dy));
                onCropChange({ ...sr, x: newX, y: newY });
            } else if (dragState.type === 'resize' && dragState.handlePos) {
                let newX = sr.x;
                let newY = sr.y;
                let newW = sr.width;
                let newH = sr.height;

                const pos = dragState.handlePos;

                if (pos.includes('w')) {
                    newX = Math.max(0, Math.min(sr.x + sr.width - 20, sr.x + dx));
                    newW = sr.width - (newX - sr.x);
                }
                if (pos.includes('e')) {
                    newW = Math.max(20, Math.min(pdfWidth - sr.x, sr.width + dx));
                }
                if (pos.includes('n')) {
                    newY = Math.max(0, Math.min(sr.y + sr.height - 20, sr.y + dy));
                    newH = sr.height - (newY - sr.y);
                }
                if (pos.includes('s')) {
                    newH = Math.max(20, Math.min(pdfHeight - sr.y, sr.height + dy));
                }

                onCropChange({ x: newX, y: newY, width: newW, height: newH });
            }
        };

        const handleMouseUp = () => {
            setDragState(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, scaleX, scaleY, pdfWidth, pdfHeight, onCropChange]);

    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];

    const getHandleStyle = (pos: string): React.CSSProperties => {
        const size = 10;
        const offset = -size / 2;
        const style: React.CSSProperties = {
            position: 'absolute',
            width: size,
            height: size,
            backgroundColor: '#0284C7',
            border: '2px solid white',
            borderRadius: 2,
            zIndex: 30,
        };

        if (pos.includes('n')) style.top = offset;
        if (pos.includes('s')) style.bottom = offset;
        if (pos.includes('w')) style.left = offset;
        if (pos.includes('e')) style.right = offset;

        // Center handles on edges
        if (pos === 'n' || pos === 's') { style.left = '50%'; style.transform = 'translateX(-50%)'; }
        if (pos === 'w' || pos === 'e') { style.top = '50%'; style.transform = 'translateY(-50%)'; }

        // Cursors
        const cursors: Record<string, string> = {
            nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
            n: 'n-resize', s: 's-resize', w: 'w-resize', e: 'e-resize',
        };
        style.cursor = cursors[pos] || 'pointer';

        return style;
    };

    return (
        <div
            ref={overlayRef}
            className="absolute inset-0 z-20"
            style={{ pointerEvents: 'none' }}
        >
            {/* Dimmed areas */}
            <div
                className="absolute bg-black/40"
                style={{ top: 0, left: 0, right: 0, height: screenY }}
            />
            <div
                className="absolute bg-black/40"
                style={{ top: screenY + screenH, left: 0, right: 0, bottom: 0 }}
            />
            <div
                className="absolute bg-black/40"
                style={{ top: screenY, left: 0, width: screenX, height: screenH }}
            />
            <div
                className="absolute bg-black/40"
                style={{
                    top: screenY,
                    left: screenX + screenW,
                    right: 0,
                    height: screenH,
                }}
            />

            {/* Crop selection */}
            <div
                className="absolute border-2 border-primary-500"
                style={{
                    left: screenX,
                    top: screenY,
                    width: screenW,
                    height: screenH,
                    cursor: 'move',
                    pointerEvents: 'auto',
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
                {/* Dashed grid lines (rule of thirds) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-primary-300/60" />
                    <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-primary-300/60" />
                    <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-primary-300/60" />
                    <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-primary-300/60" />
                </div>

                {/* Resize handles */}
                {handles.map((pos) => (
                    <div
                        key={pos}
                        style={{ ...getHandleStyle(pos), pointerEvents: 'auto' }}
                        onMouseDown={(e) => handleMouseDown(e, 'resize', pos)}
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Page thumbnail strip
// ============================================================================
interface PageThumbnailProps {
    pageNumber: number;
    isActive: boolean;
    hasCrop: boolean;
    onClick: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDocument?: any;
    arrayBuffer: ArrayBuffer;
}

function PageThumbnail({ pageNumber, isActive, hasCrop, onClick, pdfDocument, arrayBuffer }: PageThumbnailProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200',
                isActive
                    ? 'border-primary-500 shadow-primary ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-primary-300'
            )}
        >
            <PdfCanvas
                pdfDocument={pdfDocument}
                arrayBuffer={arrayBuffer}
                pageNumber={pageNumber}
                scale={0.3}
            />
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent p-1">
                <span className="text-[10px] text-white font-medium">{pageNumber}</span>
            </div>
            {hasCrop && (
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                </div>
            )}
        </button>
    );
}

// ============================================================================
// Main Crop PDF Tool Component
// ============================================================================
export default function CropPdfTool() {
    const { loadPdf, getPageDimensions, cropPdf, isProcessing } = useCropPdf();
    const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageDimensions, setPageDimensions] = useState<PageDimensions[]>([]);
    const [cropRects, setCropRects] = useState<Map<number, CropRect>>(new Map());
    const [cropMode, setCropMode] = useState<CropMode>('all');
    const [selectedPreset, setSelectedPreset] = useState<string>('free');
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize crop rects when dimensions are ready  
    const initializeCropRects = useCallback((dims: PageDimensions[]) => {
        const newRects = new Map<number, CropRect>();
        dims.forEach((d, i) => {
            // Default crop: full page with 5% margin
            const marginX = d.width * 0.05;
            const marginY = d.height * 0.05;
            newRects.set(i, {
                x: marginX,
                y: marginY,
                width: d.width - marginX * 2,
                height: d.height - marginY * 2,
            });
        });
        setCropRects(newRects);
    }, []);

    // Observe container size
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [pdfFile]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a valid PDF file');
            return;
        }

        try {
            const loaded = await loadPdf(file);
            setPdfFile(loaded);
            setCurrentPage(1);

            const dims = await getPageDimensions(loaded);
            setPageDimensions(dims);
            initializeCropRects(dims);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load PDF');
        }
    }, [loadPdf, getPageDimensions, initializeCropRects]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    const handleCropChange = useCallback((rect: CropRect) => {
        setCropRects((prev) => {
            const next = new Map(prev);
            if (cropMode === 'all') {
                // Apply proportionally to all pages
                const currentDims = pageDimensions[currentPage - 1];
                if (!currentDims) return next;

                for (let i = 0; i < pageDimensions.length; i++) {
                    const dims = pageDimensions[i];
                    const ratioX = dims.width / currentDims.width;
                    const ratioY = dims.height / currentDims.height;
                    next.set(i, {
                        x: rect.x * ratioX,
                        y: rect.y * ratioY,
                        width: rect.width * ratioX,
                        height: rect.height * ratioY,
                    });
                }
            } else {
                next.set(currentPage - 1, rect);
            }
            return next;
        });
    }, [cropMode, currentPage, pageDimensions]);

    const handleApplyToAll = useCallback(() => {
        const currentRect = cropRects.get(currentPage - 1);
        const currentDims = pageDimensions[currentPage - 1];
        if (!currentRect || !currentDims) return;

        setCropRects((prev) => {
            const next = new Map(prev);
            for (let i = 0; i < pageDimensions.length; i++) {
                const dims = pageDimensions[i];
                const ratioX = dims.width / currentDims.width;
                const ratioY = dims.height / currentDims.height;
                next.set(i, {
                    x: currentRect.x * ratioX,
                    y: currentRect.y * ratioY,
                    width: currentRect.width * ratioX,
                    height: currentRect.height * ratioY,
                });
            }
            return next;
        });

        toast.success('Crop applied to all pages');
    }, [cropRects, currentPage, pageDimensions]);

    const handleDownload = useCallback(async () => {
        if (!pdfFile) return;

        try {
            const blob = await cropPdf(pdfFile, cropRects, pageDimensions);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pdfFile.name.replace('.pdf', '')}-cropped.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Cropped PDF downloaded successfully!');
        } catch (error) {
            console.error('Crop failed:', error);
            toast.error('Failed to crop PDF. Please try again.');
        }
    }, [pdfFile, cropRects, pageDimensions, cropPdf]);

    const handleReset = useCallback(() => {
        setPdfFile(null);
        setCurrentPage(1);
        setPageDimensions([]);
        setCropRects(new Map());
        setCropMode('all');
        setSelectedPreset('free');
    }, []);

    // Apply a preset to all pages (or current page in individual mode)
    const handlePresetChange = useCallback((presetId: string) => {
        setSelectedPreset(presetId);
        const preset = CROP_PRESETS.find((p) => p.id === presetId);
        if (!preset || !preset.width || !preset.height) {
            // Free crop — do nothing, just update the selection
            return;
        }

        setCropRects((prev) => {
            const next = new Map(prev);
            const isRatio = preset.group === 'ratio';

            const applyToPage = (pageIdx: number) => {
                const dims = pageDimensions[pageIdx];
                if (!dims) return;

                let cropW: number;
                let cropH: number;

                if (isRatio) {
                    // Fit the aspect ratio as large as possible within the page
                    const aspect = preset.width! / preset.height!;
                    if (dims.width / dims.height > aspect) {
                        cropH = dims.height * 0.9;
                        cropW = cropH * aspect;
                    } else {
                        cropW = dims.width * 0.9;
                        cropH = cropW / aspect;
                    }
                } else {
                    // Paper size: use exact points, clamped to page
                    cropW = Math.min(preset.width!, dims.width);
                    cropH = Math.min(preset.height!, dims.height);
                }

                // Center the crop rect on the page
                const cropX = Math.max(0, (dims.width - cropW) / 2);
                const cropY = Math.max(0, (dims.height - cropH) / 2);

                next.set(pageIdx, { x: cropX, y: cropY, width: cropW, height: cropH });
            };

            if (cropMode === 'all') {
                for (let i = 0; i < pageDimensions.length; i++) {
                    applyToPage(i);
                }
            } else {
                applyToPage(currentPage - 1);
            }

            return next;
        });

        toast.success(`Preset applied: ${preset.label}`);
    }, [pageDimensions, cropMode, currentPage]);

    const handleResetCrop = useCallback(() => {
        if (pageDimensions.length > 0) {
            initializeCropRects(pageDimensions);
            toast.success('Crop reset to default');
        }
    }, [pageDimensions, initializeCropRects]);

    // Calculate render scale based on container size
    const currentDims = pageDimensions[currentPage - 1];
    let renderScale = 1;
    if (currentDims && containerSize.width > 0 && containerSize.height > 0) {
        const scaleW = containerSize.width / currentDims.width;
        const scaleH = containerSize.height / currentDims.height;
        renderScale = Math.min(scaleW, scaleH);
    }

    const renderedWidth = currentDims ? currentDims.width * renderScale : 0;
    const renderedHeight = currentDims ? currentDims.height * renderScale : 0;

    const currentCropRect = cropRects.get(currentPage - 1);

    // Current crop dimensions for display
    const cropInfo = currentCropRect
        ? {
            width: Math.round(currentCropRect.width),
            height: Math.round(currentCropRect.height),
        }
        : null;

    // ========================================================================
    // Upload state
    // ========================================================================
    if (!pdfFile) {
        return (
            <div className="py-12">
                <div className="w-full max-w-4xl mx-auto">
                    <div
                        {...getRootProps()}
                        className={cn(
                            'relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer',
                            isDragActive
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center space-y-6">
                            <div
                                className={cn(
                                    'w-20 h-20 rounded-2xl flex items-center justify-center transition-all',
                                    isDragActive ? 'bg-primary-100' : 'bg-gray-100'
                                )}
                            >
                                <Upload
                                    className={cn(
                                        'w-10 h-10 transition-colors',
                                        isDragActive ? 'text-primary-600' : 'text-gray-400'
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-semibold text-gray-900">
                                    {isDragActive ? 'Drop your PDF here' : 'Select PDF file'}
                                </p>
                                <p className="text-gray-500">
                                    or drag and drop PDF file here to crop
                                </p>
                            </div>
                            <Button size="lg" className="mt-4" type="button">
                                <Plus className="w-4 h-4 mr-2" />
                                Select PDF file
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <Crop className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Visual Crop Editor</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Drag and resize the crop area directly on the PDF preview. Rule-of-thirds grid for precision.
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <Copy className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Batch or Per-Page</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Apply the same crop to all pages at once, or customize the crop area for each page individually.
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">100% Private</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Your files are processed locally in your browser and never uploaded to any server.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // Crop editor state
    // ========================================================================
    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-soft">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Crop Mode Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
                        <button
                            type="button"
                            className={cn(
                                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                                cropMode === 'all'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                            onClick={() => setCropMode('all')}
                        >
                            All Pages
                        </button>
                        <button
                            type="button"
                            className={cn(
                                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                                cropMode === 'individual'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                            onClick={() => setCropMode('individual')}
                        >
                            Per Page
                        </button>
                    </div>

                    {/* Paper size preset dropdown */}
                    <div className="relative">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 hidden sm:inline">Format:</span>
                            <div className="relative">
                                <select
                                    id="crop-preset-select"
                                    value={selectedPreset}
                                    onChange={(e) => handlePresetChange(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm font-medium text-gray-700 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
                                >
                                    <option value="free">Free Crop</option>
                                    <optgroup label="Paper Sizes">
                                        {CROP_PRESETS.filter((p) => p.group === 'paper').map((p) => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Aspect Ratios">
                                        {CROP_PRESETS.filter((p) => p.group === 'ratio').map((p) => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {cropMode === 'individual' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleApplyToAll}
                            className="text-xs"
                        >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Apply to All
                        </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={handleResetCrop} className="text-xs">
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset Crop
                    </Button>

                    {cropInfo && (
                        <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                            {cropInfo.width} × {cropInfo.height} pt
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                        Change File
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={isProcessing}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Cropped PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main editor area */}
            <div className="flex gap-6">
                {/* Page thumbnails (left sidebar) */}
                {pdfFile.pageCount > 1 && (
                    <div className="hidden md:flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1 scrollbar-themed">
                        {Array.from({ length: pdfFile.pageCount }, (_, i) => (
                            <PageThumbnail
                                key={i}
                                pageNumber={i + 1}
                                isActive={currentPage === i + 1}
                                hasCrop={cropRects.has(i)}
                                onClick={() => setCurrentPage(i + 1)}
                                pdfDocument={pdfFile.pdfDocument}
                                arrayBuffer={pdfFile.arrayBuffer}
                            />
                        ))}
                    </div>
                )}

                {/* Canvas + Crop overlay */}
                <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                    <div
                        ref={containerRef}
                        className="relative flex items-center justify-center"
                        style={{ minHeight: 500, maxHeight: 680 }}
                    >
                        {currentDims && (
                            <div
                                className="relative"
                                style={{
                                    width: renderedWidth,
                                    height: renderedHeight,
                                }}
                            >
                                <PdfCanvas
                                    pdfDocument={pdfFile.pdfDocument}
                                    arrayBuffer={pdfFile.arrayBuffer}
                                    pageNumber={currentPage}
                                    scale={renderScale}
                                />

                                {currentCropRect && (
                                    <CropOverlay
                                        containerWidth={renderedWidth}
                                        containerHeight={renderedHeight}
                                        pdfWidth={currentDims.width}
                                        pdfHeight={currentDims.height}
                                        cropRect={currentCropRect}
                                        onCropChange={handleCropChange}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation bar for pages */}
                    {pdfFile.pageCount > 1 && (
                        <div className="flex items-center justify-center gap-4 py-3 bg-white border-t border-gray-200">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-gray-700 font-medium">
                                Page {currentPage} of {pdfFile.pageCount}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= pdfFile.pageCount}
                                onClick={() => setCurrentPage((p) => Math.min(pdfFile.pageCount, p + 1))}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
