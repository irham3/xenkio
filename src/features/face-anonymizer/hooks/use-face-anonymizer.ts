'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { DetectedFace, AnonymizationMode, ApplyMode, FaceAnonymizerStatus } from '../types';
import { loadBlazeFace, detectFaces } from '../lib/face-detection';
import { applyAnonymization, renderToBlob, type FaceRegion } from '../lib/anonymizer';
import {
    DEFAULT_BLUR_INTENSITY,
    DEFAULT_PIXELATE_INTENSITY,
    FACE_PADDING_RATIO,
    MAX_DISPLAY_WIDTH,
    MAX_DISPLAY_HEIGHT,
} from '../constants';

export function useFaceAnonymizer() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
    const [faces, setFaces] = useState<DetectedFace[]>([]);
    const [mode, setMode] = useState<AnonymizationMode>('blur');
    const [applyTo, setApplyTo] = useState<ApplyMode>('all');
    const [intensity, setIntensity] = useState(DEFAULT_BLUR_INTENSITY);
    const [status, setStatus] = useState<FaceAnonymizerStatus>({
        isModelLoading: true,
        isDetecting: false,
        modelReady: false,
        error: null,
    });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageElRef = useRef<HTMLImageElement | null>(null);

    // Preload model when hook mounts
    useEffect(() => {
        loadBlazeFace()
            .then(() => setStatus((s) => ({ ...s, isModelLoading: false, modelReady: true })))
            .catch((err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Failed to load detection model';
                setStatus((s) => ({ ...s, isModelLoading: false, error: msg }));
            });
    }, []);

    // Run detection when a new image is loaded
    const runDetection = useCallback(async (imgEl: HTMLImageElement) => {
        setStatus((s) => ({ ...s, isDetecting: true, error: null }));
        setFaces([]);

        try {
            const rawFaces = await detectFaces(imgEl);

            const detected: DetectedFace[] = rawFaces.map((f) => {
                const x1 = f.topLeft[0];
                const y1 = f.topLeft[1];
                const x2 = f.bottomRight[0];
                const y2 = f.bottomRight[1];
                const w = x2 - x1;
                const h = y2 - y1;
                const padX = w * FACE_PADDING_RATIO;
                const padY = h * FACE_PADDING_RATIO;

                return {
                    id: crypto.randomUUID(),
                    topLeft: [
                        Math.max(0, x1 - padX),
                        Math.max(0, y1 - padY),
                    ] as [number, number],
                    bottomRight: [
                        Math.min(imgEl.naturalWidth, x2 + padX),
                        Math.min(imgEl.naturalHeight, y2 + padY),
                    ] as [number, number],
                    probability: f.probability,
                    selected: true,
                };
            });

            setFaces(detected);
            setStatus((s) => ({ ...s, isDetecting: false }));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Face detection failed';
            setStatus((s) => ({ ...s, isDetecting: false, error: msg }));
        }
    }, []);

    // Draw on canvas whenever relevant state changes
    useEffect(() => {
        const canvas = canvasRef.current;
        const imgEl = imageElRef.current;
        if (!canvas || !imgEl || !imageDimensions) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const activeFaces: FaceRegion[] = faces
            .filter((f) => applyTo === 'all' || f.selected)
            .map((f) => ({
                x: f.topLeft[0],
                y: f.topLeft[1],
                width: f.bottomRight[0] - f.topLeft[0],
                height: f.bottomRight[1] - f.topLeft[1],
            }));

        applyAnonymization(
            ctx,
            imgEl,
            activeFaces,
            mode,
            intensity,
            imageDimensions.width,
            imageDimensions.height,
        );
    }, [faces, mode, applyTo, intensity, imageDimensions]);

    const handleImageUpload = useCallback(
        async (file: File) => {
            // Cleanup previous URL
            if (imageUrl) URL.revokeObjectURL(imageUrl);

            const url = URL.createObjectURL(file);
            setImageFile(file);
            setImageUrl(url);
            setFaces([]);

            // Load image and compute display dimensions
            const img = new Image();
            img.src = url;
            await new Promise<void>((resolve) => {
                img.onload = () => resolve();
            });
            imageElRef.current = img;

            // Scale to fit within display constraints
            const ratio = Math.min(
                MAX_DISPLAY_WIDTH / img.naturalWidth,
                MAX_DISPLAY_HEIGHT / img.naturalHeight,
                1,
            );
            const displayW = Math.round(img.naturalWidth * ratio);
            const displayH = Math.round(img.naturalHeight * ratio);
            setImageDimensions({ width: displayW, height: displayH });
            setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });

            // Run detection once model is ready
            if (status.modelReady) {
                await runDetection(img);
            } else {
                // Wait for model then detect
                const waitAndDetect = async () => {
                    await loadBlazeFace();
                    await runDetection(img);
                };
                waitAndDetect().catch((err: unknown) => {
                    const msg = err instanceof Error ? err.message : 'Detection failed';
                    setStatus((s) => ({ ...s, error: msg }));
                });
            }
        },
        [imageUrl, runDetection, status.modelReady],
    );

    const toggleFaceSelection = useCallback((id: string) => {
        setFaces((prev) => prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)));
    }, []);

    const handleModeChange = useCallback(
        (newMode: AnonymizationMode) => {
            setMode(newMode);
            setIntensity(newMode === 'blur' ? DEFAULT_BLUR_INTENSITY : DEFAULT_PIXELATE_INTENSITY);
        },
        [],
    );

    const handleDownload = useCallback(async () => {
        const imgEl = imageElRef.current;
        if (!imgEl || !imageFile) return;

        const activeFaces: FaceRegion[] = faces
            .filter((f) => applyTo === 'all' || f.selected)
            .map((f) => ({
                x: f.topLeft[0],
                y: f.topLeft[1],
                width: f.bottomRight[0] - f.topLeft[0],
                height: f.bottomRight[1] - f.topLeft[1],
            }));

        try {
            const blob = await renderToBlob(imgEl, activeFaces, mode, intensity);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const baseName = imageFile.name.replace(/\.[^/.]+$/, '');
            link.download = `${baseName}-anonymized.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    }, [faces, applyTo, mode, intensity, imageFile]);

    const reset = useCallback(() => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageFile(null);
        setImageUrl(null);
        setImageDimensions(null);
        setNaturalDimensions(null);
        setFaces([]);
        imageElRef.current = null;
    }, [imageUrl]);

    return {
        imageFile,
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
        handleModeChange,
        setApplyTo,
        setIntensity,
        handleDownload,
        reset,
    };
}
