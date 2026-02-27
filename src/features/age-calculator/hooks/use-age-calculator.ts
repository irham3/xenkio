'use client';

import { useState, useMemo, useCallback } from 'react';
import type { AgeDetails } from '../types';
import {
    parseDateString,
    isValidBirthDate,
    calculateAgeDetails,
} from '../lib/age-utils';

interface UseAgeCalculatorReturn {
    birthDateStr: string;
    setBirthDateStr: (date: string) => void;
    ageDetails: AgeDetails | null;
    error: string | null;
    isCalculated: boolean;
    reset: () => void;
}

export function useAgeCalculator(): UseAgeCalculatorReturn {
    const [birthDateStr, setBirthDateStr] = useState<string>('');

    const { ageDetails, error } = useMemo(() => {
        if (!birthDateStr) {
            return { ageDetails: null, error: null };
        }

        const birthDate = parseDateString(birthDateStr);
        if (!birthDate) {
            return { ageDetails: null, error: 'Please enter a valid date.' };
        }

        if (!isValidBirthDate(birthDate)) {
            return {
                ageDetails: null,
                error: 'Birth date cannot be in the future or before 1900.',
            };
        }

        const now = new Date();
        const details = calculateAgeDetails(birthDate, now);
        return { ageDetails: details, error: null };
    }, [birthDateStr]);

    const isCalculated = ageDetails !== null;

    const reset = useCallback(() => {
        setBirthDateStr('');
    }, []);

    return {
        birthDateStr,
        setBirthDateStr,
        ageDetails,
        error,
        isCalculated,
        reset,
    };
}
