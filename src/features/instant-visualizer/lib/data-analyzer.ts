import {
    ColumnSchema,
    ColumnType,
    NumericStats,
    CategoryCount,
    ChartConfig,
    ChartType,
    AggregationType,
    PivotConfig,
    DateGroupType,
    ColumnOverride,
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

    const rawHeaders = parseCSVLine(firstLine).map((h) => h.trim().replace(/^"|"$/g, ''));
    if (rawHeaders.filter(Boolean).length === 0) return { headers: [], rows: [], error: 'Failed to recognize your data. Please ensure the top row contains column headers (e.g., Name, Age, Price).' };

    const seenHeaders = new Set<string>();
    const headers = rawHeaders.map((h, idx) => {
        let name = h || `Column_${idx + 1}`;
        const originalName = name;
        let counter = 2;
        while (seenHeaders.has(name)) {
            name = `${originalName} (${counter})`;
            counter++;
        }
        seenHeaders.add(name);
        return name;
    });

    const rows: Record<string, string>[] = [];
    const numExpected = headers.length;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = parseCSVLine(line);
        
        // Potential UI issue 1 fix: Column mismatch detection
        if (values.length !== numExpected && values.length > 0) {
            return {
                headers,
                rows: [],
                error: `Data format mismatch on line ${i + 1}. Expected ${numExpected} columns but found ${values.length}. Please check if there are extra delimiters or missing values.`
            };
        }

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

function buildSchema(headers: string[], rows: Record<string, string>[], overrides?: Record<string, ColumnOverride>): ColumnSchema[] {
    return headers.map((name) => {
        const values = rows.map((r) => r[name] || '');
        const autoType = detectColumnType(values);
        const type = overrides?.[name]?.newType || autoType;
        const hidden = overrides?.[name]?.hidden || false;
        
        const nonEmpty = values.filter((v) => v.trim() !== '');
        const uniqueCount = new Set(nonEmpty.map((v) => v.toLowerCase())).size;
        const nullCount = values.length - nonEmpty.length;

        return {
            name,
            type,
            uniqueCount,
            nullCount,
            sampleValues: nonEmpty.slice(0, 5),
            hidden,
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

function formatDateGroup(dateStr: string, group: DateGroupType): string {
    const parts = dateStr.split(/[-/]/);
    let d = new Date(dateStr);
    if (parts.length === 3) {
        // Try DD/MM/YYYY if standard parse isn't quite right
        const fDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(fDate.getTime())) d = fDate;
    }
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed) && isNaN(d.getTime())) {
        d = new Date(parsed);
    }
    
    if (isNaN(d.getTime())) return dateStr;

    const year = d.getFullYear();
    
    switch (group) {
        case 'yearly':
            return year.toString();
        case 'monthly': {
            const mName = d.toLocaleString('default', { month: 'short' });
            return `${mName} ${year}`;
        }
        case 'weekly': {
            // Get week number
            const firstDayOfYear = new Date(year, 0, 1);
            const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `W${weekNum} ${year}`;
        }
        case 'daily':
        default:
            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${year}`;
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
        let groupKey = (row[groupByColumn] || '').trim();
        if (!groupKey) continue;

        if (pivotConfig.dateGroup) {
            groupKey = formatDateGroup(groupKey, pivotConfig.dateGroup);
        }

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

function generateInsight(data: Record<string, unknown>[], xKey: string, yKeys: string[], title: string, isTimeSeries: boolean): string {
    if (data.length === 0) return 'No data available to generate insights.';

    const y = yKeys[0];
    if (!y) return `Visualizing data for ${title}.`;

    // Sort to find max/min
    const validData = data.filter(d => typeof d[y] === 'number');
    if (validData.length === 0) return `Showing distribution of ${y}.`;

    validData.sort((a, b) => (b[y] as number) - (a[y] as number));
    const highest = validData[0];
    const lowest = validData[validData.length - 1];

    // Outlier detection (AI-Lite)
    const values = validData.map(d => d[y] as number);
    const mean = values.reduce((s, val) => s + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((s, val) => s + Math.pow(val - mean, 2), 0) / values.length);
    const outlier = validData.find(d => (d[y] as number) > mean + 2.5 * stdDev);

    const fmt = (n: number) => n >= 1000 ? (n/1000).toFixed(1) + 'k' : n.toLocaleString();

    if (outlier) {
        return `⚠️ Anomaly detected: ${outlier[xKey]} has an unusually high value of ${fmt(outlier[y] as number)}. Peaks at ${highest[y]}.`;
    }

    if (isTimeSeries) {
        // Find if growing or shrinking
        const first = validData[validData.length - 1][y] as number;
        const last = validData[0][y] as number;
        const diff = last - first;
        const trend = diff > 0 ? 'increased' : 'decreased';
        const change = first !== 0 ? Math.abs((diff / first) * 100).toFixed(1) : '0';

        return `Showing ${y} trends. Peaks at ${fmt(highest[y] as number)} on ${highest[xKey]}. Overall ${trend} by ${change}% during this period.`;
    }

    const total = validData.reduce((sum, item) => sum + (item[y] as number), 0);
    const highestPct = total > 0 ? (((highest[y] as number) / total) * 100).toFixed(1) : '0';

    return `${highest[xKey]} leads with ${fmt(highest[y] as number)} (${highestPct}% of total). Lowest is ${fmt(lowest[y] as number)}.`;
}

/**
 * Build a chart config from a manual PivotConfig.
 */
export function buildManualChartConfig(
    pivotConfig: PivotConfig,
    rows: Record<string, string>[],
    chartId: string,
    chartType: ChartType,
): ChartConfig {
    const data = aggregateData(rows, pivotConfig);
    const aggLabel = pivotConfig.aggregation.toUpperCase();
    const valLabels = pivotConfig.valueColumns.join(', ');
    const title = `${aggLabel}(${valLabels}) by ${pivotConfig.groupByColumn}`;
    const insight = generateInsight(data, pivotConfig.groupByColumn, pivotConfig.valueColumns, title, pivotConfig.dateGroup ? true : false);

    return {
        id: chartId,
        title,
        type: chartType,
        xKey: pivotConfig.groupByColumn,
        yKeys: pivotConfig.valueColumns,
        data,
        allowedTypes: ['bar', 'line', 'area', 'pie', 'scatter'],
        pivotConfig,
        isManual: true,
        insight,
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

    const dateColumns = schema.filter((s) => s.type === 'date' || s.name.toLowerCase().includes('tanggal') || s.name.toLowerCase().includes('date'));
    const numericColumns = schema.filter((s) => s.type === 'numeric');
    const categoricalColumns = schema.filter((s) => s.type === 'categorical');
    const labelColumn = findLabelColumn(schema);

    // 1. TimeSeries: date + numeric(s)
    if (dateColumns.length > 0 && numericColumns.length > 0) {
        const xCol = dateColumns[0];
        const yKeysSlice = numericColumns.slice(0, 3);
        const yKeysNames = yKeysSlice.map((y) => y.name);
        const title = `${yKeysNames.join(', ')} over ${xCol.name}`;
        const data = buildChartData(rows, xCol.name, yKeysNames, 'date');
        
        charts.push({
            id: `chart-${chartId++}`,
            title,
            type: 'line',
            xKey: xCol.name,
            yKeys: yKeysNames,
            data,
            allowedTypes: ['line', 'bar', 'area'],
            insight: generateInsight(data, xCol.name, yKeysNames, title, true),
        });
    }

    // 2. Label column (text) + numeric → bar chart with product names
    if (labelColumn && numericColumns.length > 0 && dateColumns.length === 0) {
        const yKeysSlice = numericColumns.slice(0, 3);
        const yKeysNames = yKeysSlice.map((y) => y.name);
        // If more than 1 numeric column, recommend stacked bar for comparison
        const isStacked = yKeysNames.length > 1;
        const title = isStacked ? `Comparison of ${yKeysNames.join(' & ')} by ${labelColumn.name}` : `${yKeysNames[0]} by ${labelColumn.name}`;
        const data = buildChartData(rows, labelColumn.name, yKeysNames, 'text');

        charts.push({
            id: `chart-${chartId++}`,
            title,
            type: 'bar',
            xKey: labelColumn.name,
            yKeys: yKeysNames,
            data,
            allowedTypes: ['bar', 'line', 'area'],
            insight: generateInsight(data, labelColumn.name, yKeysNames, title, false),
            stacked: isStacked,
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

        const title = `${numCol.name} by ${catCol.name}`;
        charts.push({
            id: `chart-${chartId++}`,
            title,
            type: 'bar',
            xKey: catCol.name,
            yKeys: [numCol.name],
            data: aggData,
            allowedTypes: ['bar', 'line', 'area'],
            insight: generateInsight(aggData, catCol.name, [numCol.name], title, false),
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

        const title = `${catCol.name} Distribution`;
        charts.push({
            id: `chart-${chartId++}`,
            title,
            type: 'pie',
            xKey: 'name',
            yKeys: ['value'],
            data: pieData,
            allowedTypes: ['pie', 'bar'],
            insight: generateInsight(pieData, 'name', ['value'], title, false),
        });
    }

    // 5. Scatter Plot if 2 numeric columns exist
    if (charts.length > 0 && numericColumns.length >= 2) {
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];
        
        const title = `Correlation between ${yCol.name} & ${xCol.name}`;
        const data = buildChartData(rows, xCol.name, [yCol.name], 'numeric');
        charts.push({
            id: `chart-${chartId++}`,
            title,
            type: 'scatter',
            xKey: xCol.name,
            yKeys: [yCol.name],
            data,
            allowedTypes: ['scatter', 'bar', 'line'],
            insight: generateInsight(data, xCol.name, [yCol.name], title, false),
        });
    }

    // 6. Fallback: 2+ numeric columns but no date/categorical/label → bar
    if (charts.length === 0 && numericColumns.length >= 2) {
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];

        const title = `${yCol.name} vs ${xCol.name}`;
        const data = buildChartData(rows, xCol.name, [yCol.name], 'numeric');
        charts.push({
            id: `chart-${chartId++}`,
            title,
            type: 'bar',
            xKey: xCol.name,
            yKeys: [yCol.name],
            data,
            allowedTypes: ['bar', 'line', 'area', 'scatter'],
            insight: generateInsight(data, xCol.name, [yCol.name], title, false),
        });
    }

    return charts;
}

// ─── Main Analysis Pipeline ────────────────────────────────
export function analyzeDataset(
    headers: string[],
    rows: Record<string, string>[],
    overrides?: Record<string, ColumnOverride>
): DatasetAnalysis {
    let schema = buildSchema(headers, rows, overrides);
    
    // Filter hidden columns out of the analysis
    schema = schema.filter(s => !s.hidden);

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
        headers: schema.map(s => s.name),
        rows,
        schema,
        numericStats,
        categoryCounts,
        recommendedCharts,
        totalRows: rows.length,
        totalColumns: schema.length,
    };
}
