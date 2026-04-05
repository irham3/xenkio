'use client';

import { useState, useMemo, useCallback } from 'react';
import type { BmiResult, BmiUnit } from '../types';
import {
    calculateBmi,
    getBmiResult,
    cmToMeters,
    lbsToKg,
    inchesToCm,
    getHealthyWeightRange,
} from '../lib/bmi-utils';

interface UseBmiCalculatorReturn {
    unit: BmiUnit;
    setUnit: (unit: BmiUnit) => void;
    heightCm: string;
    setHeightCm: (v: string) => void;
    heightFt: string;
    setHeightFt: (v: string) => void;
    heightIn: string;
    setHeightIn: (v: string) => void;
    weight: string;
    setWeight: (v: string) => void;
    result: BmiResult | null;
    healthyWeightRange: { min: number; max: number } | null;
    isCalculated: boolean;
    reset: () => void;
}

export function useBmiCalculator(): UseBmiCalculatorReturn {
    const [unit, setUnit] = useState<BmiUnit>('metric');
    const [heightCm, setHeightCm] = useState('');
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');
    const [weight, setWeight] = useState('');

    const { result, healthyWeightRange } = useMemo(() => {
        const w = parseFloat(weight);
        let heightM: number;
        let weightKg: number;

        if (unit === 'metric') {
            const h = parseFloat(heightCm);
            if (!h || !w || h <= 0 || w <= 0) return { result: null, healthyWeightRange: null };
            heightM = cmToMeters(h);
            weightKg = w;
        } else {
            const ft = parseFloat(heightFt) || 0;
            const inches = parseFloat(heightIn) || 0;
            const totalInches = ft * 12 + inches;
            if (!totalInches || !w || totalInches <= 0 || w <= 0) {
                return { result: null, healthyWeightRange: null };
            }
            heightM = cmToMeters(inchesToCm(totalInches));
            weightKg = lbsToKg(w);
        }

        const bmi = calculateBmi(weightKg, heightM);
        if (bmi <= 0) return { result: null, healthyWeightRange: null };
        return {
            result: getBmiResult(bmi),
            healthyWeightRange: getHealthyWeightRange(heightM),
        };
    }, [unit, heightCm, heightFt, heightIn, weight]);

    const isCalculated = result !== null;

    const reset = useCallback(() => {
        setHeightCm('');
        setHeightFt('');
        setHeightIn('');
        setWeight('');
    }, []);

    return {
        unit,
        setUnit,
        heightCm,
        setHeightCm,
        heightFt,
        setHeightFt,
        heightIn,
        setHeightIn,
        weight,
        setWeight,
        result,
        healthyWeightRange,
        isCalculated,
        reset,
    };
}
