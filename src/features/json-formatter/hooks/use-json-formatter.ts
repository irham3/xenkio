
import { useState, useCallback, useMemo } from 'react';
import { JsonFormatterOptions, JsonFormatterResult, JsonFormatterStats } from '../types';
import { formatJson, minifyJson } from '../lib/json-utils';

export function useJsonFormatter() {
    const [options, setOptions] = useState<JsonFormatterOptions>({
        json: '',
        indentType: 'SPACE',
        indentSize: 2,
        sortKeys: false,
    });

    const [result, setResult] = useState<JsonFormatterResult | null>(null);
    const [isFormatting, setIsFormatting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const updateOption = useCallback(<K extends keyof JsonFormatterOptions>(key: K, value: JsonFormatterOptions[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
        if (key === 'json') {
            setValidationError(null); // Clear error on text change
        }
    }, []);

    const format = useCallback(() => {
        if (!options.json.trim()) return;

        setIsFormatting(true);
        const startTime = performance.now();
        setValidationError(null);

        try {
            const formatted = formatJson(
                options.json,
                options.indentType,
                options.indentSize,
                options.sortKeys
            );

            const endTime = performance.now();

            setResult({
                formatted,
                isValid: true,
                executionTime: endTime - startTime
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            setValidationError(message);
            setResult({
                formatted: '',
                isValid: false,
                error: message
            });
        } finally {
            setIsFormatting(false);
        }
    }, [options]);

    const minify = useCallback(() => {
        if (!options.json.trim()) return;

        setIsFormatting(true);
        const startTime = performance.now();
        setValidationError(null);

        try {
            const minified = minifyJson(options.json);
            const endTime = performance.now();
            setResult({
                formatted: minified,
                isValid: true,
                executionTime: endTime - startTime
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            setValidationError(message);
            setResult({
                formatted: '',
                isValid: false,
                error: message
            });
        } finally {
            setIsFormatting(false);
        }
    }, [options.json]);

    const reset = useCallback(() => {
        setOptions({
            json: '',
            indentType: 'SPACE',
            indentSize: 2,
            sortKeys: false,
        });
        setResult(null);
        setValidationError(null);
    }, []);

    const loadSample = useCallback((sample: string) => {
        setOptions(prev => ({ ...prev, json: sample }));
        // Format immediately after loading sample (optional, but nice)
        // But options update is async, so we can't call format() here directly with new generic state without useEffect
        // The component's useEffect will handle it.
    }, []);

    const stats: JsonFormatterStats | null = useMemo(() => {
        if (!options.json || !result?.formatted) return null;
        return {
            originalSize: new Blob([options.json]).size,
            formattedSize: new Blob([result.formatted]).size,
        };
    }, [options.json, result?.formatted]);

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
