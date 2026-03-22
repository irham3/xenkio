export type ScrollDirection = 'left' | 'right';
export type StrobeMode = 'off' | 'ambulance' | 'police' | 'warning' | 'custom';
export type BlinkMode = 'off' | 'slow' | 'medium' | 'fast';
export type FontFamily = 'sans' | 'mono' | 'serif' | 'impact';
export type BackgroundMode = 'solid' | 'split';

export interface RunningTextConfig {
    text: string;
    direction: ScrollDirection;
    speed: number; // 1–10 (1 = slowest, 10 = fastest)
    fontSize: number; // px
    fontWeight: 'normal' | 'bold';
    fontFamily: FontFamily;
    textColor: string;
    // Solid background
    backgroundColor: string;
    strobeMode: StrobeMode;
    strobeSpeed: number; // ms per flash cycle
    strobeColor1: string;
    strobeColor2: string;
    // Split background
    backgroundMode: BackgroundMode;
    splitColorLeft: string;
    splitColorRight: string;
    splitSwap: boolean;       // alternate/swap the two halves
    splitSwapSpeed: number;   // ms per swap cycle
    blinkMode: BlinkMode;
    separator: string; // text between repetitions
}
