export type ColumnType = 'numeric' | 'date' | 'categorical' | 'text';

export interface ColumnSchema {
    name: string;
    type: ColumnType;
    uniqueCount: number;
    nullCount: number;
    sampleValues: string[];
}

export interface NumericStats {
    column: string;
    min: number;
    max: number;
    sum: number;
    mean: number;
    count: number;
}

export interface CategoryCount {
    name: string;
    value: number;
}

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

export interface ChartConfig {
    id: string;
    title: string;
    type: ChartType;
    xKey: string;
    yKeys: string[];
    data: Record<string, unknown>[];
    allowedTypes: ChartType[];
}

export interface DatasetAnalysis {
    headers: string[];
    rows: Record<string, string>[];
    schema: ColumnSchema[];
    numericStats: NumericStats[];
    categoryCounts: Record<string, CategoryCount[]>;
    recommendedCharts: ChartConfig[];
    totalRows: number;
    totalColumns: number;
}
