import type { ScaleFactor } from '../types'

export type UpscalePhase = 'loading-model' | 'processing'
export type ProgressCallback = (amount: number, phase: UpscalePhase) => void

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

function loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
    })
}

let worker: Worker | null = null

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL('./upscale.worker.ts', import.meta.url), { type: 'module' })
    }
    return worker
}

export async function upscaleWithAI(
    file: File,
    scale: ScaleFactor,
    outputFormat: 'image/jpeg' | 'image/png',
    onProgress: ProgressCallback
): Promise<{ dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        onProgress(0, 'loading-model')

        const objectUrl = URL.createObjectURL(file)
        const w = getWorker()

        const handleMessage = async (event: MessageEvent) => {
            const { type, data } = event.data as {
                type: string
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: any
            }

            if (type === 'progress') {
                if (data?.status === 'progress' && data.total) {
                    onProgress(data.loaded / data.total, 'loading-model')
                }
            } else if (type === 'processing') {
                onProgress(0, 'processing')
            } else if (type === 'complete') {
                URL.revokeObjectURL(objectUrl)
                w.removeEventListener('message', handleMessage)
                try {
                    const reader = new FileReader()
                    reader.onload = async () => {
                        const rawDataUrl = reader.result as string
                        const finalDataUrl = await convertToFormat(rawDataUrl, outputFormat)
                        const resultImg = await loadImageElement(finalDataUrl)
                        resolve({
                            dataUrl: finalDataUrl,
                            width: resultImg.naturalWidth,
                            height: resultImg.naturalHeight,
                        })
                    }
                    reader.readAsDataURL(data.blob)
                } catch (err) {
                    reject(err)
                }
            } else if (type === 'error') {
                URL.revokeObjectURL(objectUrl)
                w.removeEventListener('message', handleMessage)
                reject(new Error(data as string))
            }
        }

        w.addEventListener('message', handleMessage)
        w.postMessage({ type: 'upscale', data: { imageDataUrl: objectUrl, scale } })
    })
}

