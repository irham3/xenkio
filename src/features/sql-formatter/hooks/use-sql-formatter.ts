
import { useState, useCallback, useMemo } from 'react';
import type { SqlFormatterOptions, SqlFormatterResult, SqlFormatterStats } from '../types';
import { formatSql } from '../lib/sql-utils';

export function useSqlFormatter() {
    const [options, setOptions] = useState<SqlFormatterOptions>({
        sql: '',
        language: 'sql',
        tabWidth: 2,
        useTabs: false,
        keywordCase: 'upper',
        indentStyle: 'standard',
    });

    const [result, setResult] = useState<SqlFormatterResult | null>(null);
    const [isFormatting, setIsFormatting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const updateOption = useCallback(<K extends keyof SqlFormatterOptions>(key: K, value: SqlFormatterOptions[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
        if (key === 'sql') {
            setValidationError(null);
        }
    }, []);

    const format = useCallback(() => {
        if (!options.sql.trim()) return;

        setIsFormatting(true);
        const startTime = performance.now();
        setValidationError(null);

        try {
            const formatted = formatSql(
                options.sql,
                options.language,
                options.tabWidth,
                options.useTabs,
                options.keywordCase,
                options.indentStyle
            );

            const endTime = performance.now();

            setResult({
                formatted,
                isValid: true,
                executionTime: endTime - startTime,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            setValidationError(message);
            setResult({
                formatted: '',
                isValid: false,
                error: message,
            });
        } finally {
            setIsFormatting(false);
        }
    }, [options]);

    const reset = useCallback(() => {
        setOptions({
            sql: '',
            language: 'sql',
            tabWidth: 2,
            useTabs: false,
            keywordCase: 'upper',
            indentStyle: 'standard',
        });
        setResult(null);
        setValidationError(null);
    }, []);

    const loadSample = useCallback((sample: string) => {
        setOptions(prev => ({ ...prev, sql: sample }));
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
        isFormatting,
        validationError,
        updateOption,
        format,
        reset,
        loadSample,
    };
}
