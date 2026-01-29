import { useState, useCallback, useRef, useEffect } from 'react';
import { type PixelCrop } from 'react-image-crop';
import { ResizeConfig, ImageState, DEFAULT_RESIZE_CONFIG } from '../types';
import { canvasPreview } from '../utils/canvas-preview';
import { useDebounceEffect } from './use-debounce-effect';

// We'll implement canvasPreview separately in utils

export function useImageResizer() {
    const [imageState, setImageState] = useState<ImageState>({
        src: null,
        originalWidth: 0,
        originalHeight: 0,
        file: null,
        rotation: 0,
    });

    const [config, setConfig] = useState<ResizeConfig>(DEFAULT_RESIZE_CONFIG);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const imgRef = useRef<HTMLImageElement | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleFileSelect = useCallback((file: File) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const img = new Image();
            img.src = reader.result?.toString() || '';
            img.onload = () => {
                setImageState({
                    src: reader.result?.toString() || null,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    file,
                    rotation: 0,
                });
                setConfig({
                    ...DEFAULT_RESIZE_CONFIG,
                    width: img.width,
                    height: img.height,
                });
            };
        });
        reader.readAsDataURL(file);
    }, []);

    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [crop, setCrop] = useState<import('react-image-crop').Crop>();

    const updateConfig = useCallback((updates: Partial<ResizeConfig>) => {
        setConfig(prev => {
            const next = { ...prev, ...updates };

            // Only auto-calculate if NOT cropping (cropping defines its own aspect ratio)
            // But if we resize the RESULT of the crop, we might want to maintain that new AR.
            // For now, let's keep simple resize logic relative to original if no crop, 
            // or relative to crop if crop exists.

            if (prev.maintainAspectRatio && (updates.width || updates.height)) {
                // If we have a crop, use crop aspect ratio, otherwise image aspect ratio
                const w = completedCrop ? completedCrop.width : imageState.originalWidth;
                const h = completedCrop ? completedCrop.height : imageState.originalHeight;
                const ratio = w / h;

                if (updates.width) {
                    next.height = Math.round(updates.width / ratio);
                } else if (updates.height) {
                    next.width = Math.round(updates.height * ratio);
                }
            }
            return next;
        });
    }, [imageState.originalWidth, imageState.originalHeight, completedCrop]);

    // Generate preview when crop changes
    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use the canvasPreview to generate a preview of the CROP
                // This preview is just for the UI to show "This is what you cropped"
                // usage: generate preview
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    1,
                    0,
                );

                // Also update base config dimensions to match the crop if it's a fresh crop
                setConfig(prev => ({
                    ...prev,
                    width: Math.round(completedCrop.width),
                    height: Math.round(completedCrop.height)
                }));
            }
        },
        100,
        [completedCrop],
    );

    // Function to generate the Final Output Blob for download
    const generateFinalImage = useCallback(async () => {
        if (!imgRef.current) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 1. Determine Source (Cropped area or Full Image)
        const sourceW = completedCrop ? completedCrop.width : imageState.originalWidth;
        const sourceH = completedCrop ? completedCrop.height : imageState.originalHeight;
        const sourceX = completedCrop ? completedCrop.x : 0;
        const sourceY = completedCrop ? completedCrop.y : 0;

        // 2. Determine Destination (Resized Dimensions)
        const destW = config.width || sourceW;
        const destH = config.height || sourceH;

        canvas.width = destW;
        canvas.height = destH;

        // Better quality scaling
        ctx.imageSmoothingQuality = 'high';

        // Draw from source (img) -> crop rect -> dest rect (resize)
        // We need to account for the image's natural size vs displayed size logic
        // The imgRef.current should be the source of truth if we used it for crop

        // Re-using canvasPreview logic might be better but that targets a specific canvas.
        // Let's implement direct draw here.

        // Helper to handle rotation if we added it later.

        ctx.drawImage(
            imgRef.current,
            sourceX, sourceY, sourceW, sourceH, // Source rect
            0, 0, destW, destH // Dest rect
        );

        // 3. Export to Blob
        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob(
                (blob) => resolve(blob),
                `image/${config.format}`,
                config.quality / 100
            );
        });
    }, [config, completedCrop, imageState]);

    // Generate preview when config or crop changes (Live Preview)
    useDebounceEffect(
        async () => {
            // If we are just starting or have no image, skip
            // We also skip if we are strictly just initializing (previewUrl is null)
            // But we want it to generate eventually.
            if (!imageState.src || !imgRef.current) return;

            try {
                const blob = await generateFinalImage();
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(prev => {
                        if (prev) URL.revokeObjectURL(prev);
                        return url;
                    });
                }
            } catch (e) {
                console.error("Failed to generate preview", e);
            }
        },
        500,
        [config, completedCrop, imageState.src]
    );

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            setPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        };
    }, []);

    const reset = useCallback(() => {
        setCrop(undefined);
        setCompletedCrop(undefined);
        setConfig({
            ...DEFAULT_RESIZE_CONFIG,
            width: imageState.originalWidth,
            height: imageState.originalHeight,
        });
    }, [imageState.originalWidth, imageState.originalHeight]);

    return {
        imageState,
        setImageState,
        config,
        setConfig,
        updateConfig,
        handleFileSelect,
        imgRef,
        previewCanvasRef,
        isProcessing,
        crop,
        setCrop,
        completedCrop,
        setCompletedCrop,
        generateFinalImage,
        previewUrl,
        reset // Expose reset
    };
}


