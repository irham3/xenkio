import type { TimeInput, TimeDifference, TimeAddSubtractResult, TimeUnit, TimeOperation } from '../types';

export function timeToSeconds(t: TimeInput): number {
    return t.hours * 3600 + t.minutes * 60 + t.seconds;
}

export function secondsToTime(totalSeconds: number): TimeInput {
    const abs = Math.abs(totalSeconds);
    return {
        hours: Math.floor(abs / 3600),
        minutes: Math.floor((abs % 3600) / 60),
        seconds: abs % 60,
    };
}

export function pad(n: number): string {
    return String(n).padStart(2, '0');
}

export function formatTime(t: TimeInput): string {
    return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
}

export function parseTimeInput(value: string): TimeInput | null {
    const parts = value.split(':').map(Number);
    if (parts.length < 2 || parts.length > 3) return null;
    if (parts.some((p) => Number.isNaN(p) || p < 0)) return null;

    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const seconds = parts.length === 3 ? parts[2] : 0;

    if (minutes >= 60 || seconds >= 60) return null;

    return { hours, minutes, seconds };
}

export function calculateTimeDifference(start: TimeInput, end: TimeInput): TimeDifference {
    const startSec = timeToSeconds(start);
    const endSec = timeToSeconds(end);
    const diff = endSec - startSec;
    const isNegative = diff < 0;
    const time = secondsToTime(diff);

    return {
        ...time,
        totalSeconds: Math.abs(diff),
        totalMinutes: +(Math.abs(diff) / 60).toFixed(2),
        totalHours: +(Math.abs(diff) / 3600).toFixed(4),
        isNegative,
        formatted: `${isNegative ? '-' : ''}${formatTime(time)}`,
    };
}

export function addSubtractTime(
    base: TimeInput,
    amount: number,
    unit: TimeUnit,
    operation: TimeOperation
): TimeAddSubtractResult {
    let addSeconds = 0;
    if (unit === 'hours') addSeconds = amount * 3600;
    else if (unit === 'minutes') addSeconds = amount * 60;
    else addSeconds = amount;

    const baseSec = timeToSeconds(base);
    const resultSec = operation === 'add' ? baseSec + addSeconds : baseSec - addSeconds;
    const wrappedDays = Math.floor(Math.abs(resultSec) / 86400);
    const normalizedSec = ((resultSec % 86400) + 86400) % 86400;
    const result = secondsToTime(normalizedSec);

    return {
        result,
        formatted: formatTime(result),
        wrappedDays,
    };
}

export function formatNumber(n: number): string {
    return n.toLocaleString();
}
