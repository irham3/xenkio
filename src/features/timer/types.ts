export type TimerMode = 'countdown' | 'deadline';

export interface TimerConfig {
    mode: TimerMode;
    duration: number; // in seconds, for countdown mode
    deadline: string; // ISO string or time string, for deadline mode
    label: string;
    autoStart: boolean;
    soundEnabled: boolean;
}

export interface TimerState {
    remainingTime: number; // in seconds
    isActive: boolean;
    isPaused: boolean;
    initialDuration: number;
}
