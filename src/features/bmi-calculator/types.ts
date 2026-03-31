export type BmiCategory =
    | 'underweight'
    | 'normal'
    | 'overweight'
    | 'obese'
    | 'severely-obese';

export type BmiUnit = 'metric' | 'imperial';

export interface BmiResult {
    bmi: number;
    category: BmiCategory;
    label: string;
    color: string;
    bgColor: string;
    range: string;
    healthRisk: string;
}
