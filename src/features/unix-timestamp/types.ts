export type TimestampUnit = 'seconds' | 'milliseconds';

export type DateFormat = 
  | 'iso' 
  | 'utc' 
  | 'local' 
  | 'relative'
  | 'custom';

export interface TimestampOptions {
  timestamp: string;
  dateString: string;
  unit: TimestampUnit;
  timezone: string;
  customFormat: string;
}

export interface ConversionResult {
  timestamp: number;
  timestampMs: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
  formatted: {
    date: string;
    time: string;
    full: string;
  };
  isValid: boolean;
  error?: string;
}
