import type { BmiCategory, BmiResult } from '../types';

export function cmToMeters(cm: number): number {
    return cm / 100;
}

export function lbsToKg(lbs: number): number {
    return lbs * 0.453592;
}

export function inchesToCm(inches: number): number {
    return inches * 2.54;
}

export function calculateBmi(weightKg: number, heightM: number): number {
    if (heightM <= 0 || weightKg <= 0) return 0;
    return weightKg / (heightM * heightM);
}

export function getBmiCategory(bmi: number): BmiCategory {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    if (bmi < 40) return 'obese';
    return 'severely-obese';
}

export function getBmiResult(bmi: number): BmiResult {
    const category = getBmiCategory(bmi);

    const categoryData: Record<BmiCategory, Omit<BmiResult, 'bmi' | 'category'>> = {
        underweight: {
            label: 'Underweight',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            range: '< 18.5',
            healthRisk:
                'Being underweight may indicate malnutrition, or other health problems. Consider consulting a healthcare provider.',
        },
        normal: {
            label: 'Normal Weight',
            color: 'text-primary-600',
            bgColor: 'bg-primary-50',
            range: '18.5 – 24.9',
            healthRisk:
                'You have a healthy weight. Maintaining a balanced diet and regular physical activity is recommended.',
        },
        overweight: {
            label: 'Overweight',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            range: '25 – 29.9',
            healthRisk:
                'You are slightly above the healthy weight range. Moderate lifestyle changes can help reduce health risks.',
        },
        obese: {
            label: 'Obese',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            range: '30 – 39.9',
            healthRisk:
                'Obesity is associated with increased risk of heart disease, diabetes, and other conditions. Consult a healthcare provider.',
        },
        'severely-obese': {
            label: 'Severely Obese',
            color: 'text-red-700',
            bgColor: 'bg-red-100',
            range: '≥ 40',
            healthRisk:
                'Severe obesity significantly raises the risk of serious health conditions. Medical guidance is strongly recommended.',
        },
    };

    return { bmi, category, ...categoryData[category] };
}

export function getHealthyWeightRange(heightM: number): { min: number; max: number } {
    return {
        min: Math.round(18.5 * heightM * heightM * 10) / 10,
        max: Math.round(24.9 * heightM * heightM * 10) / 10,
    };
}
