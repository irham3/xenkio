import { useState, useCallback, useMemo } from 'react';
import { SqlFormatterOptions, SqlFormatterResult, SqlFormatterStats } from '../types';
import { formatSql, minifySql, validateSql } from '../lib/sql-utils';

export function useSqlFormatter() {
    const [options, setOptions] = useState<SqlFormatterOptions>({
        sql: '',
        keywordCase: 'upper',
        indentType: 'SPACE',
        indentSize: 4,
        dialect: 'standard',
    });

    const [result, setResult] = useState<SqlFormatterResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const updateOption = useCallback(
        <K extends keyof SqlFormatterOptions>(key: K, value: SqlFormatterOptions[K]) => {
            setOptions(prev => ({ ...prev, [key]: value }));
            if (key === 'sql') {
                setValidationError(null);
            }
        },
        []
    );

    const format = useCallback(() => {
        if (!options.sql.trim()) return;

        setIsProcessing(true);
        setValidationError(null);

        try {
            const validation = validateSql(options.sql);
            if (!validation.isValid) {
                setValidationError(validation.error ?? 'Invalid SQL');
                setResult({ formatted: '', isValid: false, error: validation.error });
                return;
            }

            const startTime = performance.now();
            const formatted = formatSql(options.sql, {
                keywordCase: options.keywordCase,
                indentType: options.indentType,
                indentSize: options.indentSize,
            });
            const endTime = performance.now();

            setResult({
                formatted,
                isValid: true,
                executionTime: endTime - startTime,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            setValidationError(message);
            setResult({ formatted: '', isValid: false, error: message });
        } finally {
            setIsProcessing(false);
        }
    }, [options]);

    const minify = useCallback(() => {
        if (!options.sql.trim()) return;

        setIsProcessing(true);
        setValidationError(null);

        try {
            const validation = validateSql(options.sql);
            if (!validation.isValid) {
                setValidationError(validation.error ?? 'Invalid SQL');
                setResult({ formatted: '', isValid: false, error: validation.error });
                return;
            }

            const startTime = performance.now();
            const minified = minifySql(options.sql);
            const endTime = performance.now();

            setResult({
                formatted: minified,
                isValid: true,
                executionTime: endTime - startTime,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            setValidationError(message);
            setResult({ formatted: '', isValid: false, error: message });
        } finally {
            setIsProcessing(false);
        }
    }, [options.sql]);

    const reset = useCallback(() => {
        setOptions({
            sql: '',
            keywordCase: 'upper',
            indentType: 'SPACE',
            indentSize: 4,
            dialect: 'standard',
        });
        setResult(null);
        setValidationError(null);
    }, []);

    const loadSample = useCallback((sample: string) => {
        setOptions(prev => ({ ...prev, sql: sample }));
        setResult(null);
        setValidationError(null);
    }, []);

    const stats: SqlFormatterStats | null = useMemo(() => {
        if (!options.sql || !result?.formatted) return null;
        return {
            originalSize: new Blob([options.sql]).size,
            formattedSize: new Blob([result.formatted]).size,
        };
    }, [options.sql, result?.formatted]);

    return {
        options,
        result,
        stats,
        isProcessing,
        validationError,
        updateOption,
        format,
        minify,
        reset,
        loadSample,
    };
}
