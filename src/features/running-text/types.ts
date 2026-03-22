export type ScrollDirection = 'left' | 'right';
export type StrobeMode = 'off' | 'ambulance' | 'police' | 'warning' | 'custom';
export type BlinkMode = 'off' | 'slow' | 'medium' | 'fast';
export type FontFamily = 'sans' | 'mono' | 'serif' | 'impact';

export interface RunningTextConfig {
    text: string;
    direction: ScrollDirection;
    speed: number; // 1–10 (1 = slowest, 10 = fastest)
    fontSize: number; // px
    fontWeight: 'normal' | 'bold';
    fontFamily: FontFamily;
    textColor: string;
    backgroundColor: string;
    strobeMode: StrobeMode;
    strobeSpeed: number; // ms per flash cycle
    strobeColor1: string;
    strobeColor2: string;
    blinkMode: BlinkMode;
    separator: string; // text between repetitions
}
