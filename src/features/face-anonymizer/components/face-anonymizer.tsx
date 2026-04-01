'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, RotateCcw, Eye, EyeOff, Loader2, ScanFace, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useFaceAnonymizer } from '../hooks/use-face-anonymizer';
import {
    SUPPORTED_IMAGE_TYPES,
    MAX_FILE_SIZE,
    MIN_INTENSITY,
    MAX_BLUR_INTENSITY,
    MAX_PIXELATE_INTENSITY,
} from '../constants';
import type { AnonymizationMode, ApplyMode } from '../types';

export function FaceAnonymizer() {
    const {
        imageUrl,
        imageDimensions,
        naturalDimensions,
        faces,
        mode,
        applyTo,
        intensity,
        status,
        canvasRef,
        handleImageUpload,
        toggleFaceSelection,
        selectAllFaces,
        deselectAllFaces,
        handleModeChange,
        setApplyTo,
        setIntensity,
        handleDownload,
        reset,
    } = useFaceAnonymizer();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles[0]) handleImageUpload(acceptedFiles[0]);
        },
        [handleImageUpload],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: SUPPORTED_IMAGE_TYPES,
        multiple: false,
        maxSize: MAX_FILE_SIZE,
    });

    const maxIntensity = mode === 'blur' ? MAX_BLUR_INTENSITY : MAX_PIXELATE_INTENSITY;

    // ── Upload zone ──────────────────────────────────────────────────────────
    if (!imageUrl) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-8">
                {status.isModelLoading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        <span>Loading face detection model…</span>
                    </div>
                )}

                <div
                    {...getRootProps()}
                    className={cn(
                        'relative border-2 border-dashed rounded-3xl p-12 lg:p-16 transition-all duration-300 cursor-pointer group',
                        isDragActive
                            ? 'border-primary-500 bg-primary-50/50'
                            : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50 bg-white shadow-soft',
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <div
                            className={cn(
                                'w-20 h-20 rounded-2xl flex items-center justify-center transition-all bg-white shadow-medium',
                                isDragActive ? 'scale-110 shadow-primary' : 'group-hover:scale-105',
                            )}
                        >
                            <ScanFace
                                className={cn(
                                    'w-10 h-10 transition-colors',
                                    isDragActive ? 'text-primary-600' : 'text-primary-500',
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">
                                {isDragActive ? 'Drop your image here' : 'Select Image'}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                Faces are detected automatically. Blur or pixelate all faces or only
                                the ones you pick.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 pt-2">
                                {['JPG', 'PNG', 'WebP'].map((fmt) => (
                                    <span
                                        key={fmt}
                                        className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider"
                                    >
                                        {fmt}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="mt-4 rounded-xl px-8 bg-primary-600 hover:bg-primary-700 shadow-primary hover:shadow-primary-lg transition-all cursor-pointer"
                            type="button"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                        </Button>
                    </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 pt-4">
                    {[
                        {
                            icon: <ScanFace className="w-6 h-6 text-blue-600" />,
                            bg: 'bg-blue-50',
                            title: 'Auto Detection',
                            desc: 'Faces are found instantly using AI — no manual marking needed.',
                        },
                        {
                            icon: <Eye className="w-6 h-6 text-purple-600" />,
                            bg: 'bg-purple-50',
                            title: 'Blur or Pixelate',
                            desc: 'Choose your preferred anonymization style and set the strength.',
                        },
                        {
                            icon: <ImageIcon className="w-6 h-6 text-green-600" />,
                            bg: 'bg-green-50',
                            title: '100% Private',
                            desc: 'Everything runs in your browser — no image ever leaves your device.',
                        },
                    ].map(({ icon, bg, title, desc }) => (
                        <div key={title} className="flex flex-col items-center text-center p-4">
                            <div className={cn('p-3 rounded-xl mb-3', bg)}>{icon}</div>
                            <h3 className="font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Workspace ─────────────────────────────────────────────────────────────
    const canvasW = imageDimensions?.width ?? 0;
    const canvasH = imageDimensions?.height ?? 0;
    const natW = naturalDimensions?.width ?? canvasW;
    const natH = naturalDimensions?.height ?? canvasH;
    const scaleX = natW > 0 ? canvasW / natW : 1;
    const scaleY = natH > 0 ? canvasH / natH : 1;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">Face Anonymizer</h2>
                    {status.isDetecting ? (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Detecting…
                        </span>
                    ) : faces.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                            {faces.length} face{faces.length !== 1 ? 's' : ''} detected
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                            No faces detected
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500" onClick={reset}>
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    New Image
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas + overlay */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Preview</span>
                        {applyTo === 'selected' && faces.length > 0 && (
                            <span className="text-xs text-gray-400">
                                Click a face box to select / deselect
                            </span>
                        )}
                    </div>
                    <div className="p-4 flex items-center justify-center bg-gray-50 min-h-[300px]">
                        {status.isDetecting && faces.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                <span className="text-sm">Detecting faces…</span>
                            </div>
                        ) : (
                            <div
                                className="relative"
                                style={{ width: canvasW, height: canvasH, maxWidth: '100%' }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    width={canvasW}
                                    height={canvasH}
                                    className="rounded-lg shadow-sm max-w-full block"
                                />

                                {/* Face selection overlays */}
                                {faces.map((face, idx) => {
                                    const left = face.topLeft[0] * scaleX;
                                    const top = face.topLeft[1] * scaleY;
                                    const width = (face.bottomRight[0] - face.topLeft[0]) * scaleX;
                                    const height = (face.bottomRight[1] - face.topLeft[1]) * scaleY;
                                    const isActive = applyTo === 'all' || face.selected;

                                    return (
                                        <button
                                            key={face.id}
                                            onClick={() =>
                                                applyTo === 'selected' && toggleFaceSelection(face.id)
                                            }
                                            className={cn(
                                                'absolute border-2 rounded-sm transition-all group',
                                                applyTo === 'selected'
                                                    ? 'cursor-pointer'
                                                    : 'cursor-default pointer-events-none',
                                                isActive
                                                    ? 'border-primary-500 bg-primary-500/10'
                                                    : 'border-gray-400/70 bg-gray-400/5',
                                            )}
                                            style={{ left, top, width, height }}
                                            title={
                                                applyTo === 'selected'
                                                    ? face.selected
                                                        ? 'Click to deselect'
                                                        : 'Click to select'
                                                    : `Face ${idx + 1}`
                                            }
                                        >
                                            <span
                                                className={cn(
                                                    'absolute -top-5 left-0 text-[10px] font-bold px-1 rounded leading-none py-0.5',
                                                    isActive
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-gray-400 text-white',
                                                )}
                                            >
                                                {idx + 1}
                                            </span>
                                            {applyTo === 'selected' && (
                                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {face.selected ? (
                                                        <EyeOff className="w-4 h-4 text-primary-600 drop-shadow-sm" />
                                                    ) : (
                                                        <Eye className="w-4 h-4 text-gray-600 drop-shadow-sm" />
                                                    )}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Effect */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Effect</p>
                        <div className="grid grid-cols-2 gap-2">
                            {(['blur', 'pixelate'] as AnonymizationMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleModeChange(m)}
                                    className={cn(
                                        'py-2.5 px-4 rounded-lg text-sm font-medium border transition-all',
                                        mode === m
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600',
                                    )}
                                >
                                    {m === 'blur' ? '🌫️ Blur' : '🟦 Pixelate'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-600">Intensity</p>
                                <span className="text-sm font-bold text-gray-900">{intensity}</span>
                            </div>
                            <Slider
                                min={MIN_INTENSITY}
                                max={maxIntensity}
                                step={1}
                                value={[intensity]}
                                onValueChange={([val]) => setIntensity(val)}
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>Subtle</span>
                                <span>Strong</span>
                            </div>
                        </div>
                    </div>

                    {/* Apply to */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Apply To</p>
                        <div className="grid grid-cols-2 gap-2">
                            {(
                                [
                                    { value: 'all', label: 'All Faces' },
                                    { value: 'selected', label: 'Selected' },
                                ] as { value: ApplyMode; label: string }[]
                            ).map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setApplyTo(value)}
                                    className={cn(
                                        'py-2.5 px-4 rounded-lg text-sm font-medium border transition-all',
                                        applyTo === value
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600',
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {applyTo === 'selected' && faces.length > 0 && (
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    onClick={selectAllFaces}
                                    className="text-xs text-primary-600 hover:underline"
                                >
                                    Select all
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={deselectAllFaces}
                                    className="text-xs text-gray-500 hover:underline"
                                >
                                    Deselect all
                                </button>
                            </div>
                        )}
                        {applyTo === 'selected' && (
                            <p className="text-xs text-gray-400">
                                Click a face box in the preview to toggle.
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {status.error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                            {status.error}
                        </div>
                    )}

                    {/* Download */}
                    <Button
                        onClick={handleDownload}
                        disabled={faces.length === 0 || status.isDetecting}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm"
                        size="lg"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PNG
                    </Button>
                    <p className="text-xs text-gray-400 text-center">Saved at full original resolution</p>
                </div>
            </div>
        </div>
    );
}
