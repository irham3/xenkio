'use client';

import { useState, useMemo, useCallback } from 'react';
import type {
    TimeCalculatorMode,
    TimeDifference,
    TimeUnit,
    TimeOperation,
    TimeAddSubtractResult,
} from '../types';
import { parseTimeInput, calculateTimeDifference, addSubtractTime } from '../lib/time-utils';

interface UseTimeCalculatorReturn {
    mode: TimeCalculatorMode;
    setMode: (mode: TimeCalculatorMode) => void;

    // Difference mode
    startTimeStr: string;
    setStartTimeStr: (v: string) => void;
    endTimeStr: string;
    setEndTimeStr: (v: string) => void;
    timeDifference: TimeDifference | null;
    differenceError: string | null;
    isDifferenceCalculated: boolean;

    // Add/Subtract mode
    baseTimeStr: string;
    setBaseTimeStr: (v: string) => void;
    amount: number;
    setAmount: (v: number) => void;
    unit: TimeUnit;
    setUnit: (v: TimeUnit) => void;
    operation: TimeOperation;
    setOperation: (v: TimeOperation) => void;
    addSubtractResult: TimeAddSubtractResult | null;
    addSubtractError: string | null;
    isAddSubtractCalculated: boolean;

    resetAll: () => void;
    setNow: (target: 'start' | 'end' | 'base') => void;
}

function getNowStr(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

export function useTimeCalculator(): UseTimeCalculatorReturn {
    const [mode, setMode] = useState<TimeCalculatorMode>('difference');

    // Difference mode
    const [startTimeStr, setStartTimeStr] = useState<string>('');
    const [endTimeStr, setEndTimeStr] = useState<string>('');

    // Add/Subtract mode
    const [baseTimeStr, setBaseTimeStr] = useState<string>(getNowStr());
    const [amount, setAmount] = useState<number>(30);
    const [unit, setUnit] = useState<TimeUnit>('minutes');
    const [operation, setOperation] = useState<TimeOperation>('add');

    const { timeDifference, differenceError } = useMemo(() => {
        if (!startTimeStr || !endTimeStr) {
            return { timeDifference: null, differenceError: null };
        }

        const start = parseTimeInput(startTimeStr);
        const end = parseTimeInput(endTimeStr);

        if (!start || !end) {
            return { timeDifference: null, differenceError: 'Please enter valid times in HH:MM or HH:MM:SS format.' };
        }

        return { timeDifference: calculateTimeDifference(start, end), differenceError: null };
    }, [startTimeStr, endTimeStr]);

    const { addSubtractResult, addSubtractError } = useMemo(() => {
        if (!baseTimeStr) {
            return { addSubtractResult: null, addSubtractError: null };
        }

        const base = parseTimeInput(baseTimeStr);

        if (!base) {
            return { addSubtractResult: null, addSubtractError: 'Please enter a valid time in HH:MM or HH:MM:SS format.' };
        }

        if (amount < 0) {
            return { addSubtractResult: null, addSubtractError: 'Amount must be a positive number.' };
        }

        return { addSubtractResult: addSubtractTime(base, amount, unit, operation), addSubtractError: null };
    }, [baseTimeStr, amount, unit, operation]);

    const isDifferenceCalculated = timeDifference !== null;
    const isAddSubtractCalculated = addSubtractResult !== null;

    const resetAll = useCallback(() => {
        setStartTimeStr('');
        setEndTimeStr('');
        setBaseTimeStr(getNowStr());
        setAmount(30);
        setUnit('minutes');
        setOperation('add');
    }, []);

    const setNow = useCallback((target: 'start' | 'end' | 'base') => {
        const now = getNowStr();
        if (target === 'start') setStartTimeStr(now);
        else if (target === 'end') setEndTimeStr(now);
        else setBaseTimeStr(now);
    }, []);

    return {
        mode, setMode,
        startTimeStr, setStartTimeStr,
        endTimeStr, setEndTimeStr,
        timeDifference, differenceError, isDifferenceCalculated,
        baseTimeStr, setBaseTimeStr,
        amount, setAmount,
        unit, setUnit,
        operation, setOperation,
        addSubtractResult, addSubtractError, isAddSubtractCalculated,
        resetAll, setNow,
    };
}
