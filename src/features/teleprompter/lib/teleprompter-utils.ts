import { SegmentType } from '../types';

export const FONT_FAMILIES: Record<string, string> = {
    sans: 'ui-sans-serif, system-ui, sans-serif',
    serif: 'ui-serif, Georgia, serif',
    mono: 'ui-monospace, "Cascadia Code", monospace',
};

export function splitIntoSegments(script: string, segmentType: SegmentType): string[] {
    if (!script.trim()) return [];

    switch (segmentType) {
        case 'paragraph':
            return script
                .split(/\n\s*\n/)
                .map((s) => s.trim())
                .filter(Boolean);
        case 'sentence':
            return script
                .split(/(?<=[.!?])\s+/)
                .map((s) => s.trim())
                .filter(Boolean);
        case 'line':
            return script
                .split(/\n/)
                .map((s) => s.trim())
                .filter(Boolean);
        default:
            return [script];
    }
}
