export type UnitCategory =
    | 'length'
    | 'weight'
    | 'temperature'
    | 'volume'
    | 'area'
    | 'speed'
    | 'pressure'
    | 'energy'
    | 'power'
    | 'data'
    | 'time';

export interface Unit {
    id: string;
    name: string;
    symbol: string;
    toBase: number;
    fromBase?: (value: number) => number;
    toBaseFn?: (value: number) => number;
}

export interface UnitCategoryData {
    id: UnitCategory;
    name: string;
    icon: string;
    baseUnit: string;
    units: Unit[];
}

export interface ConversionResult {
    value: number;
    formatted: string;
    scientific?: string;
}

export interface ConverterState {
    category: UnitCategory;
    fromUnit: string;
    toUnit: string;
    inputValue: string;
    result: ConversionResult | null;
    history: ConversionHistoryItem[];
}

export interface ConversionHistoryItem {
    id: string;
    fromValue: number;
    fromUnit: string;
    toValue: number;
    toUnit: string;
    category: UnitCategory;
    timestamp: number;
}
