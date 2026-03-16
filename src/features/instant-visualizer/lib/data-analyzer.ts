import {
    ColumnSchema,
    ColumnType,
    NumericStats,
    CategoryCount,
    ChartConfig,
    DatasetAnalysis,
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
        : firstLine.includes(',')
          ? ','
          : firstLine.includes(';')
            ? ';'
            : '\t';

    const headers = firstLine
        .split(delimiter)
        .map((h) => h.trim().replace(/^"|"$/g, ''))
        .filter((h) => h);

    if (headers.length === 0) return { headers: [], rows: [], error: 'No valid headers found.' };

    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(delimiter);
        const rowData: Record<string, string> = {};
        let hasData = false;

        headers.forEach((header, index) => {
            let val = values[index] ? values[index].trim() : '';
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

function isNumericValue(value: string): boolean {
    if (!value) return false;
    const cleaned = value.replace(/,/g, '').trim();
    return cleaned !== '' && !isNaN(Number(cleaned));
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
        const cleaned = (row[column] || '').replace(/,/g, '');
        const n = Number(cleaned);
        if (!isNaN(n) && cleaned.trim() !== '') nums.push(n);
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

// ─── Smart Chart Recommendation ──────────────────────────────
function parseToNumber(value: string): number {
    return Number(value.replace(/,/g, ''));
}

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
            const da = Date.parse(String(a[xKey]));
            const db = Date.parse(String(b[xKey]));
            return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db);
        });
    }

    // Limit to 200 data points for performance
    if (data.length > 200) {
        const step = Math.ceil(data.length / 200);
        return data.filter((_, i) => i % step === 0);
    }

    return data;
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

    // 2. Categorical breakdown + numeric
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

    // 3. Pie chart for categorical distribution
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

    // 4. If we have 2+ numeric columns but no date/categorical, scatter-like bar
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
