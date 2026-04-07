import type { UpscalePhase } from './lib/upscale-engine'

export type ScaleFactor = 2 | 4

export type UpscaleStatus = 'idle' | 'loading-model' | 'processing' | 'done' | 'error'

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
    progress: number
    phase: UpscalePhase | null
}
