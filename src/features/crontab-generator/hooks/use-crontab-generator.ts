'use client';

import { useState, useCallback, useMemo } from 'react';
import { CronConfig, CronFieldType, CronField } from '../types';
import {
    getDefaultConfig,
    configToExpression,
    expressionToConfig,
    cronToHumanReadable,
    getNextExecutions,
    isValidCronExpression,
} from '../lib/cron-utils';

export type CrontabMode = 'generator' | 'parser';

export function useCrontabGenerator() {
    const [mode, setMode] = useState<CrontabMode>('generator');
    const [config, setConfig] = useState<CronConfig>(getDefaultConfig());
    const [parserInput, setParserInput] = useState('');

    const generatedExpression = useMemo(() => configToExpression(config), [config]);

    const humanReadable = useMemo(() => {
        if (mode === 'generator') {
            return cronToHumanReadable(generatedExpression);
        }
        return cronToHumanReadable(parserInput);
    }, [mode, generatedExpression, parserInput]);

    const nextExecutions = useMemo(() => {
        const expr = mode === 'generator' ? generatedExpression : parserInput;
        return getNextExecutions(expr, 5);
    }, [mode, generatedExpression, parserInput]);

    const isValid = useMemo(() => {
        if (mode === 'generator') return true;
        return parserInput.trim() === '' || isValidCronExpression(parserInput);
    }, [mode, parserInput]);

    const currentExpression = mode === 'generator' ? generatedExpression : parserInput;

    const updateField = useCallback((fieldType: CronFieldType, field: CronField) => {
        setConfig(prev => ({ ...prev, [fieldType]: field }));
    }, []);

    const applyPreset = useCallback((expression: string) => {
        const parsed = expressionToConfig(expression);
        if (parsed) {
            setConfig(parsed);
        }
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(getDefaultConfig());
    }, []);

    const handleSetMode = useCallback((newMode: CrontabMode) => {
        setMode(newMode);
        if (newMode === 'generator') {
            setParserInput('');
        }
    }, []);

    return {
        mode,
        setMode: handleSetMode,
        config,
        parserInput,
        setParserInput,
        generatedExpression,
        humanReadable,
        nextExecutions,
        isValid,
        currentExpression,
        updateField,
        applyPreset,
        resetConfig,
    };
}
