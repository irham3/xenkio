import type { ScaleFactor } from '../types'

function getModelId(scale: ScaleFactor): string {
    switch (scale) {
        case 2: return 'Xenova/swin2SR-classical-sr-x2-64'
        case 4: return 'Xenova/swin2SR-classical-sr-x4-48'
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let currentPipeline: { scale: ScaleFactor; upscalePipeline: any } | null = null

self.addEventListener('message', async (event: MessageEvent) => {
    const { type, data } = event.data as { type: string; data: { imageDataUrl: string; scale: ScaleFactor } }

    if (type === 'upscale') {
        const { imageDataUrl, scale } = data
        try {
            const { pipeline, env } = await import('@huggingface/transformers')

            env.allowLocalModels = false

            const modelId = getModelId(scale)

            if (!currentPipeline || currentPipeline.scale !== scale) {
                const upscalePipeline = await pipeline('image-to-image', modelId, {
                    dtype: 'q8',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    progress_callback: (progress: any) => {
                        self.postMessage({ type: 'progress', data: progress })
                    },
                })
                currentPipeline = { scale, upscalePipeline }
            }

            self.postMessage({ type: 'processing' })

            const result = await currentPipeline.upscalePipeline(imageDataUrl)
            const blob = await result.toBlob()

            self.postMessage({ type: 'complete', data: { blob } })
        } catch (err) {
            self.postMessage({
                type: 'error',
                data: err instanceof Error ? err.message : 'Upscaling failed',
            })
        }
    }
})
