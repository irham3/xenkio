'use client';

import { useState, useCallback, useMemo } from 'react';
import { Copy, Check, Trash2, Search, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeText, formatHexBytes, getCodePointsList } from '../lib/unicode-utils';
import type { CharInfo, UnicodeAnalysis } from '../types';
import { cn } from '@/lib/utils';

const CATEGORY_GROUP_COLORS: Record<string, string> = {
    letter: 'bg-blue-50 text-blue-700 border-blue-200',
    number: 'bg-green-50 text-green-700 border-green-200',
    punctuation: 'bg-amber-50 text-amber-700 border-amber-200',
    symbol: 'bg-purple-50 text-purple-700 border-purple-200',
    separator: 'bg-gray-100 text-gray-600 border-gray-200',
    control: 'bg-red-50 text-red-700 border-red-200',
    other: 'bg-gray-50 text-gray-600 border-gray-200',
};

const CATEGORY_GROUP_LABELS: Record<string, string> = {
    letter: 'Letter',
    number: 'Number',
    punctuation: 'Punctuation',
    symbol: 'Symbol',
    separator: 'Separator',
    control: 'Control',
    other: 'Other',
};

type TabId = 'overview' | 'characters' | 'normalization' | 'codepoints';

const SAMPLE_TEXTS = [
    { label: 'Emoji', value: 'Hello 👋 World! 🌍✨' },
    { label: 'Arabic', value: 'مرحبا بالعالم' },
    { label: 'Japanese', value: 'こんにちは世界' },
    { label: 'Invisible', value: 'A\u200BB\u200CC\u200DD' },
    { label: 'Mixed', value: 'café résumé naïve' },
];

const MAX_TABLE_ROWS = 500;

function CharBadge({ char, isSpecial }: { char: string; isSpecial: boolean }) {
    const cp = char.codePointAt(0) ?? 0;
    const isInvisible = cp <= 0x20 || (cp >= 0x200B && cp <= 0x200F) || cp === 0xFEFF || cp === 0x00AD || cp === 0x00A0;
    if (isInvisible) {
        return (
            <span className="inline-flex items-center justify-center w-8 h-7 bg-red-50 border border-red-200 rounded text-[9px] font-mono text-red-500 select-none">
                {cp === 0x20 ? 'SP' : cp === 0x09 ? 'TAB' : cp === 0x0A ? 'LF' : cp === 0x0D ? 'CR' : '·'}
            </span>
        );
    }
    return (
        <span className={cn(
            'inline-flex items-center justify-center w-8 h-7 border rounded font-mono text-sm select-none',
            isSpecial ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 text-gray-900'
        )}>
            {char}
        </span>
    );
}

function StatCard({
    label,
    value,
    sub,
    color = 'default',
}: {
    label: string;
    value: string | number;
    sub?: string;
    color?: 'default' | 'blue' | 'green' | 'red' | 'amber';
}) {
    const colorMap = {
        default: 'text-gray-900',
        blue: 'text-primary-600',
        green: 'text-green-600',
        red: 'text-red-600',
        amber: 'text-amber-600',
    };
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={cn('text-2xl font-bold tabular-nums', colorMap[color])}>{value.toLocaleString()}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

function CharTableRow({ info, idx }: { info: CharInfo; idx: number }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <>
            <tr
                className={cn(
                    'border-b border-gray-100 hover:bg-gray-50/70 transition-colors cursor-pointer',
                    info.isSpecial && 'bg-amber-50/30 hover:bg-amber-50/60',
                    idx % 2 === 0 && !info.isSpecial && 'bg-white',
                )}
                onClick={() => setExpanded((v) => !v)}
            >
                <td className="px-3 py-2 text-xs text-gray-400 tabular-nums w-12 text-right select-none">
                    {info.index + 1}
                </td>
                <td className="px-3 py-2 w-12">
                    <CharBadge char={info.char} isSpecial={info.isSpecial} />
                </td>
                <td className="px-3 py-2">
                    <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                        {info.codePointHex}
                    </span>
                </td>
                <td className="px-3 py-2 text-xs text-gray-700 hidden sm:table-cell">
                    <span className={cn(
                        'inline-block px-1.5 py-0.5 rounded border text-[11px] font-medium',
                        CATEGORY_GROUP_COLORS[info.categoryGroup],
                    )}>
                        {info.category}
                    </span>
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                    <span className="font-mono text-[11px] text-gray-500">{formatHexBytes(info.utf8Bytes)}</span>
                </td>
                <td className="px-3 py-2 w-8 text-right">
                    {info.isSpecial ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline" />
                    ) : (
                        <span className="w-3.5 h-3.5 inline-block" />
                    )}
                    {expanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 inline ml-1" />
                        : <ChevronDown className="w-3.5 h-3.5 text-gray-400 inline ml-1" />
                    }
                </td>
            </tr>
            {expanded && (
                <tr className="border-b border-gray-100">
                    <td colSpan={6} className="px-4 py-3 bg-gray-50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                            <div><span className="text-gray-400 font-medium">Code Point</span><br /><span className="font-mono text-gray-900">{info.codePointHex} (dec: {info.codePoint})</span></div>
                            <div><span className="text-gray-400 font-medium">Category</span><br /><span className="text-gray-900">{info.category} ({info.categoryCode})</span></div>
                            <div><span className="text-gray-400 font-medium">Block</span><br /><span className="text-gray-900">{info.block}</span></div>
                            <div><span className="text-gray-400 font-medium">ASCII</span><br /><span className="text-gray-900">{info.isASCII ? 'Yes' : 'No'}</span></div>
                            <div><span className="text-gray-400 font-medium">UTF-8</span><br /><span className="font-mono text-gray-900">{formatHexBytes(info.utf8Bytes)} ({info.utf8Bytes.length}B)</span></div>
                            <div><span className="text-gray-400 font-medium">UTF-16</span><br /><span className="font-mono text-gray-900">{info.utf16Units.map((u) => u.toString(16).toUpperCase().padStart(4, '0')).join(' ')} ({info.utf16Units.length * 2}B)</span></div>
                            {info.specialNote && (
                                <div className="col-span-2"><span className="text-amber-500 font-medium">Special Note</span><br /><span className="text-gray-900">{info.specialNote}</span></div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export function UnicodeAnalyzerTool() {
    const [text, setText] = useState('');
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [search, setSearch] = useState('');
    const [showAllRows, setShowAllRows] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const analysis = useMemo<UnicodeAnalysis | null>(() => {
        if (!text) return null;
        return analyzeText(text);
    }, [text]);

    const handleCopy = useCallback(async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    }, []);

    const handleClear = useCallback(() => {
        setText('');
        setSearch('');
        setShowAllRows(false);
        setActiveTab('overview');
    }, []);

    const filteredChars = useMemo<CharInfo[]>(() => {
        if (!analysis) return [];
        if (!search) return analysis.chars;
        const q = search.toLowerCase();
        return analysis.chars.filter(
            (c) =>
                c.codePointHex.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.block.toLowerCase().includes(q) ||
                c.specialNote.toLowerCase().includes(q) ||
                c.char === search,
        );
    }, [analysis, search]);

    const displayedChars = useMemo<CharInfo[]>(
        () => (showAllRows ? filteredChars : filteredChars.slice(0, MAX_TABLE_ROWS)),
        [filteredChars, showAllRows],
    );

    const tabs: { id: TabId; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'characters', label: `Characters${analysis ? ` (${analysis.stats.totalCodePoints})` : ''}` },
        { id: 'normalization', label: 'Normalization' },
        { id: 'codepoints', label: 'Code Points' },
    ];

    return (
        <div className="space-y-6">
            {/* Input Area */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
                    <label htmlFor="unicode-input" className="text-sm font-semibold text-gray-800">
                        Input Text
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 tabular-nums font-medium">
                            {analysis ? `${analysis.stats.totalCodePoints} code point${analysis.stats.totalCodePoints !== 1 ? 's' : ''}` : '0 code points'}
                        </span>
                        {/* Sample presets */}
                        <div className="flex gap-1">
                            {SAMPLE_TEXTS.map((s) => (
                                <button
                                    key={s.label}
                                    onClick={() => setText(s.value)}
                                    className="px-2 py-1 text-[11px] font-medium text-gray-500 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 rounded border border-gray-200 hover:border-primary-200 transition-colors"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleClear}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    </div>
                </div>
                <textarea
                    id="unicode-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste any text to analyze its Unicode characters..."
                    className="w-full min-h-[120px] p-4 text-gray-900 bg-white text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none resize-y"
                />
            </div>

            {/* Analysis Panels */}
            {analysis && (
                <div className="space-y-4">
                    {/* Tab Bar */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl border border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200',
                                    activeTab === tab.id
                                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50',
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            {/* Special chars warning */}
                            {analysis.stats.specialCount > 0 && (
                                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-800">
                                        <strong>{analysis.stats.specialCount}</strong> special or invisible character{analysis.stats.specialCount !== 1 ? 's' : ''} detected.
                                        These may affect display, parsing, or security.
                                    </p>
                                </div>
                            )}

                            {/* NFC status */}
                            {!analysis.isAlreadyNFC && (
                                <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-blue-800">
                                        Text is <strong>not in NFC form</strong>. Some characters may have combining diacritics or compatibility variants.
                                        See the Normalization tab for details.
                                    </p>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                <StatCard label="Code Points" value={analysis.stats.totalCodePoints} color="blue" />
                                <StatCard label="Unique Chars" value={analysis.stats.uniqueCodePoints} />
                                <StatCard label="ASCII" value={analysis.stats.asciiCount} color="green" sub="U+0000 – U+007F" />
                                <StatCard
                                    label="Non-ASCII"
                                    value={analysis.stats.nonAsciiCount}
                                    color={analysis.stats.nonAsciiCount > 0 ? 'amber' : 'default'}
                                    sub="U+0080 and above"
                                />
                                <StatCard label="Special/Invisible" value={analysis.stats.specialCount} color={analysis.stats.specialCount > 0 ? 'red' : 'default'} />
                                <StatCard label="UTF-8 Bytes" value={analysis.stats.utf8ByteCount} sub={`${analysis.stats.utf8ByteCount} B`} />
                                <StatCard label="UTF-16 Bytes" value={analysis.stats.utf16ByteCount} sub={`${analysis.stats.utf16ByteCount} B`} />
                                <StatCard
                                    label="NFC Status"
                                    value={analysis.isAlreadyNFC ? 'Normalized' : 'Not NFC'}
                                    color={analysis.isAlreadyNFC ? 'green' : 'amber'}
                                />
                            </div>

                            {/* Category breakdown */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Character Categories</h3>
                                <div className="space-y-2">
                                    {Object.entries(analysis.stats.byCategory)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([group, count]) => {
                                            const pct = analysis.stats.totalCodePoints > 0
                                                ? (count / analysis.stats.totalCodePoints) * 100
                                                : 0;
                                            return (
                                                <div key={group} className="flex items-center gap-3">
                                                    <span className={cn(
                                                        'text-[11px] font-medium px-2 py-0.5 rounded border w-24 text-center shrink-0',
                                                        CATEGORY_GROUP_COLORS[group],
                                                    )}>
                                                        {CATEGORY_GROUP_LABELS[group]}
                                                    </span>
                                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.max(pct, 0.5)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 tabular-nums w-20 text-right">
                                                        {count} ({pct.toFixed(1)}%)
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHARACTERS TAB */}
                    {activeTab === 'characters' && (
                        <div className="space-y-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Filter by code point, category, or block..."
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 w-12">#</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 w-12">Char</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Code Point</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 hidden sm:table-cell">Category</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 hidden md:table-cell">UTF-8 Bytes</th>
                                                <th className="px-3 py-2.5 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedChars.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                                                        No characters match your filter
                                                    </td>
                                                </tr>
                                            ) : (
                                                displayedChars.map((c, i) => (
                                                    <CharTableRow key={`${c.index}-${c.codePoint}`} info={c} idx={i} />
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredChars.length > MAX_TABLE_ROWS && !showAllRows && (
                                    <div className="p-4 border-t border-gray-100 text-center">
                                        <button
                                            onClick={() => setShowAllRows(true)}
                                            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                        >
                                            Show all {filteredChars.length.toLocaleString()} characters
                                        </button>
                                    </div>
                                )}
                                {filteredChars.length > 0 && (
                                    <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-right">
                                        Click a row for full details
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* NORMALIZATION TAB */}
                    {activeTab === 'normalization' && (
                        <div className="space-y-3">
                            {analysis.normalizations.map((norm) => (
                                <div
                                    key={norm.form}
                                    className={cn(
                                        'bg-white border rounded-xl overflow-hidden',
                                        norm.changed ? 'border-amber-200' : 'border-gray-200',
                                    )}
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                'font-mono text-xs font-bold px-2 py-0.5 rounded',
                                                norm.changed
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-green-100 text-green-700',
                                            )}>
                                                {norm.label}
                                            </span>
                                            <span className="text-xs text-gray-500">{norm.description}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={cn(
                                                'text-xs font-medium px-2 py-0.5 rounded-full',
                                                norm.changed ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50',
                                            )}>
                                                {norm.changed ? 'Changed' : 'Same'}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(norm.result, `norm-${norm.form}`)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                {copiedField === `norm-${norm.form}` ? (
                                                    <Check className="w-3 h-3 text-green-600" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <p className="text-sm text-gray-800 font-mono break-all leading-relaxed">
                                            {norm.result || <span className="text-gray-400 italic">empty</span>}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {norm.codePoints.slice(0, 30).join(' ')}
                                            {norm.codePoints.length > 30 && ` … +${norm.codePoints.length - 30} more`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {norm.codePoints.length} code point{norm.codePoints.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CODE POINTS TAB */}
                    {activeTab === 'codepoints' && (
                        <div className="space-y-4">
                            {[
                                { label: 'Space-separated', sep: ' ', field: 'space' },
                                { label: 'Comma-separated', sep: ', ', field: 'comma' },
                                { label: 'One per line', sep: '\n', field: 'newline' },
                            ].map(({ label, sep, field }) => {
                                const value = getCodePointsList(analysis.chars, sep);
                                return (
                                    <div key={field} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <span className="text-sm font-semibold text-gray-700">{label}</span>
                                            <button
                                                onClick={() => handleCopy(value, field)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                {copiedField === field ? (
                                                    <><Check className="w-3 h-3 text-green-600" /> Copied</>
                                                ) : (
                                                    <><Copy className="w-3 h-3" /> Copy</>
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <pre className="text-xs font-mono text-gray-600 leading-relaxed break-all whitespace-pre-wrap max-h-48 overflow-y-auto">
                                                {value}
                                            </pre>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Decimal code points */}
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                                    <span className="text-sm font-semibold text-gray-700">Decimal values (space-separated)</span>
                                    <button
                                        onClick={() => handleCopy(analysis.chars.map((c) => c.codePoint).join(' '), 'decimal')}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        {copiedField === 'decimal' ? (
                                            <><Check className="w-3 h-3 text-green-600" /> Copied</>
                                        ) : (
                                            <><Copy className="w-3 h-3" /> Copy</>
                                        )}
                                    </button>
                                </div>
                                <div className="p-4">
                                    <pre className="text-xs font-mono text-gray-600 leading-relaxed break-all whitespace-pre-wrap max-h-48 overflow-y-auto">
                                        {analysis.chars.map((c) => c.codePoint).join(' ')}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!analysis && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4 select-none">🔍</div>
                    <p className="text-gray-500 text-sm font-medium">Start typing to analyze Unicode characters</p>
                    <p className="text-gray-400 text-xs mt-1">Supports all Unicode scripts, emoji, and special characters</p>
                </div>
            )}
        </div>
    );
}
