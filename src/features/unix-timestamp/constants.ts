import { TimestampUnit, DateFormat } from './types';

export interface TimestampUnitConfig {
  id: TimestampUnit;
  name: string;
  description: string;
  multiplier: number;
}

export interface DateFormatConfig {
  id: DateFormat;
  name: string;
  example: string;
}

export const TIMESTAMP_UNITS: TimestampUnitConfig[] = [
  {
    id: 'seconds',
    name: 'Seconds',
    description: 'Standard Unix timestamp (10 digits)',
    multiplier: 1,
  },
  {
    id: 'milliseconds',
    name: 'Milliseconds',
    description: 'JavaScript timestamp (13 digits)',
    multiplier: 1000,
  },
];

export const DATE_FORMATS: DateFormatConfig[] = [
  {
    id: 'iso',
    name: 'ISO 8601',
    example: '2025-01-30T14:30:00.000Z',
  },
  {
    id: 'utc',
    name: 'UTC String',
    example: 'Thu, 30 Jan 2025 14:30:00 GMT',
  },
  {
    id: 'local',
    name: 'Local DateTime',
    example: '1/30/2025, 2:30:00 PM',
  },
  {
    id: 'relative',
    name: 'Relative Time',
    example: '2 hours ago',
  },
];

export const COMMON_TIMEZONES = [
  { id: 'UTC', name: 'UTC', offset: '+00:00' },
  { id: 'America/New_York', name: 'New York (EST/EDT)', offset: '-05:00' },
  { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)', offset: '-08:00' },
  { id: 'America/Chicago', name: 'Chicago (CST/CDT)', offset: '-06:00' },
  { id: 'Europe/London', name: 'London (GMT/BST)', offset: '+00:00' },
  { id: 'Europe/Paris', name: 'Paris (CET/CEST)', offset: '+01:00' },
  { id: 'Europe/Berlin', name: 'Berlin (CET/CEST)', offset: '+01:00' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST)', offset: '+09:00' },
  { id: 'Asia/Shanghai', name: 'Shanghai (CST)', offset: '+08:00' },
  { id: 'Asia/Singapore', name: 'Singapore (SGT)', offset: '+08:00' },
  { id: 'Asia/Dubai', name: 'Dubai (GST)', offset: '+04:00' },
  { id: 'Asia/Jakarta', name: 'Jakarta (WIB)', offset: '+07:00' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)', offset: '+11:00' },
  { id: 'Pacific/Auckland', name: 'Auckland (NZST/NZDT)', offset: '+13:00' },
];

export const QUICK_TIMESTAMPS = [
  { label: 'Now', getValue: () => Math.floor(Date.now() / 1000) },
  { label: 'Start of Today', getValue: () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / 1000);
  }},
  { label: 'Start of Week', getValue: () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    now.setDate(diff);
    now.setHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / 1000);
  }},
  { label: 'Start of Month', getValue: () => {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / 1000);
  }},
  { label: 'Start of Year', getValue: () => {
    const now = new Date();
    now.setMonth(0, 1);
    now.setHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / 1000);
  }},
];

export const DEFAULT_OPTIONS = {
  unit: 'seconds' as TimestampUnit,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  customFormat: 'YYYY-MM-DD HH:mm:ss',
};
