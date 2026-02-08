export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    pomodorosCompleted: number;
    pomodorosEstimated: number;
    isActive: boolean;
}

export interface PomodoroState {
    mode: TimerMode;
    timeLeft: number;
    isActive: boolean;
    settings: TimerSettings;
    tasks: Task[];
    activeTaskId: string | null;
}
