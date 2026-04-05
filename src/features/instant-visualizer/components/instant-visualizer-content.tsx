'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    ScatterChart,
    Scatter,
    ZAxis,
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
    Settings2,
    Plus,
    X,
    Filter,
    Group,
    Calculator,
    Check,
    Loader2,
    Download,
    Maximize2,
    Minimize2,
    Lightbulb,
    FileImage,
    FileText,
    Activity, // For Scatter
    Type, // Column Type
    EyeOff, // Hide Column
    LayoutDashboard,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { parsePastedData, analyzeDataset, buildManualChartConfig, parseToNumber } from '../lib/data-analyzer';
import type { DatasetAnalysis, ChartConfig, ChartType, NumericStats, PivotConfig, AggregationType, ColumnSchema, FilterCondition, FilterOperator, DateGroupType, ColumnOverride } from '../types';

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

// ─── Constants ────────────────────────────────────
const AGG_LABELS: Record<AggregationType, string> = {
    sum: 'Total Sum',
    avg: 'Average',
    count: 'Count',
    min: 'Minimum',
    max: 'Maximum',
};

const FILTER_OPERATOR_LABELS: Record<FilterOperator, string> = {
    equals: 'Equals',
    not_equals: 'Not Equals',
    contains: 'Contains',
    greater_than: 'Greater Than',
    less_than: 'Less Than',
};

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
    scatter: Activity,
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
function KpiCard({ label, value, sub, icon: Icon, color, index = 0 }: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
    index?: number;
}): React.ReactElement {
    return (
        <div 
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 shadow-soft hover:shadow-medium transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            style={{ animationDelay: `${index * 75}ms` }}
        >
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

// ─── Pivot Config Panel ────────────────────────────────────
function PivotConfigPanel({
    schema,
    onApply,
    onCancel,
    initialConfig,
}: {
    schema: ColumnSchema[];
    rows: Record<string, string>[];
    onApply: (config: PivotConfig, chartType: ChartType) => void;
    onCancel: () => void;
    initialConfig?: PivotConfig;
}): React.ReactElement {
    const numericCols = schema.filter((s) => s.type === 'numeric');
    const allCols = schema;

    const [groupBy, setGroupBy] = useState(initialConfig?.groupByColumn || allCols[0]?.name || '');
    const [valueCols, setValueCols] = useState<string[]>(
        initialConfig?.valueColumns || (numericCols[0] ? [numericCols[0].name] : []),
    );
    const [aggregation, setAggregation] = useState<AggregationType>(initialConfig?.aggregation || 'sum');
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [filters, setFilters] = useState<FilterCondition[]>(initialConfig?.filters || []);
    const [showFilters, setShowFilters] = useState((initialConfig?.filters?.length || 0) > 0);

    const [newFilterCol, setNewFilterCol] = useState('');
    const [newFilterOp, setNewFilterOp] = useState<FilterOperator>('equals');
    const [newFilterVal, setNewFilterVal] = useState('');
    const [dateGroup, setDateGroup] = useState<DateGroupType>(initialConfig?.dateGroup || 'daily');

    const isDateCol = useMemo(() => {
        return allCols.find(c => c.name === groupBy)?.type === 'date';
    }, [groupBy, allCols]);

    const toggleValueCol = (col: string) => {
        setValueCols((prev) =>
            prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
        );
    };

    const addFilter = () => {
        if (!newFilterCol || !newFilterVal) return;
        setFilters([...filters, { column: newFilterCol, operator: newFilterOp, value: newFilterVal }]);
        setNewFilterCol('');
        setNewFilterVal('');
    };

    const removeFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handleApply = () => {
        if (!groupBy || valueCols.length === 0) return;
        onApply(
            {
                groupByColumn: groupBy,
                valueColumns: valueCols,
                aggregation,
                filters: filters.length > 0 ? filters : undefined,
                dateGroup: isDateCol ? dateGroup : undefined,
            },
            chartType,
        );
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-medium overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Custom Chart Builder</h3>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-5 space-y-5">
                {/* Group By */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        <Group className="w-3.5 h-3.5" />
                        Select Category (X-Axis)
                    </label>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                    >
                        {allCols.map((col) => (
                            <option key={col.name} value={col.name}>
                                {col.name} ({col.type})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Grouping (Only if X-Axis is Date) */}
                {isDateCol && (
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Date Grouping
                        </label>
                        <div className="flex gap-1.5">
                            {(['daily', 'weekly', 'monthly', 'yearly'] as DateGroupType[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setDateGroup(mode)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize ${
                                        dateGroup === mode
                                            ? 'bg-primary-50 border-primary-300 text-primary-700'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Value Columns */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        <Hash className="w-3.5 h-3.5" />
                        Select Value (Y-Axis)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {numericCols.map((col) => {
                            const isSelected = valueCols.includes(col.name);
                            return (
                                <button
                                    key={col.name}
                                    onClick={() => toggleValueCol(col.name)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                        isSelected
                                            ? 'bg-primary-50 border-primary-300 text-primary-700'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                    {col.name}
                                </button>
                            );
                        })}
                        {numericCols.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No numeric columns detected</p>
                        )}
                    </div>
                </div>

                {/* Aggregation */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        <Calculator className="w-3.5 h-3.5" />
                        Aggregation Method
                    </label>
                    <div className="flex gap-1.5">
                        {(Object.entries(AGG_LABELS) as [AggregationType, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setAggregation(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                    aggregation === key
                                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Type */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2" title="The visual style of the chart">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Chart Type
                    </label>
                    <p className="text-[10px] text-gray-400 mb-2">Select the best visualization for your data type.</p>
                    <div className="flex gap-1.5">
                        {(['bar', 'line', 'area', 'pie'] as ChartType[]).map((t) => {
                            const TypeIcon = CHART_TYPE_ICONS[t];
                            return (
                                <button
                                    key={t}
                                    onClick={() => setChartType(t)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize ${
                                        chartType === t
                                            ? 'bg-primary-50 border-primary-300 text-primary-700'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    <TypeIcon className="w-3.5 h-3.5" />
                                    {t}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter Toggle */}
                <div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {showFilters ? 'Close Filter' : 'Filter Data'}
                        {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showFilters && (
                        <div className="mt-3 space-y-3">
                            {/* Active Filters */}
                            {filters.length > 0 && (
                                <div className="space-y-1.5">
                                    {filters.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                            <span className="text-xs text-gray-600">
                                                <span className="font-semibold text-gray-800">{f.column}</span>{' '}
                                                <span className="text-primary-600">{FILTER_OPERATOR_LABELS[f.operator]}</span>{' '}
                                                <span className="font-semibold text-gray-800">&quot;{f.value}&quot;</span>
                                            </span>
                                            <button
                                                onClick={() => removeFilter(i)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Filter */}
                            <div className="flex gap-2">
                                <select
                                    value={newFilterCol}
                                    onChange={(e) => setNewFilterCol(e.target.value)}
                                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white"
                                >
                                    <option value="">Select column...</option>
                                    {allCols.map((col) => (
                                        <option key={col.name} value={col.name}>
                                            {col.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={newFilterOp}
                                    onChange={(e) => setNewFilterOp(e.target.value as FilterOperator)}
                                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white"
                                >
                                    {(Object.entries(FILTER_OPERATOR_LABELS) as [FilterOperator, string][]).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={newFilterVal}
                                    onChange={(e) => setNewFilterVal(e.target.value)}
                                    placeholder="Filter value..."
                                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 w-24"
                                />
                                <button
                                    onClick={addFilter}
                                    disabled={!newFilterCol || !newFilterVal}
                                    className="shrink-0 flex items-center justify-center p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Apply */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleApply}
                        disabled={!groupBy || valueCols.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-soft"
                    >
                        <Check className="w-4 h-4" />
                        Create Chart
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Chart Card ────────────────────────────────────────────
function ChartCard({ config, onTypeChange, index = 0, onRemove }: {
    config: ChartConfig;
    onTypeChange: (id: string, type: ChartType) => void;
    index?: number;
    onRemove?: (id: string) => void;
}): React.ReactElement {
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const currentType = config.type;
    const chartRef = useRef<HTMLDivElement>(null);

    const handleExportPNG = async () => {
        if (!chartRef.current) return;
        try {
            const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            canvas.toBlob((blob) => {
                if (blob) saveAs(blob, `${config.title.replace(/\s+/g, '_')}_chart.png`);
            });
        } catch (err) {
            console.error('Error exporting PNG:', err);
        }
    };

    const handleExportCSV = () => {
        if (!config.data || config.data.length === 0) return;
        const keys = [config.xKey, ...config.yKeys];
        const csvContent = [
            keys.join(','),
            ...config.data.map(row => keys.map(k => `"${String(row[k] || '')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${config.title.replace(/\s+/g, '_')}_data.csv`);
    };

    const cardContent = (
        <div 
            className={`bg-white border border-gray-100 flex flex-col transition-shadow ${isFullscreen ? 'w-full h-full rounded-none px-4 py-6' : 'rounded-xl shadow-soft hover:shadow-medium overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both'}`}
            style={!isFullscreen ? { animationDelay: `${index * 100}ms` } : {}}
            onMouseLeave={() => { setShowTypeSelector(false); setShowExportMenu(false); }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 truncate pr-2" title={config.title}>
                        {config.title}
                    </h3>
                    {config.isManual && config.pivotConfig && (
                        <p className="text-xs text-primary-500 mt-0.5" title={config.pivotConfig.filters?.length ? `${config.pivotConfig.filters.length} Filter(s) applied` : undefined}>
                            {AGG_LABELS[config.pivotConfig.aggregation]} · Manual
                            {config.pivotConfig.dateGroup && ` · ${config.pivotConfig.dateGroup}`}
                            {(config.pivotConfig.filters?.length || 0) > 0 && (
                                <span className="text-gray-400"> · {config.pivotConfig.filters!.length} Filter(s)</span>
                            )}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {/* Chart Type Selector */}
                    {config.allowedTypes.length > 1 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowTypeSelector(!showTypeSelector)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors px-2 py-1.5 rounded-md hover:bg-primary-50"
                                title="Change Chart Type"
                            >
                                {(() => {
                                    const TypeIcon = CHART_TYPE_ICONS[currentType];
                                    return <TypeIcon className="w-4 h-4" />;
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

                    {/* Export Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-primary-600 transition-colors rounded-md hover:bg-primary-50"
                            title="Export options"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        {showExportMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-medium z-20 py-1 min-w-[140px]">
                                    <button
                                        onClick={() => { handleExportPNG(); setShowExportMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <FileImage className="w-3.5 h-3.5 text-primary-500" />
                                        Save as PNG
                                    </button>
                                    <button
                                        onClick={() => { handleExportCSV(); setShowExportMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5 text-green-500" />
                                        Export Data (CSV)
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-primary-600 transition-colors rounded-md hover:bg-primary-50"
                        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    {/* Remove Chart */}
                    {onRemove && (
                        <button
                            onClick={() => onRemove(config.id)}
                            className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                            title="Remove chart"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div className={`px-3 pb-2 relative min-w-0 min-h-0 ${isFullscreen ? 'min-h-[400px] flex-1' : 'h-[280px]'}`} ref={chartRef}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart(config)}
                </ResponsiveContainer>
            </div>

            {/* Narrative Insight */}
            {config.insight && (
                <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-start gap-2 shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                        {config.insight}
                    </p>
                </div>
            )}
        </div>
    );

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-auto p-4 sm:p-8">
                {cardContent}
            </div>
        );
    }

    return cardContent;
}

function renderChart(config: ChartConfig): React.ReactElement {
    const { type, xKey, yKeys, data } = config;

    if (type === 'pie') {
        const sortedData = [...data].sort((a, b) => (Number(b[yKeys[0]]) || 0) - (Number(a[yKeys[0]]) || 0));
        let displayData = sortedData;
        
        if (sortedData.length > 7) {
            const top = sortedData.slice(0, 6);
            const others = sortedData.slice(6);
            const othersSum = others.reduce((sum, curr) => sum + (Number(curr[yKeys[0]]) || 0), 0);
            displayData = [...top, { [xKey]: 'Others', [yKeys[0]]: othersSum }];
        }

        return (
            <PieChart>
                <Pie
                    data={displayData}
                    dataKey={yKeys[0]}
                    nameKey={xKey}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={2}
                    label={({ name, percent }: { name?: string | number; percent?: number }) =>
                        `${String(name || '').length > 10 ? String(name || '').slice(0, 10) + '…' : (name || '')} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    style={{ fontSize: 11 }}
                >
                    {displayData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number | string | readonly (string | number)[] | undefined) => formatNumber(Number(Array.isArray(value) ? value[0] : value || 0))} />
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

    if (type === 'scatter') {
        return (
            <ScatterChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                <XAxis type="number" dataKey={xKey} name={xKey} tick={{ fontSize: 11, fill: '#71717A' }} tickFormatter={formatAxisTick} axisLine={{ stroke: '#E4E4E7' }} tickLine={false} />
                <YAxis type="number" dataKey={yKeys[0]} name={yKeys[0]} tick={{ fontSize: 11, fill: '#71717A' }} tickFormatter={formatAxisTick} axisLine={false} tickLine={false} width={50} />
                <ZAxis type="number" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                <Scatter name={yKeys[0]} data={data} fill={CHART_COLORS[0]}>
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Scatter>
            </ScatterChart>
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
                    stackId={config.stacked ? "a" : undefined}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    radius={config.stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    maxBarSize={48}
                />
            ))}
        </BarChart>
    );
}

// ─── Data Table ────────────────────────────────────────────
function DataTable({ schema, rows, onOverrideChange }: {
    schema: ColumnSchema[];
    rows: Record<string, string>[];
    overrides?: Record<string, ColumnOverride>;
    onOverrideChange?: (colName: string, override: Partial<ColumnOverride>) => void;
}): React.ReactElement {
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);
    const [visibleCount, setVisibleCount] = useState(100);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCol, setEditingCol] = useState<string | null>(null);

    const visibleSchema = useMemo(() => schema.filter(s => !s.hidden), [schema]);
    const headers = useMemo(() => visibleSchema.map(s => s.name), [visibleSchema]);

    const handleSort = useCallback((col: string) => {
        if (sortCol === col) {
            setSortAsc((prev) => !prev);
        } else {
            setSortCol(col);
            setSortAsc(true);
        }
    }, [sortCol]);

    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return rows;
        const q = searchQuery.toLowerCase();
        return rows.filter((row) =>
            headers.some((h) => String(row[h] || '').toLowerCase().includes(q))
        );
    }, [rows, searchQuery, headers]);

    const displayRows = useMemo(() => {
        const sorted = [...filteredRows];
        if (sortCol) {
            sorted.sort((a, b) => {
                const va = a[sortCol] || '';
                const vb = b[sortCol] || '';
                const na = parseToNumber(va);
                const nb = parseToNumber(vb);
                if (!isNaN(na) && !isNaN(nb)) {
                    return sortAsc ? na - nb : nb - na;
                }
                return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            });
        }
        return sorted.slice(0, visibleCount);
    }, [filteredRows, sortCol, sortAsc, visibleCount]);

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-soft overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b border-gray-100 gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700">Data Preview</h3>
                    <span className="text-xs text-gray-400">
                        {filteredRows.length} rows found
                    </span>
                </div>
                <div className="relative group min-w-[240px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <Filter className="w-3.5 h-3.5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search data..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-auto max-h-[400px] scrollbar-themed relative">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-white shadow-soft">
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 w-12">#</th>
                            {visibleSchema.map((col) => {
                                const h = col.name;
                                return (
                                <th
                                    key={h}
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap group relative"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div 
                                            className="flex items-center gap-1 cursor-pointer hover:text-primary-600 flex-1"
                                            onClick={() => handleSort(h)}
                                        >
                                            <Type className={`w-3.5 h-3.5 ${col.type === 'numeric' ? 'text-blue-500' : col.type === 'date' ? 'text-green-500' : 'text-orange-500'}`} />
                                            {h}
                                            <ArrowUpDown className={`w-3 h-3 transition-colors ${
                                                sortCol === h ? 'text-primary-500' : 'text-gray-300 group-hover:text-gray-400'
                                            }`} />
                                        </div>
                                        {onOverrideChange && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCol(editingCol === h ? null : h);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-400 transition-opacity"
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    {editingCol === h && onOverrideChange && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setEditingCol(null)} />
                                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-medium z-30 py-1 min-w-[140px] font-normal z-50">
                                                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Change Type</div>
                                                {(['numeric', 'categorical', 'date', 'text'] as const).map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => {
                                                            onOverrideChange(h, { newType: t });
                                                            setEditingCol(null);
                                                        }}
                                                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs capitalize hover:bg-gray-50 ${col.type === t ? 'text-primary-600 font-medium' : 'text-gray-600'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                                <div className="my-1 border-t border-gray-100" />
                                                <button
                                                    onClick={() => {
                                                        onOverrideChange(h, { hidden: true });
                                                        setEditingCol(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    Hide Column
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </th>
                                );
                            })}
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
                                    <td key={h} className="px-3 py-1.5 text-gray-600 whitespace-nowrap max-w-[200px] truncate" title={row[h]}>
                                        {row[h] !== undefined && row[h] !== null && row[h] !== '' ? row[h] : <span className="text-gray-300 italic">—</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredRows.length > visibleCount && (
                    <div className="p-3 border-t border-gray-100 flex justify-center sticky bottom-0 bg-white/95 backdrop-blur-sm z-10">
                        <button
                            onClick={() => setVisibleCount((prev) => prev + 100)}
                            className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors shadow-soft"
                        >
                            Load More ({filteredRows.length - visibleCount} remaining rows)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Paste Zone ────────────────────────────────────────────
function PasteZone({ onData, initialData = '' }: { onData: (text: string) => void; initialData?: string }): React.ReactElement {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [text, setText] = useState(initialData);

    const handleSubmit = useCallback(() => {
        if (text.trim()) {
            onData(text);
        }
    }, [text, onData]);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text/plain');
        if (pastedText.trim()) {
            // If the textarea is empty, we handle it as a direct populate
            // If not, we let the standard textarea logic handle it
        }
    }, []);

    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const resultText = e.target?.result;
            if (typeof resultText === 'string' && resultText.trim()) {
                setText(resultText);
            }
        };
        reader.readAsText(file);
    }, []);

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
                    ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                    <ClipboardPaste className="w-6 h-6 text-primary-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Paste or Upload Your Data
                </h2>
                <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
                    Copy data from Excel or Google Sheets and paste below.
                    You can edit the data before analysis.
                </p>

                <div className="w-full max-w-3xl space-y-4">
                    <div className="relative group">
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onPaste={handlePaste}
                            placeholder="Paste your table data here... (e.g. Columns separated by tabs or commas)"
                            className="w-full h-48 px-4 py-4 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none font-mono bg-white shadow-soft transition-all"
                            spellCheck={false}
                        />
                        {text && (
                            <button
                                onClick={() => setText('')}
                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Clear all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                Upload File
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.tsv,.txt"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-soft hover:shadow-medium active:scale-95"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analyze & Visualize Data
                        </button>
                    </div>
                </div>
                
                {text.length > 0 && (
                    <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-500" />
                        {text.split('\n').filter(l => l.trim()).length} rows detected in editor
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────
export function InstantVisualizerContent(): React.ReactElement {
    const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
    const [rawData, setRawData] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [manualCharts, setManualCharts] = useState<ChartConfig[]>([]);
    const [showPivotPanel, setShowPivotPanel] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [selectedChartIds, setSelectedChartIds] = useState<Set<string>>(new Set());
    const [columnOverrides, setColumnOverrides] = useState<Record<string, ColumnOverride>>({});

    const handleOverrideChange = useCallback((colName: string, override: Partial<ColumnOverride>) => {
        setColumnOverrides(prev => ({
            ...prev,
            [colName]: { ...prev[colName], ...override, name: colName } as ColumnOverride
        }));
    }, []);

    // Re-analyze when overrides change
    useEffect(() => {
        if (!rawData) return;
        try {
            const { headers, rows, error } = parsePastedData(rawData);
            if (!error && rows.length > 0) {
                const result = analyzeDataset(headers, rows, columnOverrides);
                setAnalysis(result);
            }
        } catch(e) {
            console.error(e);
        }
    }, [columnOverrides, rawData]);

    // Persistence logic
    useEffect(() => {
        const savedRawData = localStorage.getItem('visualizer-raw-data');
        const savedCharts = localStorage.getItem('visualizer-charts');
        const savedAnalysis = localStorage.getItem('visualizer-analysis');

        if (savedRawData) setRawData(savedRawData);
        if (savedCharts) setManualCharts(JSON.parse(savedCharts));
        if (savedAnalysis) {
            setAnalysis(JSON.parse(savedAnalysis));
            setIsConfirmed(true); // If we have saved analysis and charts, assume it's confirmed
        }
    }, []);

    useEffect(() => {
        if (rawData) localStorage.setItem('visualizer-raw-data', rawData);
        else localStorage.removeItem('visualizer-raw-data');
    }, [rawData]);

    useEffect(() => {
        if (manualCharts.length > 0) {
            localStorage.setItem('visualizer-charts', JSON.stringify(manualCharts));
        } else {
            localStorage.removeItem('visualizer-charts');
        }
    }, [manualCharts]);

    useEffect(() => {
        if (analysis && isConfirmed) {
            localStorage.setItem('visualizer-analysis', JSON.stringify(analysis));
        } else if (!analysis) {
            localStorage.removeItem('visualizer-analysis');
        }
    }, [analysis, isConfirmed]);

    const handleData = useCallback((text: string) => {
        setError(null);
        setRawData(text);
        setIsAnalyzing(true);
        setSelectedChartIds(new Set());

        setTimeout(() => {
            try {
                const { headers, rows, error: parseError } = parsePastedData(text);
                if (parseError) {
                    setError(parseError);
                    setIsAnalyzing(false);
                    return;
                }
                if (rows.length === 0) {
                    setError('No data rows found. Ensure your data includes a header row and at least one data row.');
                    setIsAnalyzing(false);
                    return;
                }
                const result = analyzeDataset(headers, rows);
                setAnalysis(result);
                
                // If we have a reasonable number of recommended charts, skip confirmation and show them immediately
                if (result.recommendedCharts.length > 0 && result.recommendedCharts.length <= 5) {
                    setManualCharts(result.recommendedCharts);
                    setSelectedChartIds(new Set(result.recommendedCharts.map(c => c.id)));
                    setIsConfirmed(true);
                } else {
                    setIsConfirmed(false);
                    setManualCharts([]); // Reset to empty initially during confirmation
                    setSelectedChartIds(new Set(result.recommendedCharts.map(c => c.id))); // Select all by default
                }
                setShowPivotPanel(false);
            } catch (err) {
                console.error(err);
                setError('An unexpected error occurred while analyzing the data. Ensure the table format is not corrupted.');
            } finally {
                setIsAnalyzing(false);
            }
        }, 50);
    }, []);

    const handleClear = useCallback(() => {
        setAnalysis(null);
        setRawData('');
        setError(null);
        setManualCharts([]);
        setShowPivotPanel(false);
        setIsConfirmed(false);
        setIsAnalyzing(false);
    }, []);

    const handleEditData = useCallback(() => {
        setAnalysis(null);
        setManualCharts([]);
        setShowPivotPanel(false);
        setIsConfirmed(false);
        setIsAnalyzing(false);
    }, []);

    const handleChartTypeChange = useCallback((id: string, type: ChartType) => {
        setManualCharts((prev) => {
            const idx = prev.findIndex((c) => c.id === id);
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], type };
                return updated;
            }
            return prev;
        });
    }, []);

    const handleAddManualChart = useCallback((pivotConfig: PivotConfig, chartType: ChartType) => {
        if (!analysis) return;
        const newId = `manual-${Date.now()}`;
        const newChart = buildManualChartConfig(pivotConfig, analysis.rows, newId, chartType);
        setManualCharts((prev) => [...prev, newChart]);
        setShowPivotPanel(false);
    }, [analysis]);

    const handleRemoveManualChart = useCallback((id: string) => {
        setManualCharts((prev) => prev.filter((c) => c.id !== id));
    }, []);

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
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-gray-200 rounded-2xl bg-white shadow-soft animate-in fade-in duration-300">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                        <h3 className="text-sm font-medium text-gray-800">Analyzing your data...</h3>
                        <p className="text-xs text-gray-400 mt-1">Extracting patterns & building recommendations</p>
                    </div>
                ) : (
                    <PasteZone onData={handleData} initialData={rawData} />
                )}
                {error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="leading-relaxed">{error}</p>
                    </div>
                )}
            </div>
        );
    }

    // ─── Data Confirmation ─────────────────────────────────
    if (!isConfirmed) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Table Preview */}
                    <div className="flex-1 space-y-6 overflow-hidden">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Confirm Data
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Please review the detected columns and rows below.
                                </p>
                            </div>
                        </div>
                        <DataTable 
                            schema={analysis.schema} 
                            rows={analysis.rows} 
                            overrides={columnOverrides}
                            onOverrideChange={handleOverrideChange}
                        />
                    </div>

                    {/* Right: Chart Selection */}
                    <div className="w-full lg:w-80 shrink-0 space-y-4">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-primary-500" />
                                Recommended Charts
                            </h3>
                            <div className="space-y-3 max-h-[400px] overflow-auto pr-2 scrollbar-themed">
                                {analysis.recommendedCharts.map((chart) => (
                                    <label key={chart.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="mt-0.5">
                                            <input 
                                                type="checkbox"
                                                checked={selectedChartIds.has(chart.id)}
                                                onChange={() => {
                                                    const next = new Set(selectedChartIds);
                                                    if (next.has(chart.id)) next.delete(chart.id);
                                                    else next.add(chart.id);
                                                    setSelectedChartIds(next);
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-gray-700 truncate">{chart.title}</p>
                                            <p className="text-[10px] text-gray-400 capitalize">{chart.type} chart</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={() => {
                                        const recommendedToAdd = analysis.recommendedCharts.filter(c => selectedChartIds.has(c.id));
                                        setManualCharts(recommendedToAdd);
                                        setIsConfirmed(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-soft"
                                >
                                    <Check className="w-4 h-4" />
                                    Generate Dashboard
                                </button>
                                <button
                                    onClick={handleEditData}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Edit Raw Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Dashboard ─────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between animate-in fade-in duration-500">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-500" />
                    <h2 className="text-base font-semibold text-gray-800">
                        Dashboard
                    </h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {analysis.totalRows} rows
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPivotPanel(!showPivotPanel)}
                        className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors font-medium border border-primary-200"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Chart
                    </button>
                    <button
                        onClick={handleEditData}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-200"
                    >
                        <Table2 className="w-3.5 h-3.5" />
                        Edit Data
                    </button>
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Data
                    </button>
                </div>
            </div>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowClearConfirm(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Dashboard?</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to clear the dashboard? All your uploaded data and custom charts will be permanently removed.
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:justify-end">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleClear();
                                    setShowClearConfirm(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-soft"
                            >
                                Yes, Clear Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {kpiCards.map((card, i) => (
                    <KpiCard key={i} index={i} {...card} />
                ))}
            </div>

            {/* Pivot Config Panel */}
            {showPivotPanel && (
                <PivotConfigPanel
                    schema={analysis.schema}
                    rows={analysis.rows}
                    onApply={handleAddManualChart}
                    onCancel={() => setShowPivotPanel(false)}
                />
            )}

            {/* Charts List */}
            {manualCharts.length === 0 && !showPivotPanel && (
                <div className="bg-white border border-gray-100 rounded-xl p-8 text-center animate-in fade-in duration-500">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                        No charts yet. Click &quot;Add Chart&quot; to create one.
                    </p>
                </div>
            )}

            {/* Manual / Pivot Charts */}
            {manualCharts.length > 0 && (
                <div className="animate-in fade-in duration-500">
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                        Your Charts
                    </h3>
                    <div className={`grid gap-4 ${
                        manualCharts.length === 1
                            ? 'grid-cols-1 md:grid-cols-2' // ensure it does not stretch too wide if there's only 1
                            : 'grid-cols-1 lg:grid-cols-2'
                    }`}>
                        {manualCharts.map((config, i) => (
                            <ChartCard
                                key={config.id}
                                config={config}
                                onTypeChange={handleChartTypeChange}
                                index={i + kpiCards.length}
                                onRemove={handleRemoveManualChart}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Data Table */}
            <DataTable schema={analysis.schema} rows={analysis.rows} />
        </div>
    );
}
