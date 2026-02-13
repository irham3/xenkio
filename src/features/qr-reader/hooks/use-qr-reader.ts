
import { useState, useCallback } from 'react';
import { QrReaderState } from '../types';
import { INITIAL_STATE, NO_QR_CODE_ERROR } from '../constants';

export function useQrReader() {
    const [state, setState] = useState<QrReaderState>({ ...INITIAL_STATE });

    const decodeImage = useCallback(async (file: File) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null, result: null }));

        const previewUrl = URL.createObjectURL(file);
        setState(prev => ({ ...prev, imagePreview: previewUrl }));

        try {
            const imageBitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            ctx.drawImage(imageBitmap, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const jsQR = (await import('jsqr')).default;
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                setState(prev => ({ ...prev, result: code.data, isProcessing: false }));
            } else {
                setState(prev => ({
                    ...prev,
                    error: NO_QR_CODE_ERROR,
                    isProcessing: false,
                }));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to process image';
            setState(prev => ({ ...prev, error: message, isProcessing: false }));
        }
    }, []);

    const decodeFromDataUrl = useCallback(async (dataUrl: string) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null, result: null, imagePreview: dataUrl }));

        try {
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = dataUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const jsQR = (await import('jsqr')).default;
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                setState(prev => ({ ...prev, result: code.data, isProcessing: false }));
            } else {
                setState(prev => ({
                    ...prev,
                    error: NO_QR_CODE_ERROR,
                    isProcessing: false,
                }));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to process image';
            setState(prev => ({ ...prev, error: message, isProcessing: false }));
        }
    }, []);

    const reset = useCallback(() => {
        if (state.imagePreview && state.imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(state.imagePreview);
        }
        setState({ ...INITIAL_STATE });
    }, [state.imagePreview]);

    return {
        state,
        decodeImage,
        decodeFromDataUrl,
        reset,
    };
}
