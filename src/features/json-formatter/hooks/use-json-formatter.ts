import { useState, useCallback, useRef } from 'react';
import { JsonFormatterOptions, JsonFormatterResult, FormatStats } from '../types';
import { formatJson, minifyJson, calculateStats, isValidJson } from '../lib/json-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useJsonFormatter() {
    const [options, setOptions] = useState<JsonFormatterOptions>(DEFAULT_OPTIONS);
    const [result, setResult] = useState<JsonFormatterResult | null>(null);
    const [stats, setStats] = useState<FormatStats | null>(null);
    const [isFormatting, setIsFormatting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const currentReqId = useRef(0);

    const format = useCallback(() => {
        if (!options.json.trim()) {
            setResult(null);
            setStats(null);
            setValidationError(null);
            return;
        }

        const reqId = ++currentReqId.current;
        setIsFormatting(true);

        const validation = isValidJson(options.json);
        if (!validation.valid) {
            setValidationError(validation.error ?? 'Invalid JSON');
        } else {
            setValidationError(null);
        }

        try {
            const res = formatJson(options);

            if (reqId === currentReqId.current) {
                setResult(res);
                if (res.isValid && !res.error) {
                    setStats(calculateStats(options.json, res.formatted));
                } else {
                    setValidationError(res.error ?? 'Invalid JSON');
                    setStats(null);
                }
            }
        } catch (error) {
            console.error('JSON formatting failed', error);
            if (reqId === currentReqId.current) {
                setResult({
                    formatted: options.json,
                    originalSize: options.json.length,
                    formattedSize: options.json.length,
                    executionTime: 0,
                    error: 'Formatting failed',
                    isValid: false,
                });
                setStats(null);
            }
        } finally {
            if (reqId === currentReqId.current) {
                setIsFormatting(false);
            }
        }
    }, [options]);

    const updateOption = <K extends keyof JsonFormatterOptions>(key: K, value: JsonFormatterOptions[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const minify = useCallback(() => {
        if (!options.json.trim()) return;

        const res = minifyJson(options.json);
        setResult(res);
        if (res.isValid) {
            setStats(calculateStats(options.json, res.formatted));
            setValidationError(null);
        } else {
            setValidationError(res.error ?? 'Invalid JSON');
            setStats(null);
        }
    }, [options.json]);

    const reset = useCallback(() => {
        setOptions(DEFAULT_OPTIONS);
        setResult(null);
        setStats(null);
        setValidationError(null);
    }, []);

    const loadSample = useCallback((sample: string) => {
        setOptions(prev => ({ ...prev, json: sample }));
    }, []);

    return {
        options,
        result,
        stats,
        isFormatting,
        validationError,
        updateOption,
        format,
        minify,
        reset,
        loadSample,
    };
}
