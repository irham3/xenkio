import { useState, useCallback, useEffect, useRef } from 'react';
import { ProcessedImage, ModelStatus } from '../types';
import { applyMask } from '../lib/mask-applier';

export function useBackgroundRemover() {
    const [images, setImages] = useState<ProcessedImage[]>([]);
    const [modelStatus, setModelStatus] = useState<ModelStatus>({
        isLoading: false,
        isReady: false,
        progress: 0,
        error: null,
    });

    const workerRef = useRef<Worker | null>(null);
    const imagesRef = useRef<ProcessedImage[]>([]);

    // Sync ref
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    // Handle worker messages
    const handleWorkerMessage = useCallback(async (event: MessageEvent) => {
        const { type, data } = event.data;

        if (type === 'ready') {
            setModelStatus(prev => ({
                ...prev,
                isLoading: false,
                isReady: true,
                progress: 100,
                error: null
            }));
        } else if (type === 'progress') {
            if (data.status === 'progress' && data.total) {
                const pct = Math.round((data.loaded / data.total) * 100);
                setModelStatus(prev => ({
                    ...prev,
                    isLoading: true,
                    progress: pct,
                    error: null
                }));
            } else if (data.status === 'initiate') {
                setModelStatus(prev => ({ ...prev, isLoading: true, error: null }));
            }
        } else if (type === 'error') {
            setModelStatus(prev => ({
                ...prev,
                isLoading: false,
                error: data
            }));
        } else if (type === 'complete') {
            const { id, maskBlob } = data;

            const image = imagesRef.current.find(img => img.id === id);
            if (!image) return;

            try {
                // Apply mask on main thread
                const resultBlob = await applyMask(image.originalUrl, maskBlob);
                const resultUrl = URL.createObjectURL(resultBlob);

                setImages(prev => prev.map(img =>
                    img.id === id
                        ? { ...img, status: 'done', resultBlob, resultUrl }
                        : img
                ));
            } catch (err) {
                console.error('Failed to apply mask:', err);
                setImages(prev => prev.map(img =>
                    img.id === id
                        ? { ...img, status: 'error', error: 'Failed to generate image' }
                        : img
                ));
            }
        }
    }, []);

    // Initialize worker
    useEffect(() => {
        // Create worker
        const worker = new Worker(new URL('../lib/bg-remover.worker.ts', import.meta.url), {
            type: 'module'
        });

        worker.onmessage = handleWorkerMessage;
        workerRef.current = worker;

        return () => {
            worker.terminate();
        };
    }, [handleWorkerMessage]);

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            imagesRef.current.forEach(img => {
                URL.revokeObjectURL(img.originalUrl);
                if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
            });
        };
    }, []);

    const initModel = useCallback(() => {
        if (modelStatus.isReady || modelStatus.isLoading) return;

        setModelStatus(prev => ({ ...prev, isLoading: true, progress: 0, error: null }));
        workerRef.current?.postMessage({ type: 'init' });
    }, [modelStatus.isReady, modelStatus.isLoading]);

    const addImages = useCallback((files: File[]) => {
        const newImages: ProcessedImage[] = files.map((file) => ({
            id: crypto.randomUUID(),
            originalFile: file,
            originalUrl: URL.createObjectURL(file), // Create object URL for worker & preview
            resultUrl: null,
            resultBlob: null,
            status: 'idle',
        }));
        setImages((prev) => [...prev, ...newImages]);
    }, []);

    const processImage = useCallback((imageId: string) => {
        const image = imagesRef.current.find(img => img.id === imageId);
        if (!image) return;

        setImages(prev => prev.map(img =>
            img.id === imageId ? { ...img, status: 'processing', error: undefined } : img
        ));

        workerRef.current?.postMessage({
            type: 'process',
            data: {
                id: image.id,
                imageUrl: image.originalUrl
            }
        });
    }, []);

    const processAll = useCallback(() => {
        const pending = imagesRef.current.filter(
            (img) => img.status === 'idle' || img.status === 'error'
        );
        pending.forEach(img => processImage(img.id));
    }, [processImage]);

    const removeImage = useCallback((imageId: string) => {
        setImages((prev) => {
            const removed = prev.find((img) => img.id === imageId);
            if (removed) {
                URL.revokeObjectURL(removed.originalUrl);
                if (removed.resultUrl) URL.revokeObjectURL(removed.resultUrl);
            }
            return prev.filter((img) => img.id !== imageId);
        });
    }, []);

    const reset = useCallback(() => {
        imagesRef.current.forEach((img) => {
            URL.revokeObjectURL(img.originalUrl);
            if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
        });
        setImages([]);
    }, []);

    const downloadResult = useCallback((image: ProcessedImage) => {
        if (!image.resultBlob) return;
        const url = URL.createObjectURL(image.resultBlob);
        const link = document.createElement('a');
        link.href = url;
        const baseName = image.originalFile.name.replace(/\.[^/.]+$/, '');
        link.download = `${baseName}-removed-bg.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    return {
        images,
        modelStatus,
        initModel,
        addImages,
        processImage,
        processAll,
        removeImage,
        reset,
        downloadResult
    };
}
