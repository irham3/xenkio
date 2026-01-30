import { ConversionResult, TimestampUnit } from '../types';

/**
 * Parse a timestamp string and detect its unit
 */
export function parseTimestamp(input: string): { value: number; unit: TimestampUnit } | null {
  const trimmed = input.trim();
  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    return null;
  }

  const value = parseInt(trimmed, 10);
  
  // Heuristic: if the number is greater than year 3000 in seconds, it's likely milliseconds
  // Year 3000 in seconds ≈ 32503680000
  const unit: TimestampUnit = Math.abs(value) > 32503680000 ? 'milliseconds' : 'seconds';
  
  return { value, unit };
}

/**
 * Convert timestamp to milliseconds
 */
export function toMilliseconds(timestamp: number, unit: TimestampUnit): number {
  return unit === 'seconds' ? timestamp * 1000 : timestamp;
}

/**
 * Convert timestamp to seconds
 */
export function toSeconds(timestamp: number, unit: TimestampUnit): number {
  return unit === 'milliseconds' ? Math.floor(timestamp / 1000) : timestamp;
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let timeString: string;

  if (seconds < 5) {
    return 'just now';
  } else if (seconds < 60) {
    timeString = `${seconds} second${seconds !== 1 ? 's' : ''}`;
  } else if (minutes < 60) {
    timeString = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    timeString = `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days < 7) {
    timeString = `${days} day${days !== 1 ? 's' : ''}`;
  } else if (weeks < 4) {
    timeString = `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else if (months < 12) {
    timeString = `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    timeString = `${years} year${years !== 1 ? 's' : ''}`;
  }

  return isFuture ? `in ${timeString}` : `${timeString} ago`;
}

/**
 * Format date for a specific timezone
 */
export function formatInTimezone(date: Date, timezone: string): {
  date: string;
  time: string;
  full: string;
} {
  try {
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    const fullOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    };

    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions),
      full: date.toLocaleString('en-US', fullOptions),
    };
  } catch {
    return {
      date: 'Invalid timezone',
      time: 'Invalid timezone',
      full: 'Invalid timezone',
    };
  }
}

/**
 * Convert timestamp to all formats
 */
export function convertTimestamp(
  timestamp: number,
  unit: TimestampUnit,
  timezone: string
): ConversionResult {
  try {
    const ms = toMilliseconds(timestamp, unit);
    const seconds = toSeconds(timestamp, unit);
    const date = new Date(ms);

    // Validate the date
    if (isNaN(date.getTime())) {
      return {
        timestamp: 0,
        timestampMs: 0,
        iso: '',
        utc: '',
        local: '',
        relative: '',
        formatted: { date: '', time: '', full: '' },
        isValid: false,
        error: 'Invalid timestamp',
      };
    }

    // Check for reasonable date range (year 1970 to year 3000)
    const year = date.getFullYear();
    if (year < 1970 || year > 3000) {
      return {
        timestamp: seconds,
        timestampMs: ms,
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toLocaleString(),
        relative: getRelativeTime(date),
        formatted: formatInTimezone(date, timezone),
        isValid: true,
        error: `Warning: Date is outside typical range (year ${year})`,
      };
    }

    return {
      timestamp: seconds,
      timestampMs: ms,
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      relative: getRelativeTime(date),
      formatted: formatInTimezone(date, timezone),
      isValid: true,
    };
  } catch {
    return {
      timestamp: 0,
      timestampMs: 0,
      iso: '',
      utc: '',
      local: '',
      relative: '',
      formatted: { date: '', time: '', full: '' },
      isValid: false,
      error: 'Failed to convert timestamp',
    };
  }
}

/**
 * Parse a date string to timestamp
 */
export function parseDateString(dateString: string): { ms: number; isValid: boolean; error?: string } {
  try {
    const trimmed = dateString.trim();
    if (!trimmed) {
      return { ms: 0, isValid: false, error: 'Empty input' };
    }

    const date = new Date(trimmed);
    
    if (isNaN(date.getTime())) {
      return { ms: 0, isValid: false, error: 'Invalid date format' };
    }

    return { ms: date.getTime(), isValid: true };
  } catch {
    return { ms: 0, isValid: false, error: 'Failed to parse date' };
  }
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(unit: TimestampUnit): number {
  const now = Date.now();
  return unit === 'seconds' ? Math.floor(now / 1000) : now;
}

/**
 * Format timestamp with thousands separators for readability
 */
export function formatTimestampDisplay(timestamp: number): string {
  return timestamp.toLocaleString('en-US');
}
