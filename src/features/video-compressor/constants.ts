import { CompressionSettings } from './types'

export const DEFAULT_SETTINGS: CompressionSettings = {
    crf: 28,
    preset: 'medium',
    resolution: 'original',
}

export const QUALITY_PRESETS = [
    { label: 'High Quality', description: 'Minimal compression, best visual quality', crf: 23 },
    { label: 'Balanced', description: 'Good quality with reasonable file size', crf: 28 },
    { label: 'Small File', description: 'Maximum compression, smaller file', crf: 35 },
] as const

export const RESOLUTION_OPTIONS = [
    { label: 'Original', value: 'original' },
    { label: '1080p (Full HD)', value: '1080' },
    { label: '720p (HD)', value: '720' },
    { label: '480p (SD)', value: '480' },
    { label: '360p', value: '360' },
] as const
