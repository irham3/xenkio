import type { DateDifference, DateAddSubtractResult } from '../types';

const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export function parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return null;
    return date;
}

export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function countWeekdays(startDate: Date, endDate: Date): number {
    const start = startDate < endDate ? startDate : endDate;
    const end = startDate < endDate ? endDate : startDate;
    let count = 0;
    const current = new Date(start);
    current.setDate(current.getDate() + 1);

    while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}

function countWeekends(startDate: Date, endDate: Date): number {
    const start = startDate < endDate ? startDate : endDate;
    const end = startDate < endDate ? endDate : startDate;
    let count = 0;
    const current = new Date(start);
    current.setDate(current.getDate() + 1);

    while (current <= end) {
        const day = current.getDay();
        if (day === 0 || day === 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}

export function calculateDateDifference(
    date1: Date,
    date2: Date
): DateDifference {
    const startDate = date1 < date2 ? date1 : date2;
    const endDate = date1 < date2 ? date2 : date1;

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    const weekdaysOnly = countWeekdays(startDate, endDate);
    const weekendsOnly = countWeekends(startDate, endDate);

    return {
        years,
        months,
        days,
        totalDays,
        totalWeeks,
        totalMonths,
        totalHours,
        totalMinutes,
        totalSeconds,
        weekdaysOnly,
        weekendsOnly,
    };
}

export function addToDate(
    date: Date,
    amount: number,
    unit: 'days' | 'weeks' | 'months' | 'years'
): Date {
    const result = new Date(date);
    switch (unit) {
        case 'days':
            result.setDate(result.getDate() + amount);
            break;
        case 'weeks':
            result.setDate(result.getDate() + amount * 7);
            break;
        case 'months':
            result.setMonth(result.getMonth() + amount);
            break;
        case 'years':
            result.setFullYear(result.getFullYear() + amount);
            break;
    }
    return result;
}

export function subtractFromDate(
    date: Date,
    amount: number,
    unit: 'days' | 'weeks' | 'months' | 'years'
): Date {
    return addToDate(date, -amount, unit);
}

export function getDateAddSubtractResult(date: Date): DateAddSubtractResult {
    return {
        resultDate: date,
        dayOfWeek: DAY_NAMES[date.getDay()],
        formattedDate: formatDateLong(date),
        isLeapYear: isLeapYear(date.getFullYear()),
        daysInMonth: getDaysInMonth(date.getFullYear(), date.getMonth()),
        weekNumber: getWeekNumber(date),
        dayOfYear: getDayOfYear(date),
    };
}

export function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}

export function formatDateLong(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateShort(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
