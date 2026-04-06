export type ScaleFactor = 2 | 3 | 4 | 8

export type UpscaleStatus = 'idle' | 'processing' | 'done' | 'error'

export interface UpscaleState {
    originalFile: File | null
    originalPreview: string | null
    upscaledDataUrl: string | null
    originalWidth: number
    originalHeight: number
    upscaledWidth: number
    upscaledHeight: number
    status: UpscaleStatus
    error: string | null
}
