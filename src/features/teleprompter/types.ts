export type TeleprompterMode = 'setup' | 'teleprompter' | 'reading';
export type SegmentType = 'paragraph' | 'sentence' | 'line' | 'smart';
export type FontFamily = 'sans' | 'serif' | 'mono';

export interface TeleprompterConfig {
    script: string;
    mode: TeleprompterMode;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontFamily: FontFamily;
    textColor: string;
    backgroundColor: string;
    scrollSpeed: number;
    mirror: boolean;
    segmentType: SegmentType;
    lineSpacing: number;
}

export interface TeleprompterState {
    isPlaying: boolean;
    currentSegmentIndex: number;
    segments: string[];
    isFullscreen: boolean;
    countdown: number | null;
}
