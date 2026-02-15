
// Singleton pipeline instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenter: any = null;

self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    if (type === 'init') {
        try {
            // Dynamically import transformers to avoid build-time WASM bundling issues
            const { pipeline, env } = await import('@huggingface/transformers');

            // Skip local model checks for browser environment
            env.allowLocalModels = false;

            if (!segmenter) {
                segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    progress_callback: (progress: any) => {
                        self.postMessage({
                            type: 'progress',
                            data: progress
                        });
                    }
                });
            }
            self.postMessage({ type: 'ready' });
        } catch (error) {
            self.postMessage({
                type: 'error',
                data: error instanceof Error ? error.message : 'Failed to load model'
            });
        }
    }

    if (type === 'process') {
        try {
            if (!segmenter) {
                throw new Error('Model not initialized');
            }

            const { imageUrl, id } = data;

            // Run inference
            const result = await segmenter(imageUrl);

            // The result contains the mask. We need to send it back.
            // Transformers.js returns a RawImage or similar depending on version.
            // For BriaAI RMBG 1.4, it returns a list of masks.

            const mask = result[0].mask;

            // Convert mask to blob/dataURL to send back
            const blob = await mask.toBlob(); // Transformers.js RawImage has toBlob

            self.postMessage({
                type: 'complete',
                data: {
                    id,
                    maskBlob: blob
                }
            });

        } catch (error) {
            self.postMessage({
                type: 'error',
                data: error instanceof Error ? error.message : 'Processing failed'
            });
        }
    }
});
