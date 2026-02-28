'use client';

import { useState, useMemo, useCallback } from 'react';
import type {
    DateCalculatorMode,
    DateDifference,
    DateUnit,
    DateOperation,
    DateAddSubtractResult,
} from '../types';
import {
    parseDateString,
    calculateDateDifference,
    addToDate,
    subtractFromDate,
    getDateAddSubtractResult,
} from '../lib/date-utils';

interface UseDateCalculatorReturn {
    mode: DateCalculatorMode;
    setMode: (mode: DateCalculatorMode) => void;

    // Difference mode
    startDateStr: string;
    setStartDateStr: (date: string) => void;
    endDateStr: string;
    setEndDateStr: (date: string) => void;
    dateDifference: DateDifference | null;
    differenceError: string | null;
    isDifferenceCalculated: boolean;

    // Add/Subtract mode
    baseDateStr: string;
    setBaseDateStr: (date: string) => void;
    amount: number;
    setAmount: (amount: number) => void;
    unit: DateUnit;
    setUnit: (unit: DateUnit) => void;
    operation: DateOperation;
    setOperation: (operation: DateOperation) => void;
    addSubtractResult: DateAddSubtractResult | null;
    addSubtractError: string | null;
    isAddSubtractCalculated: boolean;

    resetAll: () => void;
    setToday: (target: 'start' | 'end' | 'base') => void;
}

function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

export function useDateCalculator(): UseDateCalculatorReturn {
    const [mode, setMode] = useState<DateCalculatorMode>('difference');

    // Difference mode state
    const [startDateStr, setStartDateStr] = useState<string>('');
    const [endDateStr, setEndDateStr] = useState<string>('');

    // Add/Subtract mode state
    const [baseDateStr, setBaseDateStr] = useState<string>(getTodayStr());
    const [amount, setAmount] = useState<number>(30);
    const [unit, setUnit] = useState<DateUnit>('days');
    const [operation, setOperation] = useState<DateOperation>('add');

    // Compute difference
    const { dateDifference, differenceError } = useMemo(() => {
        if (!startDateStr || !endDateStr) {
            return { dateDifference: null, differenceError: null };
        }

        const start = parseDateString(startDateStr);
        const end = parseDateString(endDateStr);

        if (!start || !end) {
            return {
                dateDifference: null,
                differenceError: 'Please enter valid dates.',
            };
        }

        const diff = calculateDateDifference(start, end);
        return { dateDifference: diff, differenceError: null };
    }, [startDateStr, endDateStr]);

    // Compute add/subtract
    const { addSubtractResult, addSubtractError } = useMemo(() => {
        if (!baseDateStr) {
            return { addSubtractResult: null, addSubtractError: null };
        }

        const base = parseDateString(baseDateStr);

        if (!base) {
            return {
                addSubtractResult: null,
                addSubtractError: 'Please enter a valid date.',
            };
        }

        if (amount < 0) {
            return {
                addSubtractResult: null,
                addSubtractError: 'Amount must be a positive number.',
            };
        }

        const resultDate =
            operation === 'add'
                ? addToDate(base, amount, unit)
                : subtractFromDate(base, amount, unit);

        const result = getDateAddSubtractResult(resultDate);
        return { addSubtractResult: result, addSubtractError: null };
    }, [baseDateStr, amount, unit, operation]);

    const isDifferenceCalculated = dateDifference !== null;
    const isAddSubtractCalculated = addSubtractResult !== null;

    const resetAll = useCallback(() => {
        setStartDateStr('');
        setEndDateStr('');
        setBaseDateStr(getTodayStr());
        setAmount(30);
        setUnit('days');
        setOperation('add');
    }, []);

    const setToday = useCallback(
        (target: 'start' | 'end' | 'base') => {
            const today = getTodayStr();
            switch (target) {
                case 'start':
                    setStartDateStr(today);
                    break;
                case 'end':
                    setEndDateStr(today);
                    break;
                case 'base':
                    setBaseDateStr(today);
                    break;
            }
        },
        []
    );

    return {
        mode,
        setMode,
        startDateStr,
        setStartDateStr,
        endDateStr,
        setEndDateStr,
        dateDifference,
        differenceError,
        isDifferenceCalculated,
        baseDateStr,
        setBaseDateStr,
        amount,
        setAmount,
        unit,
        setUnit,
        operation,
        setOperation,
        addSubtractResult,
        addSubtractError,
        isAddSubtractCalculated,
        resetAll,
        setToday,
    };
}
