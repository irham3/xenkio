export type TimeCalculatorMode = 'difference' | 'add-subtract';

export type TimeUnit = 'hours' | 'minutes' | 'seconds';

export type TimeOperation = 'add' | 'subtract';

export interface TimeInput {
    hours: number;
    minutes: number;
    seconds: number;
}

export interface TimeDifference {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    totalMinutes: number;
    totalHours: number;
    isNegative: boolean;
    formatted: string;
}

export interface TimeAddSubtractResult {
    result: TimeInput;
    formatted: string;
    wrappedDays: number;
}
