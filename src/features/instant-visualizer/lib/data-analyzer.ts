import {
    ColumnSchema,
    ColumnType,
    NumericStats,
    CategoryCount,
    ChartConfig,
    DatasetAnalysis,
    AggregationType,
    PivotConfig,
} from '../types';

// ─── Parsing ───────────────────────────────────────────────
export function parsePastedData(text: string): {
    headers: string[];
    rows: Record<string, string>[];
    error?: string;
} {
    const trimmed = text.trim();
    if (!trimmed) return { headers: [], rows: [] };

    const lines = trimmed.split(/\r?\n/);
    if (lines.length < 1)
        return { headers: [], rows: [], error: 'Data must include at least one row.' };

    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t')
        ? '\t'
        : firstLine.includes(';')
          ? ';'
          : firstLine.includes(',')
            ? ','
            : '\t';

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    let rawHeaders = parseCSVLine(firstLine).map((h) => h.trim().replace(/^"|"$/g, ''));
    if (rawHeaders.filter(Boolean).length === 0) return { headers: [], rows: [], error: 'Failed to recognize your data. Please ensure the top row contains column headers (e.g., Name, Age, Price).' };

    const seenHeaders = new Set<string>();
    const headers = rawHeaders.map((h, idx) => {
        let name = h || `Column_${idx + 1}`;
        let originalName = name;
        let counter = 2;
        while (seenHeaders.has(name)) {
            name = `${originalName} (${counter})`;
            counter++;
        }
        seenHeaders.add(name);
        return name;
    });

    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = parseCSVLine(line);
        const rowData: Record<string, string> = {};
        let hasData = false;

        headers.forEach((header, index) => {
            let val = values[index] !== undefined ? values[index].trim() : '';
            val = val.replace(/^"|"$/g, '').replace(/""/g, '"');
            rowData[header] = val;
            if (val) hasData = true;
        });

        if (hasData) rows.push(rowData);
    }

    return { headers, rows };
}

// ─── Schema Detection ──────────────────────────────────────
const DATE_PATTERNS = [
    /^\d{4}-\d{2}-\d{2}$/,                          // 2024-01-15
    /^\d{2}\/\d{2}\/\d{4}$/,                        // 01/15/2024 or 15/01/2024
    /^\d{2}-\d{2}-\d{4}$/,                           // 01-15-2024
    /^\d{4}\/\d{2}\/\d{2}$/,                        // 2024/01/15
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,              // ISO datetime
    /^\w{3}\s+\d{1,2},?\s+\d{4}$/,                 // Jan 15, 2024
    /^\d{1,2}\s+\w{3,}\s+\d{4}$/,                  // 15 January 2024
];

function isDateValue(value: string): boolean {
    if (!value) return false;
    const v = value.trim();
    if (DATE_PATTERNS.some((p) => p.test(v))) return true;
    const parsed = Date.parse(v);
    if (!isNaN(parsed)) {
        const year = new Date(parsed).getFullYear();
        return year >= 1900 && year <= 2100;
    }
    return false;
}

export function parseToNumber(value: string | undefined | null): number {
    if (!value) return NaN;
    const trimmed = String(value).trim();
    if (trimmed === '') return NaN;

    const noSpaces = trimmed.replace(/\s/g, '');

    // check Indonesian/European format: 1.500.000,50
    if (/^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(noSpaces)) {
        return Number(noSpaces.replace(/\./g, '').replace(',', '.'));
    }
    
    // check US format: 1,500,000.50
    if (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(noSpaces)) {
        return Number(noSpaces.replace(/,/g, ''));
    }

    return Number(noSpaces.replace(/,/g, ''));
}

function isNumericValue(value: string): boolean {
    if (!value) return false;
    const num = parseToNumber(value);
    return !isNaN(num);
}

function detectColumnType(values: string[]): ColumnType {
    const nonEmpty = values.filter((v) => v.trim() !== '');
    if (nonEmpty.length === 0) return 'text';

    const sampleSize = Math.min(nonEmpty.length, 50);
    const sample = nonEmpty.slice(0, sampleSize);

    // Check numeric first
    const numericCount = sample.filter(isNumericValue).length;
    if (numericCount / sampleSize >= 0.8) return 'numeric';

    // Check date
    const dateCount = sample.filter(isDateValue).length;
    if (dateCount / sampleSize >= 0.8) return 'date';

    // Check categorical
    const uniqueValues = new Set(nonEmpty.map((v) => v.toLowerCase()));
    if (uniqueValues.size <= 20 && uniqueValues.size < nonEmpty.length * 0.5) return 'categorical';

    return 'text';
}

function buildSchema(headers: string[], rows: Record<string, string>[]): ColumnSchema[] {
    return headers.map((name) => {
        const values = rows.map((r) => r[name] || '');
        const type = detectColumnType(values);
        const nonEmpty = values.filter((v) => v.trim() !== '');
        const uniqueCount = new Set(nonEmpty.map((v) => v.toLowerCase())).size;
        const nullCount = values.length - nonEmpty.length;

        return {
            name,
            type,
            uniqueCount,
            nullCount,
            sampleValues: nonEmpty.slice(0, 5),
        };
    });
}

// ─── Summary Stats ─────────────────────────────────────────
function computeNumericStats(
    column: string,
    rows: Record<string, string>[],
): NumericStats {
    const nums: number[] = [];
    for (const row of rows) {
        const n = parseToNumber(row[column]);
        if (!isNaN(n)) nums.push(n);
    }

    if (nums.length === 0) {
        return { column, min: 0, max: 0, sum: 0, mean: 0, count: 0 };
    }

    const sum = nums.reduce((a, b) => a + b, 0);
    return {
        column,
        min: Math.min(...nums),
        max: Math.max(...nums),
        sum,
        mean: sum / nums.length,
        count: nums.length,
    };
}

function computeCategoryCounts(
    column: string,
    rows: Record<string, string>[],
): CategoryCount[] {
    const counts = new Map<string, number>();
    for (const row of rows) {
        const val = (row[column] || '').trim();
        if (!val) continue;
        counts.set(val, (counts.get(val) || 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);
}

// ─── Pivot / Aggregation Engine ────────────────────────────
// parseToNumber is exported above

function applyAggregation(values: number[], aggType: AggregationType): number {
    if (values.length === 0) return 0;
    switch (aggType) {
        case 'sum':
            return values.reduce((a, b) => a + b, 0);
        case 'avg':
            return values.reduce((a, b) => a + b, 0) / values.length;
        case 'count':
            return values.length;
        case 'min':
            return Math.min(...values);
        case 'max':
            return Math.max(...values);
        default:
            return values.reduce((a, b) => a + b, 0);
    }
}

/**
 * Aggregate data by groupBy column with the given aggregation.
 * Optionally filters rows based on filterColumn/filterValues.
 */
export function aggregateData(
    rows: Record<string, string>[],
    pivotConfig: PivotConfig,
): Record<string, unknown>[] {
    const { groupByColumn, valueColumns, aggregation, filters } = pivotConfig;

    // Apply filter if defined
    let filteredRows = rows;
    if (filters && filters.length > 0) {
        filteredRows = rows.filter((row) => {
            return filters.every((filter) => {
                const rowValStr = (row[filter.column] || '').trim().toLowerCase();
                const filterValStr = (filter.value || '').trim().toLowerCase();
                const rowValNum = parseToNumber(row[filter.column] || '0');
                const filterValNum = parseToNumber(filter.value || '0');

                switch (filter.operator) {
                    case 'equals':
                        return rowValStr === filterValStr;
                    case 'not_equals':
                        return rowValStr !== filterValStr;
                    case 'contains':
                        return rowValStr.includes(filterValStr);
                    case 'greater_than':
                        return !isNaN(rowValNum) && !isNaN(filterValNum) && rowValNum > filterValNum;
                    case 'less_than':
                        return !isNaN(rowValNum) && !isNaN(filterValNum) && rowValNum < filterValNum;
                    default:
                        return true;
                }
            });
        });
    }

    // Group rows by the groupBy column
    const groups = new Map<string, Record<string, number[]>>();
    for (const row of filteredRows) {
        const groupKey = (row[groupByColumn] || '').trim();
        if (!groupKey) continue;

        if (!groups.has(groupKey)) {
            const init: Record<string, number[]> = {};
            for (const vc of valueColumns) {
                init[vc] = [];
            }
            groups.set(groupKey, init);
        }

        const group = groups.get(groupKey)!;
        for (const vc of valueColumns) {
            const num = parseToNumber(row[vc] || '0');
            if (!isNaN(num)) {
                group[vc].push(num);
            }
        }
    }

    // Build aggregated data
    const result: Record<string, unknown>[] = [];
    for (const [groupKey, valuesMap] of groups) {
        const entry: Record<string, unknown> = { [groupByColumn]: groupKey };
        for (const vc of valueColumns) {
            entry[vc] = applyAggregation(valuesMap[vc] || [], aggregation);
        }
        result.push(entry);
    }

    return result;
}

/**
 * Build a chart config from a manual PivotConfig.
 */
export function buildManualChartConfig(
    pivotConfig: PivotConfig,
    rows: Record<string, string>[],
    chartId: string,
    chartType: 'line' | 'bar' | 'area' | 'pie',
): ChartConfig {
    const data = aggregateData(rows, pivotConfig);
    const aggLabel = pivotConfig.aggregation.toUpperCase();
    const valLabels = pivotConfig.valueColumns.join(', ');

    return {
        id: chartId,
        title: `${aggLabel}(${valLabels}) by ${pivotConfig.groupByColumn}`,
        type: chartType,
        xKey: pivotConfig.groupByColumn,
        yKeys: pivotConfig.valueColumns,
        data,
        allowedTypes: ['bar', 'line', 'area', 'pie'],
        pivotConfig,
        isManual: true,
    };
}

// ─── Smart Chart Recommendation ──────────────────────────────
function buildChartData(
    rows: Record<string, string>[],
    xKey: string,
    yKeys: string[],
    xType: ColumnType,
): Record<string, unknown>[] {
    const data = rows.map((row) => {
        const entry: Record<string, unknown> = { [xKey]: row[xKey] || '' };
        for (const yk of yKeys) {
            entry[yk] = parseToNumber(row[yk] || '0');
        }
        return entry;
    });

    // Sort by date if timeseries
    if (xType === 'date') {
        data.sort((a, b) => {
            const safeParseDate = (v: string) => {
                const parts = v.split(/[-/]/);
                if (parts.length === 3) {
                    // Try DD/MM/YYYY
                    const fDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    if (!isNaN(fDate.getTime())) return fDate.getTime();
                }
                const d = Date.parse(v);
                return isNaN(d) ? 0 : d;
            };
            const da = safeParseDate(String(a[xKey] || ''));
            const db = safeParseDate(String(b[xKey] || ''));
            return da - db;
        });
    }

    // Limit to 200 data points for performance
    if (data.length > 200) {
        const step = Math.ceil(data.length / 200);
        return data.filter((_, i) => i % step === 0);
    }

    return data;
}

function findLabelColumn(schema: ColumnSchema[]): ColumnSchema | null {
    // Prefer text columns with high uniqueness (like product names)
    const textCols = schema.filter((s) => s.type === 'text');
    if (textCols.length > 0) {
        // Pick the one with highest unique count relative to row count
        return textCols.reduce((best, col) =>
            col.uniqueCount > best.uniqueCount ? col : best,
            textCols[0],
        );
    }
    return null;
}

function recommendCharts(
    schema: ColumnSchema[],
    rows: Record<string, string>[],
): ChartConfig[] {
    const charts: ChartConfig[] = [];
    let chartId = 0;

    const dateColumns = schema.filter((s) => s.type === 'date');
    const numericColumns = schema.filter((s) => s.type === 'numeric');
    const categoricalColumns = schema.filter((s) => s.type === 'categorical');
    const labelColumn = findLabelColumn(schema);

    // 1. TimeSeries: date + numeric(s)
    if (dateColumns.length > 0 && numericColumns.length > 0) {
        const xCol = dateColumns[0];
        const yKeysSlice = numericColumns.slice(0, 3);

        charts.push({
            id: `chart-${chartId++}`,
            title: `${yKeysSlice.map((y) => y.name).join(', ')} over ${xCol.name}`,
            type: 'line',
            xKey: xCol.name,
            yKeys: yKeysSlice.map((y) => y.name),
            data: buildChartData(rows, xCol.name, yKeysSlice.map((y) => y.name), 'date'),
            allowedTypes: ['line', 'bar', 'area'],
        });
    }

    // 2. Label column (text) + numeric → bar chart with product names
    if (labelColumn && numericColumns.length > 0 && dateColumns.length === 0) {
        const yKeysSlice = numericColumns.slice(0, 3);

        charts.push({
            id: `chart-${chartId++}`,
            title: `${yKeysSlice.map((y) => y.name).join(', ')} by ${labelColumn.name}`,
            type: 'bar',
            xKey: labelColumn.name,
            yKeys: yKeysSlice.map((y) => y.name),
            data: buildChartData(rows, labelColumn.name, yKeysSlice.map((y) => y.name), 'text'),
            allowedTypes: ['bar', 'line', 'area'],
        });
    }

    // 3. Categorical breakdown + numeric (aggregated)
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        const catCol = categoricalColumns[0];
        const numCol = numericColumns[0];

        // Aggregate by category
        const aggMap = new Map<string, number>();
        for (const row of rows) {
            const cat = (row[catCol.name] || '').trim();
            if (!cat) continue;
            const val = parseToNumber(row[numCol.name] || '0');
            aggMap.set(cat, (aggMap.get(cat) || 0) + val);
        }

        const aggData = Array.from(aggMap.entries())
            .map(([name, total]) => ({ [catCol.name]: name, [numCol.name]: total }))
            .sort((a, b) => (b[numCol.name] as number) - (a[numCol.name] as number))
            .slice(0, 15);

        charts.push({
            id: `chart-${chartId++}`,
            title: `${numCol.name} by ${catCol.name}`,
            type: 'bar',
            xKey: catCol.name,
            yKeys: [numCol.name],
            data: aggData,
            allowedTypes: ['bar', 'line', 'area'],
        });
    }

    // 4. Pie chart for categorical distribution
    if (categoricalColumns.length > 0) {
        const catCol = categoricalColumns[0];
        const countMap = new Map<string, number>();
        for (const row of rows) {
            const val = (row[catCol.name] || '').trim();
            if (!val) continue;
            countMap.set(val, (countMap.get(val) || 0) + 1);
        }

        const pieData = Array.from(countMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        charts.push({
            id: `chart-${chartId++}`,
            title: `${catCol.name} Distribution`,
            type: 'pie',
            xKey: 'name',
            yKeys: ['value'],
            data: pieData,
            allowedTypes: ['pie', 'bar'],
        });
    }

    // 5. Fallback: 2+ numeric columns but no date/categorical/label → bar
    if (charts.length === 0 && numericColumns.length >= 2) {
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];

        charts.push({
            id: `chart-${chartId++}`,
            title: `${yCol.name} vs ${xCol.name}`,
            type: 'bar',
            xKey: xCol.name,
            yKeys: [yCol.name],
            data: buildChartData(rows, xCol.name, [yCol.name], 'numeric'),
            allowedTypes: ['bar', 'line', 'area'],
        });
    }

    return charts;
}

// ─── Main Analysis Pipeline ────────────────────────────────
export function analyzeDataset(
    headers: string[],
    rows: Record<string, string>[],
): DatasetAnalysis {
    const schema = buildSchema(headers, rows);

    const numericStats = schema
        .filter((s) => s.type === 'numeric')
        .map((s) => computeNumericStats(s.name, rows));

    const categoryCounts: Record<string, CategoryCount[]> = {};
    schema
        .filter((s) => s.type === 'categorical')
        .forEach((s) => {
            categoryCounts[s.name] = computeCategoryCounts(s.name, rows);
        });

    const recommendedCharts = recommendCharts(schema, rows);

    return {
        headers,
        rows,
        schema,
        numericStats,
        categoryCounts,
        recommendedCharts,
        totalRows: rows.length,
        totalColumns: headers.length,
    };
}
