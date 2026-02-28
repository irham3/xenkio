export interface AgeResult {
    years: number;
    months: number;
    days: number;
}

export interface AgeDetails {
    age: AgeResult;
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
    totalSeconds: number;
    nextBirthday: Date;
    daysUntilBirthday: number;
    dayOfBirth: string;
    birthstone: string;
    season: string;
    leapYearBorn: boolean;
}

export type AgeUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes';
