'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    ClipboardPaste,
    Trash2,
    Table2,
    BarChart3,
    TrendingUp,
    ArrowUpDown,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    BarChart2,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    Upload,
    Hash,
    Layers,
    AlertCircle,
} from 'lucide-react';
import { parsePastedData, analyzeDataset } from '../lib/data-analyzer';
import type { DatasetAnalysis, ChartConfig, ChartType, NumericStats } from '../types';

// ─── Color Palette (from globals.css) ──────────────────────
const CHART_COLORS = [
    '#0EA5E9', // primary-500
    '#F97316', // accent-500
    '#22C55E', // success-500
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F59E0B', // amber
    '#6366F1', // indigo
];

const PIE_COLORS = [
    '#0EA5E9', '#F97316', '#22C55E', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F59E0B', '#6366F1',
    '#EF4444', '#06B6D4',
];

// ─── Format Utilities ──────────────────────────────────────
function formatNumber(n: number): string {
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    if (Number.isInteger(n)) return n.toLocaleString();
    return n.toFixed(2);
}

function formatAxisTick(value: unknown): string {
    if (typeof value === 'number') return formatNumber(value);
    const s = String(value);
    return s.length > 12 ? `${s.slice(0, 12)}…` : s;
}

// ─── Chart Type Icon Map ───────────────────────────────────
const CHART_TYPE_ICONS: Record<ChartType, React.ComponentType<{ className?: string }>> = {
    line: LineChartIcon,
    bar: BarChart2,
    area: AreaChartIcon,
    pie: PieChartIcon,
};

// ─── Custom Tooltip ────────────────────────────────────────
interface TooltipPayloadEntry {
    name: string;
    value: number;
    color: string;
}

function CustomTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
}): React.ReactElement | null {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-medium px-3 py-2 text-sm">
            <p className="font-medium text-gray-800 mb-1">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600">
                    <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.name}:</span>
                    <span className="font-semibold text-gray-900">
                        {formatNumber(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── KPI Card ──────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}): React.ReactElement {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 shadow-soft hover:shadow-medium transition-shadow">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}14` }}
            >
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Chart Card ────────────────────────────────────────────
function ChartCard({ config, onTypeChange }: {
    config: ChartConfig;
    onTypeChange: (id: string, type: ChartType) => void;
}): React.ReactElement {
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const currentType = config.type;

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-soft hover:shadow-medium transition-shadow overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-gray-700 truncate pr-2">
                    {config.title}
                </h3>
                {config.allowedTypes.length > 1 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowTypeSelector(!showTypeSelector)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors px-2 py-1 rounded-md hover:bg-primary-50"
                        >
                            {(() => {
                                const TypeIcon = CHART_TYPE_ICONS[currentType];
                                return <TypeIcon className="w-3.5 h-3.5" />;
                            })()}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showTypeSelector && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowTypeSelector(false)} />
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-medium z-20 py-1 min-w-[120px]">
                                    {config.allowedTypes.map((t) => {
                                        const TypeIcon = CHART_TYPE_ICONS[t];
                                        return (
                                            <button
                                                key={t}
                                                onClick={() => {
                                                    onTypeChange(config.id, t);
                                                    setShowTypeSelector(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs capitalize hover:bg-gray-50 transition-colors ${
                                                    t === currentType ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-600'
                                                }`}
                                            >
                                                <TypeIcon className="w-3.5 h-3.5" />
                                                {t} chart
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="px-3 pb-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart(config)}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function renderChart(config: ChartConfig): React.ReactElement {
    const { type, xKey, yKeys, data } = config;

    if (type === 'pie') {
        return (
            <PieChart>
                <Pie
                    data={data}
                    dataKey={yKeys[0]}
                    nameKey={xKey}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={2}
                    label={({ name, percent }: { name: string; percent: number }) =>
                        `${String(name).length > 10 ? String(name).slice(0, 10) + '…' : name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    style={{ fontSize: 11 }}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value)} />
            </PieChart>
        );
    }

    const commonProps = {
        data,
        margin: { top: 8, right: 16, left: 0, bottom: 0 },
    };

    const axes = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
            <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11, fill: '#71717A' }}
                tickFormatter={formatAxisTick}
                axisLine={{ stroke: '#E4E4E7' }}
                tickLine={false}
            />
            <YAxis
                tick={{ fontSize: 11, fill: '#71717A' }}
                tickFormatter={formatAxisTick}
                axisLine={false}
                tickLine={false}
                width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </>
    );

    if (type === 'line') {
        return (
            <LineChart {...commonProps}>
                {axes}
                {yKeys.map((yk, i) => (
                    <Line
                        key={yk}
                        type="monotone"
                        dataKey={yk}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={data.length < 50 ? { r: 3, fill: '#fff', strokeWidth: 2 } : false}
                        activeDot={{ r: 5 }}
                    />
                ))}
            </LineChart>
        );
    }

    if (type === 'area') {
        return (
            <AreaChart {...commonProps}>
                {axes}
                {yKeys.map((yk, i) => (
                    <Area
                        key={yk}
                        type="monotone"
                        dataKey={yk}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                    />
                ))}
            </AreaChart>
        );
    }

    // bar (default)
    return (
        <BarChart {...commonProps}>
            {axes}
            {yKeys.map((yk, i) => (
                <Bar
                    key={yk}
                    dataKey={yk}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                />
            ))}
        </BarChart>
    );
}

// ─── Data Table ────────────────────────────────────────────
function DataTable({ headers, rows }: {
    headers: string[];
    rows: Record<string, string>[];
}): React.ReactElement {
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const handleSort = useCallback((col: string) => {
        if (sortCol === col) {
            setSortAsc((prev) => !prev);
        } else {
            setSortCol(col);
            setSortAsc(true);
        }
    }, [sortCol]);

    const displayRows = useMemo(() => {
        let sorted = [...rows];
        if (sortCol) {
            sorted.sort((a, b) => {
                const va = a[sortCol] || '';
                const vb = b[sortCol] || '';
                const na = Number(va.replace(/,/g, ''));
                const nb = Number(vb.replace(/,/g, ''));
                if (!isNaN(na) && !isNaN(nb)) {
                    return sortAsc ? na - nb : nb - na;
                }
                return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            });
        }
        if (!expanded) sorted = sorted.slice(0, 100);
        return sorted;
    }, [rows, sortCol, sortAsc, expanded]);

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-soft overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700">Data Preview</h3>
                    <span className="text-xs text-gray-400">
                        {rows.length} rows × {headers.length} columns
                    </span>
                </div>
                {rows.length > 100 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                        {expanded ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                        ) : (
                            <>Show all ({rows.length}) <ChevronDown className="w-3 h-3" /></>
                        )}
                    </button>
                )}
            </div>
            <div className="overflow-auto max-h-[400px] scrollbar-themed">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 w-12">#</th>
                            {headers.map((h) => (
                                <th
                                    key={h}
                                    onClick={() => handleSort(h)}
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer hover:text-primary-600 select-none whitespace-nowrap group"
                                >
                                    <span className="flex items-center gap-1">
                                        {h}
                                        <ArrowUpDown className={`w-3 h-3 transition-colors ${
                                            sortCol === h ? 'text-primary-500' : 'text-gray-300 group-hover:text-gray-400'
                                        }`} />
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayRows.map((row, idx) => (
                            <tr
                                key={idx}
                                className="border-b border-gray-50 hover:bg-primary-50/40 transition-colors"
                            >
                                <td className="px-3 py-1.5 text-xs text-gray-300 font-mono">{idx + 1}</td>
                                {headers.map((h) => (
                                    <td key={h} className="px-3 py-1.5 text-gray-600 whitespace-nowrap max-w-[200px] truncate">
                                        {row[h] || <span className="text-gray-300 italic">—</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Paste Zone ────────────────────────────────────────────
function PasteZone({ onData }: { onData: (text: string) => void }): React.ReactElement {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData.getData('text/plain');
        if (text.trim()) {
            e.preventDefault();
            onData(text);
        }
    }, [onData]);

    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string' && text.trim()) {
                onData(text);
            }
        };
        reader.readAsText(file);
    }, [onData]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileRead(file);
    }, [handleFileRead]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileRead(file);
    }, [handleFileRead]);

    return (
        <div
            className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
                dragOver
                    ? 'border-primary-400 bg-primary-50/50 scale-[1.005]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                    <ClipboardPaste className="w-7 h-7 text-primary-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Paste your data here
                </h2>
                <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
                    Copy table data from Excel, Google Sheets, or any spreadsheet and paste it below.
                    CSV and TSV formats are supported.
                </p>

                <textarea
                    ref={textareaRef}
                    onPaste={handlePaste}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val.trim()) onData(val);
                    }}
                    placeholder="Paste data here (Ctrl+V)..."
                    className="w-full max-w-2xl h-32 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 resize-none font-mono bg-gray-50/50"
                    spellCheck={false}
                />

                <div className="flex items-center gap-3 mt-4">
                    <span className="text-xs text-gray-300">or</span>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Upload CSV file
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.tsv,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────
export function InstantVisualizerContent(): React.ReactElement {
    const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
    const [chartOverrides, setChartOverrides] = useState<Record<string, ChartType>>({});
    const [error, setError] = useState<string | null>(null);

    const handleData = useCallback((text: string) => {
        setError(null);
        const { headers, rows, error: parseError } = parsePastedData(text);
        if (parseError) {
            setError(parseError);
            return;
        }
        if (rows.length === 0) {
            setError('No data rows found. Make sure your data includes a header row and at least one data row.');
            return;
        }
        const result = analyzeDataset(headers, rows);
        setAnalysis(result);
        setChartOverrides({});
    }, []);

    const handleClear = useCallback(() => {
        setAnalysis(null);
        setChartOverrides({});
        setError(null);
    }, []);

    const handleChartTypeChange = useCallback((id: string, type: ChartType) => {
        setChartOverrides((prev) => ({ ...prev, [id]: type }));
    }, []);

    const chartsWithOverrides = useMemo(() => {
        if (!analysis) return [];
        return analysis.recommendedCharts.map((c) => ({
            ...c,
            type: chartOverrides[c.id] || c.type,
        }));
    }, [analysis, chartOverrides]);

    // Build KPI cards data
    const kpiCards = useMemo(() => {
        if (!analysis) return [];
        const cards: { label: string; value: string; sub?: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [];

        cards.push({
            label: 'Total Rows',
            value: analysis.totalRows.toLocaleString(),
            sub: `${analysis.totalColumns} columns`,
            icon: FileSpreadsheet,
            color: '#0EA5E9',
        });

        const numCols = analysis.schema.filter((s) => s.type === 'numeric');
        const catCols = analysis.schema.filter((s) => s.type === 'categorical');
        const dateCols = analysis.schema.filter((s) => s.type === 'date');

        if (numCols.length > 0) {
            cards.push({
                label: 'Numeric Columns',
                value: numCols.length.toString(),
                sub: numCols.map((c) => c.name).slice(0, 3).join(', '),
                icon: Hash,
                color: '#8B5CF6',
            });
        }

        if (catCols.length > 0) {
            cards.push({
                label: 'Categories',
                value: catCols.length.toString(),
                sub: catCols.map((c) => c.name).slice(0, 3).join(', '),
                icon: Layers,
                color: '#F97316',
            });
        }

        if (dateCols.length > 0) {
            cards.push({
                label: 'Date Columns',
                value: dateCols.length.toString(),
                sub: dateCols.map((c) => c.name).slice(0, 3).join(', '),
                icon: TrendingUp,
                color: '#22C55E',
            });
        }

        // Add top numeric stat if available
        if (analysis.numericStats.length > 0) {
            const topStat: NumericStats = analysis.numericStats[0];
            cards.push({
                label: `Sum of ${topStat.column}`,
                value: formatNumber(topStat.sum),
                sub: `avg ${formatNumber(topStat.mean)}`,
                icon: BarChart3,
                color: '#EC4899',
            });
        }

        return cards;
    }, [analysis]);

    // ─── No data yet → show paste zone ─────────────────────
    if (!analysis) {
        return (
            <div className="space-y-4">
                <PasteZone onData={handleData} />
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // ─── Dashboard ─────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-500" />
                    <h2 className="text-base font-semibold text-gray-800">
                        Dashboard
                    </h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {analysis.totalRows} rows
                    </span>
                </div>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Data
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {kpiCards.map((card, i) => (
                    <KpiCard key={i} {...card} />
                ))}
            </div>

            {/* Charts */}
            {chartsWithOverrides.length > 0 && (
                <div className={`grid gap-4 ${
                    chartsWithOverrides.length === 1
                        ? 'grid-cols-1'
                        : chartsWithOverrides.length === 2
                          ? 'grid-cols-1 lg:grid-cols-2'
                          : 'grid-cols-1 lg:grid-cols-2'
                }`}>
                    {chartsWithOverrides.map((config) => (
                        <ChartCard
                            key={config.id}
                            config={config}
                            onTypeChange={handleChartTypeChange}
                        />
                    ))}
                </div>
            )}

            {chartsWithOverrides.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                        No charts could be generated automatically. Your data may only contain text fields.
                    </p>
                </div>
            )}

            {/* Data Table */}
            <DataTable headers={analysis.headers} rows={analysis.rows} />
        </div>
    );
}
