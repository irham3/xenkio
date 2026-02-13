
import { useState, useCallback } from 'react';
import { ImageToBase64Result } from '../types';
import { fileToDataUrl, getRawBase64, getImageDimensions } from '../lib/base64-utils';

export function useImageToBase64() {
    const [result, setResult] = useState<ImageToBase64Result | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const convertImage = useCallback(async (file: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            const dataUrl = await fileToDataUrl(file);
            const dimensions = await getImageDimensions(dataUrl).catch(() => undefined);

            setResult({
                base64: getRawBase64(dataUrl),
                dataUrl,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                dimensions
            });
        } catch (err) {
            console.error('Error converting image to base64:', err);
            setError('Failed to convert image. Please try again with a valid image file.');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return {
        result,
        isProcessing,
        error,
        convertImage,
        clear
    };
}
