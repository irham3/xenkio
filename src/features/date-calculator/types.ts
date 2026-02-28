export type DateCalculatorMode = 'difference' | 'add-subtract';

export interface DateDifference {
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
    totalHours: number;
    totalMinutes: number;
    totalSeconds: number;
    weekdaysOnly: number;
    weekendsOnly: number;
}

export type DateUnit = 'days' | 'weeks' | 'months' | 'years';

export type DateOperation = 'add' | 'subtract';

export interface DateAddSubtractInput {
    startDate: string;
    amount: number;
    unit: DateUnit;
    operation: DateOperation;
}

export interface DateAddSubtractResult {
    resultDate: Date;
    dayOfWeek: string;
    formattedDate: string;
    isLeapYear: boolean;
    daysInMonth: number;
    weekNumber: number;
    dayOfYear: number;
}
