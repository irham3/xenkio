import type { ScaleFactor } from '../types'

export type UpscalePhase = 'loading-model' | 'processing'
export type ProgressCallback = (amount: number, phase: UpscalePhase) => void

const PATCH_SIZE = 64
const PATCH_PADDING = 2

async function getModelDefinition(scale: ScaleFactor) {
    switch (scale) {
        case 2:
            return (await import('@upscalerjs/esrgan-slim/2x')).default
        case 3:
            return (await import('@upscalerjs/esrgan-slim/3x')).default
        case 4:
            return (await import('@upscalerjs/esrgan-slim/4x')).default
        case 8:
            return (await import('@upscalerjs/esrgan-slim/8x')).default
    }
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
    })
}

function convertToFormat(
    dataUrl: string,
    format: 'image/jpeg' | 'image/png'
): Promise<string> {
    if (format === 'image/png') return Promise.resolve(dataUrl)
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            if (!ctx) { resolve(dataUrl); return }
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/jpeg', 0.95))
        }
        img.src = dataUrl
    })
}

export async function upscaleWithAI(
    file: File,
    scale: ScaleFactor,
    outputFormat: 'image/jpeg' | 'image/png',
    onProgress: ProgressCallback
): Promise<{ dataUrl: string; width: number; height: number }> {
    onProgress(0, 'loading-model')

    // Lazy-load TF.js + Upscaler + model definition in parallel.
    // Next.js code-splits these into separate chunks so they only
    // download when this function is first called.
    const [{ default: Upscaler }, modelDef] = await Promise.all([
        import('upscaler'),
        getModelDefinition(scale),
    ])

    // UpscalerJS automatically fetches model weights from jsDelivr CDN
    // (then falls back to unpkg) using _internals.name/version/path.
    // Nothing is bundled into the app — all weights are cached by the browser.
    const upscaler = new Upscaler({ model: modelDef })

    // Wait for model to finish loading (CDN download + TF.js init)
    await upscaler.ready

    onProgress(0, 'processing')

    const objectUrl = URL.createObjectURL(file)
    const img = await loadImageElement(objectUrl)

    let base64Result: string
    try {
        base64Result = await upscaler.upscale(img, {
            output: 'base64',
            patchSize: PATCH_SIZE,
            padding: PATCH_PADDING,
            progress: (amount: number) => {
                onProgress(amount, 'processing')
            },
        })
    } finally {
        URL.revokeObjectURL(objectUrl)
        await upscaler.dispose()
    }

    // UpscalerJS always outputs PNG base64. Convert to JPEG if needed.
    const finalDataUrl = await convertToFormat(base64Result, outputFormat)

    const resultImg = await loadImageElement(finalDataUrl)
    return {
        dataUrl: finalDataUrl,
        width: resultImg.naturalWidth,
        height: resultImg.naturalHeight,
    }
}
