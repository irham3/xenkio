import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimestampOptions, ConversionResult, TimestampUnit } from '../types';
import { convertTimestamp, parseDateString, getCurrentTimestamp, parseTimestamp } from '../lib/timestamp-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useTimestampConverter() {
  const [options, setOptions] = useState<TimestampOptions>({
    timestamp: '',
    dateString: '',
    unit: DEFAULT_OPTIONS.unit,
    timezone: DEFAULT_OPTIONS.timezone,
    customFormat: DEFAULT_OPTIONS.customFormat,
  });

  const [liveTimestamp, setLiveTimestamp] = useState<number>(getCurrentTimestamp('seconds'));

  // Update live timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTimestamp(getCurrentTimestamp('seconds'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Compute result from timestamp input (using useMemo instead of useEffect)
  const result: ConversionResult | null = useMemo(() => {
    if (!options.timestamp.trim()) {
      return null;
    }

    const parsed = parseTimestamp(options.timestamp);
    if (!parsed) {
      return {
        timestamp: 0,
        timestampMs: 0,
        iso: '',
        utc: '',
        local: '',
        relative: '',
        formatted: { date: '', time: '', full: '' },
        isValid: false,
        error: 'Invalid timestamp format. Enter a valid number.',
      };
    }

    return convertTimestamp(
      parsed.value,
      parsed.unit,
      options.timezone
    );
  }, [options.timestamp, options.timezone]);

  const updateOption = useCallback(<K extends keyof TimestampOptions>(
    key: K,
    value: TimestampOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const setTimestampFromDate = useCallback((dateString: string) => {
    const parsed = parseDateString(dateString);
    if (parsed.isValid) {
      const timestamp = options.unit === 'seconds'
        ? Math.floor(parsed.ms / 1000)
        : parsed.ms;
      updateOption('timestamp', timestamp.toString());
    }
  }, [options.unit, updateOption]);

  const setToNow = useCallback(() => {
    const now = getCurrentTimestamp(options.unit);
    updateOption('timestamp', now.toString());
  }, [options.unit, updateOption]);

  const setTimestamp = useCallback((value: number) => {
    const timestamp = options.unit === 'seconds'
      ? value
      : value * 1000;
    updateOption('timestamp', timestamp.toString());
  }, [options.unit, updateOption]);

  const toggleUnit = useCallback(() => {
    const newUnit: TimestampUnit = options.unit === 'seconds' ? 'milliseconds' : 'seconds';
    
    // Convert current timestamp to new unit
    if (options.timestamp.trim()) {
      const parsed = parseTimestamp(options.timestamp);
      if (parsed) {
        const newValue = newUnit === 'seconds'
          ? Math.floor(parsed.value / 1000)
          : parsed.value * 1000;
        setOptions(prev => ({
          ...prev,
          unit: newUnit,
          timestamp: newValue.toString(),
        }));
        return;
      }
    }
    
    updateOption('unit', newUnit);
  }, [options.timestamp, options.unit, updateOption]);

  return {
    options,
    result,
    liveTimestamp,
    updateOption,
    setTimestampFromDate,
    setToNow,
    setTimestamp,
    toggleUnit,
  };
}
