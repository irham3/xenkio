import { CompressionSettings } from './types'

export const DEFAULT_SETTINGS: CompressionSettings = {
    ratio: 0.5,
    resolution: 'original',
    audioMode: 'compress',
    audioBitrate: 96,
}

export const QUALITY_PRESETS = [
    {
        label: 'High Quality',
        description: 'Slight reduction, preserves visual quality',
        ratio: 0.7,
        resolution: 'original',
    },
    {
        label: 'Balanced',
        description: 'Good quality with ~50% size reduction',
        ratio: 0.5,
        resolution: 'original',
    },
    {
        label: 'Small File',
        description: 'Maximum compression, visibly lower quality',
        ratio: 0.3,
        resolution: '720',
    },
    {
        label: 'Tiny',
        description: 'Extreme compression for sharing on chat',
        ratio: 0.15,
        resolution: '480',
    },
] as const

export const RESOLUTION_OPTIONS = [
    { label: 'Original', value: 'original' },
    { label: '1080p (Full HD)', value: '1080' },
    { label: '720p (HD)', value: '720' },
    { label: '480p (SD)', value: '480' },
    { label: '360p', value: '360' },
    { label: '240p', value: '240' },
    { label: '144p', value: '144' },
] as const
