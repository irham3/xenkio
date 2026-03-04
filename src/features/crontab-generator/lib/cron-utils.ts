import { CronConfig, CronField, CronFieldMeta, CronPreset } from '../types';

export const CRON_FIELD_META: Record<string, CronFieldMeta> = {
    minute: { name: 'minute', label: 'Minute', min: 0, max: 59 },
    hour: { name: 'hour', label: 'Hour', min: 0, max: 23 },
    dayOfMonth: { name: 'dayOfMonth', label: 'Day of Month', min: 1, max: 31 },
    month: {
        name: 'month',
        label: 'Month',
        min: 1,
        max: 12,
        displayLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    dayOfWeek: {
        name: 'dayOfWeek',
        label: 'Day of Week',
        min: 0,
        max: 6,
        displayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
};

export const CRON_PRESETS: CronPreset[] = [
    { label: 'Every Minute', expression: '* * * * *', description: 'Runs every minute' },
    { label: 'Every 5 Minutes', expression: '*/5 * * * *', description: 'Runs every 5 minutes' },
    { label: 'Every 15 Minutes', expression: '*/15 * * * *', description: 'Runs every 15 minutes' },
    { label: 'Every 30 Minutes', expression: '*/30 * * * *', description: 'Runs every 30 minutes' },
    { label: 'Every Hour', expression: '0 * * * *', description: 'Runs at the start of every hour' },
    { label: 'Every 6 Hours', expression: '0 */6 * * *', description: 'Runs every 6 hours' },
    { label: 'Every 12 Hours', expression: '0 */12 * * *', description: 'Runs every 12 hours' },
    { label: 'Daily at Midnight', expression: '0 0 * * *', description: 'Runs daily at 00:00' },
    { label: 'Daily at Noon', expression: '0 12 * * *', description: 'Runs daily at 12:00' },
    { label: 'Weekly (Sunday)', expression: '0 0 * * 0', description: 'Runs every Sunday at midnight' },
    { label: 'Weekly (Monday)', expression: '0 0 * * 1', description: 'Runs every Monday at midnight' },
    { label: 'Monthly', expression: '0 0 1 * *', description: 'Runs on the 1st of every month at midnight' },
    { label: 'Yearly', expression: '0 0 1 1 *', description: 'Runs on January 1st at midnight' },
    { label: 'Weekdays Only', expression: '0 9 * * 1-5', description: 'Runs at 9:00 AM on weekdays' },
    { label: 'Weekends Only', expression: '0 10 * * 0,6', description: 'Runs at 10:00 AM on weekends' },
];

export function getDefaultConfig(): CronConfig {
    return {
        minute: { type: 'every', values: [] },
        hour: { type: 'every', values: [] },
        dayOfMonth: { type: 'every', values: [] },
        month: { type: 'every', values: [] },
        dayOfWeek: { type: 'every', values: [] },
    };
}

export function cronFieldToString(field: CronField, meta: CronFieldMeta): string {
    switch (field.type) {
        case 'every':
            return '*';
        case 'specific':
            if (field.values.length === 0) return '*';
            return field.values.sort((a, b) => a - b).join(',');
        case 'range':
            return `${field.rangeStart ?? meta.min}-${field.rangeEnd ?? meta.max}`;
        case 'step':
            return `*/${field.stepValue ?? 1}`;
        default:
            return '*';
    }
}

export function configToExpression(config: CronConfig): string {
    const parts = [
        cronFieldToString(config.minute, CRON_FIELD_META.minute),
        cronFieldToString(config.hour, CRON_FIELD_META.hour),
        cronFieldToString(config.dayOfMonth, CRON_FIELD_META.dayOfMonth),
        cronFieldToString(config.month, CRON_FIELD_META.month),
        cronFieldToString(config.dayOfWeek, CRON_FIELD_META.dayOfWeek),
    ];
    return parts.join(' ');
}

function parseFieldToken(token: string, meta: CronFieldMeta): CronField {
    if (token === '*') {
        return { type: 'every', values: [] };
    }

    if (token.startsWith('*/')) {
        const step = parseInt(token.slice(2), 10);
        if (!isNaN(step) && step >= 1) {
            return { type: 'step', values: [], stepValue: step };
        }
    }

    if (token.includes('-') && !token.includes(',')) {
        const [startStr, endStr] = token.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start >= meta.min && end <= meta.max) {
            return { type: 'range', values: [], rangeStart: start, rangeEnd: end };
        }
    }

    if (token.includes(',') || /^\d+$/.test(token)) {
        const values = token.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
        if (values.length > 0) {
            return { type: 'specific', values };
        }
    }

    return { type: 'every', values: [] };
}

export function expressionToConfig(expression: string): CronConfig | null {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return null;

    const fields: (keyof CronConfig)[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
    const config = getDefaultConfig();

    for (let i = 0; i < 5; i++) {
        config[fields[i]] = parseFieldToken(parts[i], CRON_FIELD_META[fields[i]]);
    }

    return config;
}

export function isValidCronExpression(expression: string): boolean {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return false;

    const fieldKeys: (keyof typeof CRON_FIELD_META)[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

    for (let i = 0; i < 5; i++) {
        const part = parts[i];
        const meta = CRON_FIELD_META[fieldKeys[i]];

        if (part === '*') continue;

        if (part.startsWith('*/')) {
            const step = parseInt(part.slice(2), 10);
            if (isNaN(step) || step < 1 || step > meta.max) return false;
            continue;
        }

        const segments = part.split(',');
        for (const segment of segments) {
            if (segment.includes('-')) {
                const [startStr, endStr] = segment.split('-');
                const start = parseInt(startStr, 10);
                const end = parseInt(endStr, 10);
                if (isNaN(start) || isNaN(end) || start < meta.min || end > meta.max || start > end) {
                    return false;
                }
            } else {
                const val = parseInt(segment, 10);
                if (isNaN(val) || val < meta.min || val > meta.max) return false;
            }
        }
    }

    return true;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function describeField(part: string, fieldName: string): string {
    if (part === '*') return '';

    if (part.startsWith('*/')) {
        const step = part.slice(2);
        return `every ${step} ${fieldName}${parseInt(step) > 1 ? 's' : ''}`;
    }

    if (part.includes('-')) {
        const [start, end] = part.split('-');
        if (fieldName === 'month') {
            return `from ${MONTH_NAMES[parseInt(start) - 1]} through ${MONTH_NAMES[parseInt(end) - 1]}`;
        }
        if (fieldName === 'day of week') {
            return `from ${DAY_NAMES[parseInt(start)]} through ${DAY_NAMES[parseInt(end)]}`;
        }
        return `from ${start} through ${end}`;
    }

    if (part.includes(',')) {
        const values = part.split(',');
        if (fieldName === 'month') {
            return `in ${values.map(v => MONTH_NAMES[parseInt(v) - 1]).join(', ')}`;
        }
        if (fieldName === 'day of week') {
            return `on ${values.map(v => DAY_NAMES[parseInt(v)]).join(', ')}`;
        }
        return `at ${fieldName} ${values.join(', ')}`;
    }

    const val = parseInt(part);
    if (fieldName === 'month') return `in ${MONTH_NAMES[val - 1]}`;
    if (fieldName === 'day of week') return `on ${DAY_NAMES[val]}`;

    return '';
}

export function cronToHumanReadable(expression: string): string {
    if (!expression.trim()) return 'Enter a cron expression';

    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return 'Invalid cron expression (expected 5 fields)';

    if (!isValidCronExpression(expression)) return 'Invalid cron expression';

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Common patterns
    if (expression === '* * * * *') return 'Every minute';
    if (expression === '0 * * * *') return 'Every hour, at minute 0';
    if (expression === '0 0 * * *') return 'Every day at midnight (00:00)';
    if (expression === '0 12 * * *') return 'Every day at noon (12:00)';
    if (expression === '0 0 1 * *') return 'At midnight on the 1st of every month';
    if (expression === '0 0 1 1 *') return 'At midnight on January 1st (yearly)';

    const descriptions: string[] = [];

    // Time description
    if (minute === '*' && hour === '*') {
        descriptions.push('Every minute');
    } else if (minute.startsWith('*/')) {
        descriptions.push(`Every ${minute.slice(2)} minutes`);
    } else if (hour === '*' && /^\d+$/.test(minute)) {
        descriptions.push(`At minute ${minute} of every hour`);
    } else if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
        const h = parseInt(hour);
        const m = parseInt(minute);
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        descriptions.push(`At ${displayHour}:${m.toString().padStart(2, '0')} ${period}`);
    } else if (/^\d+$/.test(minute) && hour.startsWith('*/')) {
        descriptions.push(`At minute ${minute}, every ${hour.slice(2)} hours`);
    } else {
        const minuteDesc = describeField(minute, 'minute');
        const hourDesc = describeField(hour, 'hour');
        if (minuteDesc) descriptions.push(minuteDesc);
        if (hourDesc) descriptions.push(hourDesc);
    }

    // Day of month
    if (dayOfMonth !== '*') {
        if (/^\d+$/.test(dayOfMonth)) {
            const d = parseInt(dayOfMonth);
            const suffix = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';
            descriptions.push(`on the ${d}${suffix}`);
        } else {
            const desc = describeField(dayOfMonth, 'day of month');
            if (desc) descriptions.push(desc);
        }
    }

    // Month
    if (month !== '*') {
        const desc = describeField(month, 'month');
        if (desc) descriptions.push(desc);
    }

    // Day of week
    if (dayOfWeek !== '*') {
        const desc = describeField(dayOfWeek, 'day of week');
        if (desc) descriptions.push(desc);
    }

    if (descriptions.length === 0) return 'Every minute';

    return descriptions.join(', ');
}

export function getNextExecutions(expression: string, count: number = 5): Date[] {
    if (!isValidCronExpression(expression)) return [];

    const parts = expression.trim().split(/\s+/);
    const [minutePart, hourPart, dayOfMonthPart, monthPart, dayOfWeekPart] = parts;

    const results: Date[] = [];
    const now = new Date();
    const candidate = new Date(now);
    candidate.setSeconds(0, 0);
    candidate.setMinutes(candidate.getMinutes() + 1);

    const MINUTES_IN_YEAR = 525960; // ~365.25 days × 24 hours × 60 minutes
    const maxIterations = MINUTES_IN_YEAR;

    for (let i = 0; i < maxIterations && results.length < count; i++) {
        if (matchesCronField(candidate.getMonth() + 1, monthPart) &&
            matchesCronField(candidate.getDate(), dayOfMonthPart) &&
            matchesCronField(candidate.getDay(), dayOfWeekPart) &&
            matchesCronField(candidate.getHours(), hourPart) &&
            matchesCronField(candidate.getMinutes(), minutePart)) {
            results.push(new Date(candidate));
        }
        candidate.setMinutes(candidate.getMinutes() + 1);
    }

    return results;
}

function matchesCronField(value: number, fieldPart: string): boolean {
    if (fieldPart === '*') return true;

    if (fieldPart.startsWith('*/')) {
        const step = parseInt(fieldPart.slice(2), 10);
        return value % step === 0;
    }

    const segments = fieldPart.split(',');
    for (const segment of segments) {
        if (segment.includes('-')) {
            const [start, end] = segment.split('-').map(Number);
            if (value >= start && value <= end) return true;
        } else {
            if (value === parseInt(segment, 10)) return true;
        }
    }

    return false;
}
