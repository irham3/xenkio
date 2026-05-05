'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarningCircle, CheckCircle, XCircle, CaretDown, CaretUp, Info, ArrowCounterClockwise, Flask, ClipboardText, Table } from '@phosphor-icons/react/dist/ssr';
import { useHypothesisTest, TEST_CATEGORIES } from '../hooks/use-hypothesis-test';
import { TestType, AlternativeHypothesis } from '../types';
import { DescriptiveStats } from '../types';
import {
    DataTableEditor,
    formDataToText,
    textToFormData,
    createEmptyFormData,
} from './data-table-editor';

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, d = 4): string {
    return Number.isFinite(n) ? n.toFixed(d) : '—';
}

type InputMode = 'paste' | 'form';

// ── Descriptive Stats Table ────────────────────────────────────────────────

function DescStats({ stats, labels }: { stats: DescriptiveStats[]; labels: string[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">Group</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">n</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Mean</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">SD</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">SE</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Min</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Max</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200">Median</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-3 py-2 font-medium text-gray-700 border border-gray-200">{labels[i]}</td>
                            <td className="text-right px-3 py-2 text-gray-600 border border-gray-200">{s.n}</td>
                            <td className="text-right px-3 py-2 text-gray-600 border border-gray-200">{fmt(s.mean)}</td>
                            <td className="text-right px-3 py-2 text-gray-600 border border-gray-200">{fmt(s.std)}</td>
                            <td className="text-right px-3 py-2 text-gray-600 border border-gray-200">{fmt(s.se)}</td>
                            <td className="text-right px-3 py-2 text-gray-600 border border-gray-200">{fmt(s.min)}</td>
                            <td className="text-right px-3 py-2 text-gray-600 border border-gray-200">{fmt(s.max)}</td>
                            <td className="text-right px-3 py-2 text-gray-600 border border-gray-200">{fmt(s.median)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Paste Mode Hints ──

const PASTE_HINT = 'Paste directly from Excel, Google Sheets, or type manually.\nSeparate numbers with spaces, commas, tabs, or enter.';
const PASTE_HINT_COLS = 'Paste directly from Excel (2 columns, tab-separated).\nOr type two rows of numbers separated by tabs/commas.';

// ── Input Mode Toggle ──────────────────────────────────────────────────────

function InputModeToggle({ mode, onModeChange }: { mode: InputMode; onModeChange: (m: InputMode) => void }) {
    return (
        <div className="inline-flex items-center rounded-lg bg-gray-100 p-0.5">
            <button
                onClick={() => onModeChange('form')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    mode === 'form'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Table className="w-3.5 h-3.5"  weight="duotone"/>
                Form
            </button>
            <button
                onClick={() => onModeChange('paste')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    mode === 'paste'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <ClipboardText className="w-3.5 h-3.5"  weight="duotone"/>
                Paste
            </button>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function HypothesisTestTool() {
    const { state, updateConfig, setField, calculate, reset } = useHypothesisTest();
    const { config, result, error } = state;
    const [showDesc, setShowDesc] = useState(true);
    const [inputMode, setInputMode] = useState<InputMode>('form');

    // ── Form data state (2D string arrays for each input slot) ──
    const [formData1, setFormData1] = useState<string[][]>(createEmptyFormData(5, 1));
    const [formData2, setFormData2] = useState<string[][]>(createEmptyFormData(5, 1));
    const [formPaired, setFormPaired] = useState<string[][]>(createEmptyFormData(5, 2));
    const [formObsExp, setFormObsExp] = useState<string[][]>(createEmptyFormData(4, 2));
    const [formContingency, setFormContingency] = useState<string[][]>(createEmptyFormData(3, 3));
    const [formAnova, setFormAnova] = useState<string[][]>(createEmptyFormData(5, 3));

    const { testType } = config;

    const needsGroup2 =
        testType === 'two-sample-t' ||
        testType === 'two-sample-z';
    const needsMu0 =
        testType === 'one-sample-t' ||
        testType === 'one-sample-z' ||
        testType === 'two-sample-z';
    const needsSigma = testType === 'one-sample-z' || testType === 'two-sample-z';
    const needsPooled = testType === 'two-sample-t';
    const needsAlt =
        testType !== 'chi-square-goodness' && testType !== 'chi-square-independence' && testType !== 'one-way-anova';
    const needsContingency = testType === 'chi-square-independence';
    const needsObsExp = testType === 'chi-square-goodness';
    const needsAnova = testType === 'one-way-anova';
    const isPairedOrCorr = testType === 'paired-t' || testType === 'pearson-correlation';

    // ── Determine which form data to show based on testType ──
    const inputCategory = useMemo(() => {
        if (needsContingency) return 'contingency' as const;
        if (needsObsExp) return 'observed-expected' as const;
        if (needsAnova) return 'anova' as const;
        if (isPairedOrCorr) return 'paired' as const;
        if (needsGroup2) return 'dual' as const;
        return 'single' as const;
    }, [needsContingency, needsObsExp, needsAnova, isPairedOrCorr, needsGroup2]);

    // ── Column definitions per variant ──
    const formColumns = useMemo(() => {
        switch (inputCategory) {
            case 'single':
                return [{ label: 'Sample Data', placeholder: 'value' }];
            case 'dual':
                return [
                    { label: 'Group 1', placeholder: 'value' },
                    { label: 'Group 2', placeholder: 'value' },
                ];
            case 'paired':
                return testType === 'paired-t'
                    ? [{ label: 'Before', placeholder: 'value' }, { label: 'After', placeholder: 'value' }]
                    : [{ label: 'X', placeholder: 'value' }, { label: 'Y', placeholder: 'value' }];
            case 'observed-expected':
                return [
                    { label: 'Observed (O)', placeholder: 'freq' },
                    { label: 'Expected (E)', placeholder: 'freq' },
                ];
            case 'contingency':
                return Array.from({ length: formContingency[0]?.length ?? 3 }, (_, i) => ({
                    label: `Col ${i + 1}`,
                    placeholder: 'freq',
                }));
            case 'anova':
                return Array.from({ length: formAnova[0]?.length ?? 3 }, (_, i) => ({
                    label: `Group ${i + 1}`,
                    placeholder: 'value',
                }));
        }
    }, [inputCategory, testType, formContingency, formAnova]);

    // ── Get/set form data for the current input category ──
    const currentFormData = useMemo(() => {
        switch (inputCategory) {
            case 'single': return formData1;
            case 'dual': {
                // Merge dual columns into a unified 2-col grid
                const maxLen = Math.max(formData1.length, formData2.length, 3);
                return Array.from({ length: maxLen }, (_, i) => [
                    formData1[i]?.[0] ?? '',
                    formData2[i]?.[0] ?? '',
                ]);
            }
            case 'paired': return formPaired;
            case 'observed-expected': return formObsExp;
            case 'contingency': return formContingency;
            case 'anova': return formAnova;
        }
    }, [inputCategory, formData1, formData2, formPaired, formObsExp, formContingency, formAnova]);

    // ── Sync form data → paste text fields ──
    const syncFormToPaste = useCallback(
        (category: typeof inputCategory, newData: string[][]) => {
            switch (category) {
                case 'single': {
                    setFormData1(newData);
                    setField('data1', formDataToText(newData));
                    break;
                }
                case 'dual': {
                    // Split 2-col data into separate group fields
                    const g1 = newData.map((r) => [r[0] ?? '']);
                    const g2 = newData.map((r) => [r[1] ?? '']);
                    setFormData1(g1);
                    setFormData2(g2);
                    setField('data1', formDataToText(g1));
                    setField('data2', formDataToText(g2));
                    break;
                }
                case 'paired': {
                    setFormPaired(newData);
                    setField('data1', formDataToText(newData));
                    setField('data2', '');
                    break;
                }
                case 'observed-expected': {
                    setFormObsExp(newData);
                    const obs = newData.map((r) => r[0]).filter((v) => v.trim() !== '').join(' ');
                    const exp = newData.map((r) => r[1]).filter((v) => v.trim() !== '').join(' ');
                    setField('observedInput', obs);
                    setField('expectedInput', exp);
                    break;
                }
                case 'contingency': {
                    setFormContingency(newData);
                    const text = newData
                        .filter((r) => r.some((v) => v.trim() !== ''))
                        .map((r) => r.join('\t'))
                        .join('\n');
                    setField('contingencyInput', text);
                    break;
                }
                case 'anova': {
                    setFormAnova(newData);
                    const text = newData
                        .filter((r) => r.some((v) => v.trim() !== ''))
                        .map((r) => r.join('\t'))
                        .join('\n');
                    setField('anovaInput', text);
                    break;
                }
            }
        },
        [setField],
    );


    // ── Handle contingency/anova column add/remove (need to update columns) ──
    const handleFormChangeWithColumns = useCallback(
        (newData: string[][]) => {
            syncFormToPaste(inputCategory, newData);
        },
        [inputCategory, syncFormToPaste],
    );

    // ── Sync paste text → form data when switching to form mode ──
    const handleModeSwitch = useCallback(
        (newMode: InputMode) => {
            if (newMode === 'form') {
                // Parse current paste text into form data
                switch (inputCategory) {
                    case 'single': {
                        const parsed = textToFormData(state.data1, 1);
                        setFormData1(parsed.length > 0 ? parsed : createEmptyFormData(5, 1));
                        break;
                    }
                    case 'dual': {
                        const p1 = textToFormData(state.data1, 1);
                        const p2 = textToFormData(state.data2, 1);
                        setFormData1(p1.length > 0 ? p1 : createEmptyFormData(5, 1));
                        setFormData2(p2.length > 0 ? p2 : createEmptyFormData(5, 1));
                        break;
                    }
                    case 'paired': {
                        const parsed = textToFormData(state.data1, 2);
                        setFormPaired(parsed.length > 0 ? parsed : createEmptyFormData(5, 2));
                        break;
                    }
                    case 'observed-expected': {
                        const obsTokens = state.observedInput.trim().split(/[\s,;]+/).filter(Boolean);
                        const expTokens = state.expectedInput.trim().split(/[\s,;]+/).filter(Boolean);
                        const maxLen = Math.max(obsTokens.length, expTokens.length, 4);
                        const parsed = Array.from({ length: maxLen }, (_, i) => [
                            obsTokens[i] ?? '',
                            expTokens[i] ?? '',
                        ]);
                        setFormObsExp(parsed);
                        break;
                    }
                    case 'contingency': {
                        if (state.contingencyInput.trim()) {
                            const rows = state.contingencyInput.trim().split(/\n|\r\n/);
                            const parsed = rows.map((r) =>
                                r.split(/[\t,;]/).map((c) => c.trim()),
                            );
                            const maxCols = Math.max(...parsed.map((r) => r.length), 2);
                            const normalized = parsed.map((r) => [
                                ...r,
                                ...Array(maxCols - r.length).fill(''),
                            ]);
                            setFormContingency(normalized.length > 0 ? normalized : createEmptyFormData(3, 3));
                        } else {
                            setFormContingency(createEmptyFormData(3, 3));
                        }
                        break;
                    }
                    case 'anova': {
                        if (state.anovaInput.trim()) {
                            const rows = state.anovaInput.trim().split(/\n|\r\n/);
                            const parsed = rows.map((r) =>
                                r.split(/[\t,;]/).map((c) => c.trim()),
                            );
                            const maxCols = Math.max(...parsed.map((r) => r.length), 2);
                            const normalized = parsed.map((r) => [
                                ...r,
                                ...Array(maxCols - r.length).fill(''),
                            ]);
                            setFormAnova(normalized.length > 0 ? normalized : createEmptyFormData(5, 3));
                        } else {
                            setFormAnova(createEmptyFormData(5, 3));
                        }
                        break;
                    }
                }
            }
            setInputMode(newMode);
        },
        [inputCategory, state],
    );

    // ── Reset also clears form data ──
    const handleReset = useCallback(() => {
        reset();
        setFormData1(createEmptyFormData(5, 1));
        setFormData2(createEmptyFormData(5, 1));
        setFormPaired(createEmptyFormData(5, 2));
        setFormObsExp(createEmptyFormData(4, 2));
        setFormContingency(createEmptyFormData(3, 3));
        setFormAnova(createEmptyFormData(5, 3));
    }, [reset]);

    function handleCalculate() {
        calculate();
    }

    // ── Render: Data Input Panel (FORM MODE) ──

    function renderFormMode() {
        return (
            <DataTableEditor
                variant={inputCategory}
                columns={formColumns}
                data={currentFormData}
                onChange={handleFormChangeWithColumns}
                allowAddColumns={inputCategory === 'contingency' || inputCategory === 'anova'}
                minRows={inputCategory === 'contingency' ? 2 : 1}
                minCols={inputCategory === 'contingency' ? 2 : inputCategory === 'anova' ? 2 : undefined}
            />
        );
    }

    // ── Render: Data Input Panel (PASTE MODE) ──

    function renderPasteMode() {
        if (needsContingency) {
            return (
                <div>
                    <Label className="text-sm font-medium text-gray-700">Contingency Table</Label>
                    <Textarea
                        placeholder={'Paste from Excel (rows = category A, columns = category B)\nExample 2x3:\n10\t20\t30\n15\t25\t10'}
                        value={state.contingencyInput}
                        onChange={(e) => setField('contingencyInput', e.target.value)}
                        className="mt-1.5 font-mono text-sm min-h-[100px] resize-y"
                        rows={5}
                    />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3"  weight="duotone"/>
                        Each row represents one category of variable A, columns = category of variable B.
                    </p>
                </div>
            );
        }

        if (needsObsExp) {
            return (
                <>
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Observed Frequency (O)</Label>
                        <Textarea
                            placeholder="Example: 20 30 15 35\n(separate with spaces or enter)"
                            value={state.observedInput}
                            onChange={(e) => setField('observedInput', e.target.value)}
                            className="mt-1.5 font-mono text-sm"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Expected Frequency (E)</Label>
                        <Textarea
                            placeholder="Example: 25 25 25 25\n(separate with spaces or enter)"
                            value={state.expectedInput}
                            onChange={(e) => setField('expectedInput', e.target.value)}
                            className="mt-1.5 font-mono text-sm"
                            rows={3}
                        />
                    </div>
                </>
            );
        }

        if (needsAnova) {
            return (
                <div>
                    <Label className="text-sm font-medium text-gray-700">Data (each column = one group)</Label>
                    <Textarea
                        placeholder={'Paste from Excel — each column = one group (tab-separated)\nExample 3 groups:\n12\t15\t10\n14\t18\t11\n13\t16\t9'}
                        value={state.anovaInput}
                        onChange={(e) => setField('anovaInput', e.target.value)}
                        className="mt-1.5 font-mono text-sm min-h-[120px] resize-y"
                        rows={6}
                    />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3"  weight="duotone"/>
                        Each column represents one group. Separate columns with tabs (direct from Excel).
                    </p>
                </div>
            );
        }

        // Standard data input (t-tests, z-tests, pearson)
        return (
            <>
                <div>
                    <Label className="text-sm font-medium text-gray-700">
                        {isPairedOrCorr ? 'Data (2 columns: Before & After / X & Y)' : needsGroup2 ? 'Group 1 Data' : 'Sample Data'}
                    </Label>
                    <Textarea
                        placeholder={isPairedOrCorr ? PASTE_HINT_COLS : PASTE_HINT}
                        value={state.data1}
                        onChange={(e) => setField('data1', e.target.value)}
                        className="mt-1.5 font-mono text-sm min-h-[100px] resize-y"
                        rows={5}
                    />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3"  weight="duotone"/>
                        {isPairedOrCorr
                            ? 'Paste 2 columns from Excel. Or use the second column below.'
                            : 'Paste from Excel, Google Sheets, or type numbers separated by spaces/enter.'}
                    </p>
                </div>
                {needsGroup2 && !isPairedOrCorr && (
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Group 2 Data</Label>
                        <Textarea
                            placeholder={PASTE_HINT}
                            value={state.data2}
                            onChange={(e) => setField('data2', e.target.value)}
                            className="mt-1.5 font-mono text-sm min-h-[80px] resize-y"
                            rows={4}
                        />
                    </div>
                )}
                {isPairedOrCorr && (
                    <div>
                        <Label className="text-sm font-medium text-gray-700">
                            {testType === 'paired-t'
                                ? 'After Data (optional if already pasted 2 columns)'
                                : 'Y Data (optional if already pasted 2 columns)'}
                        </Label>
                        <Textarea
                            placeholder={PASTE_HINT}
                            value={state.data2}
                            onChange={(e) => setField('data2', e.target.value)}
                            className="mt-1.5 font-mono text-sm min-h-[80px] resize-y"
                            rows={4}
                        />
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Test selector ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Flask className="w-4 h-4 text-blue-500"  weight="duotone"/>
                    Select Hypothesis Test Type
                </h2>
                <Tabs
                    value={TEST_CATEGORIES.find((c) => c.tests.some((t) => t.id === testType))?.label ?? TEST_CATEGORIES[0].label}
                    onValueChange={() => {}}
                >
                    <TabsList className="grid grid-cols-4 mb-4 h-auto gap-1">
                        {TEST_CATEGORIES.map((cat) => (
                            <TabsTrigger
                                key={cat.label}
                                value={cat.label}
                                className="text-xs py-1.5"
                            >
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {TEST_CATEGORIES.map((cat) => (
                        <TabsContent key={cat.label} value={cat.label} className="mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {cat.tests.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => updateConfig({ testType: t.id as TestType })}
                                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                                            testType === t.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                                        }`}
                                    >
                                        <div className="font-medium text-sm text-gray-800">{t.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{t.description}</div>
                                    </button>
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {/* ── Configuration & Data ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Config panel */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-800">Settings</h2>

                    {/* Alpha */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Significance Level (α)</Label>
                        <Select
                            value={String(config.alpha)}
                            onValueChange={(v) => updateConfig({ alpha: parseFloat(v) })}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0.01">0.01 (1%)</SelectItem>
                                <SelectItem value="0.05">0.05 (5%)</SelectItem>
                                <SelectItem value="0.10">0.10 (10%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Alternative hypothesis */}
                    {needsAlt && (
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Alternative Hypothesis (H₁)</Label>
                            <Select
                                value={config.alternative}
                                onValueChange={(v) => updateConfig({ alternative: v as AlternativeHypothesis })}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="two-tailed">Two-Tailed (≠) — most common</SelectItem>
                                    <SelectItem value="right-tailed">Right-Tailed ({'>'}) </SelectItem>
                                    <SelectItem value="left-tailed">Left-Tailed ({'<'})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* μ₀ */}
                    {needsMu0 && testType !== 'two-sample-z' && (
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Hypothesized Value (μ₀)</Label>
                            <Input
                                type="number"
                                value={config.mu0}
                                onChange={(e) => updateConfig({ mu0: parseFloat(e.target.value) || 0 })}
                                className="mt-1.5"
                            />
                        </div>
                    )}

                    {/* σ one-sample */}
                    {needsSigma && testType === 'one-sample-z' && (
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Population Standard Deviation (σ)</Label>
                            <Input
                                type="number"
                                min="0.0001"
                                step="0.1"
                                value={config.sigma}
                                onChange={(e) => updateConfig({ sigma: parseFloat(e.target.value) || 1 })}
                                className="mt-1.5"
                            />
                        </div>
                    )}

                    {/* σ two-sample-z */}
                    {testType === 'two-sample-z' && (
                        <>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">σ₁ (Group 1 Population)</Label>
                                <Input type="number" min="0.0001" step="0.1" value={config.sigma} onChange={(e) => updateConfig({ sigma: parseFloat(e.target.value) || 1 })} className="mt-1.5" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">σ₂ (Group 2 Population)</Label>
                                <Input type="number" min="0.0001" step="0.1" value={config.sigma2} onChange={(e) => updateConfig({ sigma2: parseFloat(e.target.value) || 1 })} className="mt-1.5" />
                            </div>
                        </>
                    )}

                    {/* Pooled */}
                    {needsPooled && (
                        <div className="flex items-center gap-3">
                            <input
                                id="pooled"
                                type="checkbox"
                                checked={config.pooled}
                                onChange={(e) => updateConfig({ pooled: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                            />
                            <Label htmlFor="pooled" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Pooled variance (assume equal variances)
                            </Label>
                        </div>
                    )}
                </div>

                {/* Data panel */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">Input Data</h2>
                        <InputModeToggle mode={inputMode} onModeChange={handleModeSwitch} />
                    </div>

                    {inputMode === 'form' ? renderFormMode() : renderPasteMode()}
                </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <ArrowCounterClockwise className="w-4 h-4"  weight="duotone"/>
                    Reset
                </Button>
                <Button onClick={handleCalculate} className="gap-2 px-6">
                    <Flask className="w-4 h-4"  weight="duotone"/>
                    Calculate
                </Button>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <WarningCircle className="w-4 h-4 mt-0.5 shrink-0"  weight="duotone"/>
                    <span>{error}</span>
                </div>
            )}

            {/* ── Results ── */}
            {result && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{result.testName}</h2>
                            <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                                <span><strong>H₀:</strong> {result.h0}</span>
                                <span className="text-gray-300">|</span>
                                <span><strong>H₁:</strong> {result.h1}</span>
                            </div>
                        </div>
                        <Badge
                            className={`text-sm px-3 py-1 flex items-center gap-1.5 ${
                                result.reject
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : 'bg-green-100 text-green-700 border-green-200'
                            }`}
                            variant="outline"
                        >
                            {result.reject ? (
                                <XCircle className="w-3.5 h-3.5"  weight="duotone"/>
                            ) : (
                                <CheckCircle className="w-3.5 h-3.5"  weight="duotone"/>
                            )}
                            {result.reject ? 'Reject H₀' : 'Fail to Reject H₀'}
                        </Badge>
                    </div>

                    {/* Key stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[
                            { label: `Test statistic (${result.statisticLabel})`, value: fmt(result.statistic) },
                            ...(result.df !== undefined ? [{ label: 'Degrees of freedom (df)', value: result.df % 1 < 0.001 ? String(Math.round(result.df)) : fmt(result.df, 2) }] : []),
                            { label: 'p-value', value: result.pValue < 0.0001 ? '< 0.0001' : fmt(result.pValue) },
                            { label: `α`, value: String(result.alpha) },
                            ...(result.criticalValue !== undefined ? [{ label: 'Critical value', value: result.criticalValueLabel ?? fmt(result.criticalValue) }] : []),
                            ...(result.r !== undefined ? [{ label: 'r (Pearson)', value: fmt(result.r) }] : []),
                            ...(result.r2 !== undefined ? [{ label: 'r² (coefficient)', value: fmt(result.r2) }] : []),
                        ].map((item) => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                                <div className="font-bold text-gray-900 text-base">{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* ANOVA table */}
                    {result.ssb !== undefined && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">ANOVA Table</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            {['Source', 'SS', 'df', 'MS', 'F'].map((h) => (
                                                <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-3 py-2 font-medium border border-gray-200">Between Groups</td>
                                            <td className="px-3 py-2 border border-gray-200">{fmt(result.ssb!)}</td>
                                            <td className="px-3 py-2 border border-gray-200">{result.dfb}</td>
                                            <td className="px-3 py-2 border border-gray-200">{fmt(result.msb!)}</td>
                                            <td className="px-3 py-2 font-bold border border-gray-200">{fmt(result.statistic)}</td>
                                        </tr>
                                        <tr className="bg-gray-50/50">
                                            <td className="px-3 py-2 font-medium border border-gray-200">Within Groups</td>
                                            <td className="px-3 py-2 border border-gray-200">{fmt(result.ssw!)}</td>
                                            <td className="px-3 py-2 border border-gray-200">{result.dfw}</td>
                                            <td className="px-3 py-2 border border-gray-200">{fmt(result.msw!)}</td>
                                            <td className="px-3 py-2 border border-gray-200">—</td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 font-semibold border border-gray-200">Total</td>
                                            <td className="px-3 py-2 border border-gray-200">{fmt(result.sst!)}</td>
                                            <td className="px-3 py-2 border border-gray-200">{(result.dfb! + result.dfw!)}</td>
                                            <td className="px-3 py-2 border border-gray-200">—</td>
                                            <td className="px-3 py-2 border border-gray-200">—</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Descriptive stats */}
                    {result.descriptive && result.descriptive.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowDesc((v) => !v)}
                                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                            >
                                {showDesc ? <CaretUp className="w-4 h-4"  weight="duotone"/> : <CaretDown className="w-4 h-4"  weight="duotone"/>}
                                Descriptive Statistics
                            </button>
                            {showDesc && (
                                <div className="mt-2">
                                    <DescStats stats={result.descriptive} labels={result.groupLabels ?? result.descriptive.map((_, i) => `Group ${i + 1}`)} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Conclusion */}
                    <div className={`flex items-start gap-3 rounded-xl p-4 ${result.reject ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                        {result.reject ? (
                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"  weight="duotone"/>
                        ) : (
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5"  weight="duotone"/>
                        )}
                        <p className={`text-sm ${result.reject ? 'text-red-700' : 'text-green-700'}`}>
                            {result.conclusion}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
