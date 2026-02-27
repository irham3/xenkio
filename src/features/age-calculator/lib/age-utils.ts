import type { AgeResult, AgeDetails } from '../types';

const BIRTHSTONES: Record<number, string> = {
    1: 'Garnet',
    2: 'Amethyst',
    3: 'Aquamarine',
    4: 'Diamond',
    5: 'Emerald',
    6: 'Alexandrite',
    7: 'Ruby',
    8: 'Peridot',
    9: 'Sapphire',
    10: 'Opal',
    11: 'Topaz',
    12: 'Tanzanite',
};

const SEASONS: Record<number, string> = {
    1: 'Winter',
    2: 'Winter',
    3: 'Spring',
    4: 'Spring',
    5: 'Spring',
    6: 'Summer',
    7: 'Summer',
    8: 'Summer',
    9: 'Autumn',
    10: 'Autumn',
    11: 'Autumn',
    12: 'Winter',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function calculateAge(birthDate: Date, referenceDate: Date): AgeResult {
    let years = referenceDate.getFullYear() - birthDate.getFullYear();
    let months = referenceDate.getMonth() - birthDate.getMonth();
    let days = referenceDate.getDate() - birthDate.getDate();

    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return { years, months, days };
}

export function calculateTotalDays(birthDate: Date, referenceDate: Date): number {
    const diffTime = referenceDate.getTime() - birthDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getNextBirthday(birthDate: Date, referenceDate: Date): Date {
    const thisYearBirthday = new Date(
        referenceDate.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
    );

    if (thisYearBirthday > referenceDate) {
        return thisYearBirthday;
    }

    return new Date(
        referenceDate.getFullYear() + 1,
        birthDate.getMonth(),
        birthDate.getDate()
    );
}

export function calculateAgeDetails(birthDate: Date, referenceDate: Date): AgeDetails {
    const age = calculateAge(birthDate, referenceDate);
    const totalDays = calculateTotalDays(birthDate, referenceDate);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = age.years * 12 + age.months;
    const totalSeconds = totalDays * 86400;

    const nextBirthday = getNextBirthday(birthDate, referenceDate);
    const daysUntilBirthday = calculateTotalDays(referenceDate, nextBirthday);

    const dayOfBirth = DAY_NAMES[birthDate.getDay()];
    const birthMonth = birthDate.getMonth() + 1;
    const birthstone = BIRTHSTONES[birthMonth] || 'Unknown';
    const season = SEASONS[birthMonth] || 'Unknown';
    const leapYearBorn = isLeapYear(birthDate.getFullYear());

    return {
        age,
        totalDays,
        totalWeeks,
        totalMonths,
        totalSeconds,
        nextBirthday,
        daysUntilBirthday,
        dayOfBirth,
        birthstone,
        season,
        leapYearBorn,
    };
}

export function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function isValidBirthDate(date: Date): boolean {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    if (date > now) return false;

    const minDate = new Date(1900, 0, 1);
    if (date < minDate) return false;

    return true;
}

export function parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return null;
    return date;
}
