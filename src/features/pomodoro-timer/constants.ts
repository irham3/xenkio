import { TimerMode, TimerSettings } from './types';

export const DEFAULT_SETTINGS: TimerSettings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
};

export const TIMER_MODES: Record<TimerMode, { label: string; color: string; duration: number }> = {
    pomodoro: {
        label: 'Pomodoro',
        color: 'text-red-500',
        duration: 25,
    },
    shortBreak: {
        label: 'Short Break',
        color: 'text-teal-500',
        duration: 5,
    },
    longBreak: {
        label: 'Long Break',
        color: 'text-blue-500',
        duration: 15,
    },
};
