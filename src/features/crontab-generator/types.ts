export type CronFieldType = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

export interface CronField {
    type: 'every' | 'specific' | 'range' | 'step';
    values: number[];
    rangeStart?: number;
    rangeEnd?: number;
    stepValue?: number;
}

export interface CronConfig {
    minute: CronField;
    hour: CronField;
    dayOfMonth: CronField;
    month: CronField;
    dayOfWeek: CronField;
}

export interface CronPreset {
    label: string;
    expression: string;
    description: string;
}

export interface CronFieldMeta {
    name: string;
    label: string;
    min: number;
    max: number;
    displayLabels?: string[];
}
