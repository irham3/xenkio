export type ColumnType = 'numeric' | 'date' | 'categorical' | 'text';

export interface ColumnSchema {
    name: string;
    type: ColumnType;
    uniqueCount: number;
    nullCount: number;
    sampleValues: string[];
    hidden?: boolean;
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

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';

export interface FilterCondition {
    column: string;
    operator: FilterOperator;
    value: string;
}

export type DateGroupType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PivotConfig {
    /** Column used for grouping rows (X-axis / labels) */
    groupByColumn: string;
    /** Columns used as values (Y-axis) */
    valueColumns: string[];
    /** Aggregation function for each value column */
    aggregation: AggregationType;
    /** Filters to apply before aggregating */
    filters?: FilterCondition[];
    /** Date formatting mode if X-axis is a date */
    dateGroup?: DateGroupType;
}

export interface ChartConfig {
    id: string;
    title: string;
    type: ChartType;
    xKey: string;
    yKeys: string[];
    data: Record<string, unknown>[];
    allowedTypes: ChartType[];
    /** If set, this chart was manually configured */
    pivotConfig?: PivotConfig;
    /** Whether this chart is using manual/pivot mode */
    isManual?: boolean;
    /** Auto-generated insights based on the chart data */
    insight?: string;
    /** Whether the bar/area chart should be stacked */
    stacked?: boolean;
}

export interface ColumnOverride {
    name: string;
    newName?: string;
    newType?: ColumnType;
    hidden?: boolean;
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
