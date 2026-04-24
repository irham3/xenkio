export type RecorderStatus = 'idle' | 'recording' | 'paused' | 'stopped'

export type AudioFormat = 'webm' | 'mp4'

export interface RecorderSettings {
    format: AudioFormat
}

export interface RecorderResult {
    url: string
    blob: Blob
    size: number
    duration: number
    fileName: string
    format: string
}

export const DEFAULT_SETTINGS: RecorderSettings = {
    format: 'webm',
}
