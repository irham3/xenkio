'use client';

import { useState, useCallback } from 'react';
import {
    TestType,
    HypothesisTestResult,
    HypothesisTestConfig,
} from '../types';
import {
    parseNumbers,
    parseColumns,
    runOneSampleT,
    runTwoSampleT,
    runPairedT,
    runOneSampleZ,
    runTwoSampleZ,
    runChiSquareGoodness,
    runChiSquareIndependence,
    runOneWayAnova,
    runPearsonCorrelation,
} from '../lib/stats-utils';

export interface HypothesisTestState {
    config: HypothesisTestConfig;
    // Data inputs (raw text for each slot)
    data1: string;
    data2: string;
    observedInput: string;
    expectedInput: string;
    contingencyInput: string;
    anovaInput: string;
    // Result
    result: HypothesisTestResult | null;
    error: string | null;
}

const DEFAULT_CONFIG: HypothesisTestConfig = {
    testType: 'one-sample-t',
    alpha: 0.05,
    alternative: 'two-tailed',
    mu0: 0,
    sigma: 1,
    sigma2: 1,
    pooled: false,
};

export function useHypothesisTest() {
    const [state, setState] = useState<HypothesisTestState>({
        config: DEFAULT_CONFIG,
        data1: '',
        data2: '',
        observedInput: '',
        expectedInput: '',
        contingencyInput: '',
        anovaInput: '',
        result: null,
        error: null,
    });

    const updateConfig = useCallback(
        (patch: Partial<HypothesisTestConfig>) =>
            setState((s) => ({ ...s, config: { ...s.config, ...patch }, result: null, error: null })),
        [],
    );

    const setField = useCallback(
        (field: keyof Pick<HypothesisTestState, 'data1' | 'data2' | 'observedInput' | 'expectedInput' | 'contingencyInput' | 'anovaInput'>, value: string) =>
            setState((s) => ({ ...s, [field]: value, result: null, error: null })),
        [],
    );

    const calculate = useCallback(() => {
        try {
            const { config, data1, data2, observedInput, expectedInput, contingencyInput, anovaInput } = state;
            const { testType, alpha, alternative, mu0, sigma, pooled } = config;

            let result: HypothesisTestResult;

            switch (testType) {
                case 'one-sample-t': {
                    const d = parseNumbers(data1);
                    if (d.length < 2) throw new Error('Minimal 2 data diperlukan.');
                    result = runOneSampleT(d, mu0, alpha, alternative);
                    break;
                }
                case 'two-sample-t': {
                    const cols = parseColumns(data1 + '\n' + data2);
                    let g1: number[], g2: number[];
                    if (cols.length >= 2 && data2.trim() === '') {
                        g1 = cols[0];
                        g2 = cols[1];
                    } else {
                        g1 = parseNumbers(data1);
                        g2 = parseNumbers(data2);
                    }
                    if (g1.length < 2 || g2.length < 2) throw new Error('Minimal 2 data per grup.');
                    result = runTwoSampleT(g1, g2, alpha, alternative, pooled);
                    break;
                }
                case 'paired-t': {
                    const cols2 = parseColumns(data1);
                    let b: number[], a: number[];
                    if (cols2.length >= 2) {
                        b = cols2[0];
                        a = cols2[1];
                    } else {
                        b = parseNumbers(data1);
                        a = parseNumbers(data2);
                    }
                    if (b.length !== a.length || b.length < 2)
                        throw new Error('Kedua kolom harus memiliki jumlah data yang sama (min. 2).');
                    result = runPairedT(b, a, alpha, alternative);
                    break;
                }
                case 'one-sample-z': {
                    const d = parseNumbers(data1);
                    if (d.length < 2) throw new Error('Minimal 2 data diperlukan.');
                    if (sigma <= 0) throw new Error('σ populasi harus > 0.');
                    result = runOneSampleZ(d, mu0, sigma, alpha, alternative);
                    break;
                }
                case 'two-sample-z': {
                    const g1 = parseNumbers(data1);
                    const g2 = parseNumbers(data2);
                    if (g1.length < 2 || g2.length < 2) throw new Error('Minimal 2 data per grup.');
                    result = runTwoSampleZ(g1, g2, sigma, config.sigma2, alpha, alternative);
                    break;
                }
                case 'chi-square-goodness': {
                    const obs = parseNumbers(observedInput);
                    const exp = parseNumbers(expectedInput);
                    if (obs.length < 2) throw new Error('Minimal 2 kategori diperlukan.');
                    if (obs.length !== exp.length)
                        throw new Error('Jumlah nilai observed dan expected harus sama.');
                    if (exp.some((e) => e <= 0)) throw new Error('Nilai expected harus > 0.');
                    result = runChiSquareGoodness(obs, exp, alpha);
                    break;
                }
                case 'chi-square-independence': {
                    const rows = contingencyInput
                        .trim()
                        .split(/\n|\r\n/)
                        .map((r) =>
                            r
                                .split(/[\t,;]/)
                                .map((c) => Number(c.trim()))
                                .filter((v) => !isNaN(v)),
                        )
                        .filter((r) => r.length > 0);
                    if (rows.length < 2) throw new Error('Minimal 2 baris diperlukan.');
                    const colLen = rows[0].length;
                    if (colLen < 2) throw new Error('Minimal 2 kolom diperlukan.');
                    if (rows.some((r) => r.length !== colLen))
                        throw new Error('Semua baris harus memiliki jumlah kolom yang sama.');
                    result = runChiSquareIndependence(rows, alpha);
                    break;
                }
                case 'one-way-anova': {
                    const cols = parseColumns(anovaInput);
                    if (cols.length < 2) throw new Error('Minimal 2 grup diperlukan (kolom terpisah tab/koma).');
                    if (cols.some((g) => g.length < 2)) throw new Error('Setiap grup harus memiliki minimal 2 data.');
                    result = runOneWayAnova(cols, alpha);
                    break;
                }
                case 'pearson-correlation': {
                    const cols = parseColumns(data1);
                    let x: number[], y: number[];
                    if (cols.length >= 2) {
                        x = cols[0];
                        y = cols[1];
                    } else {
                        x = parseNumbers(data1);
                        y = parseNumbers(data2);
                    }
                    if (x.length !== y.length || x.length < 3)
                        throw new Error('X dan Y harus memiliki jumlah data yang sama (min. 3).');
                    result = runPearsonCorrelation(x, y, alpha, alternative);
                    break;
                }
                default:
                    throw new Error('Jenis uji tidak dikenal.');
            }

            setState((s) => ({ ...s, result, error: null }));
        } catch (e) {
            setState((s) => ({ ...s, result: null, error: (e as Error).message }));
        }
    }, [state]);

    const reset = useCallback(() => {
        setState({
            config: DEFAULT_CONFIG,
            data1: '',
            data2: '',
            observedInput: '',
            expectedInput: '',
            contingencyInput: '',
            anovaInput: '',
            result: null,
            error: null,
        });
    }, []);

    return { state, updateConfig, setField, calculate, reset };
}

export type TestCategory = {
    label: string;
    tests: { id: TestType; label: string; description: string }[];
};

export const TEST_CATEGORIES: TestCategory[] = [
    {
        label: 'Uji t',
        tests: [
            { id: 'one-sample-t', label: 'One-Sample t-Test', description: 'Bandingkan rata-rata sampel dengan nilai hipotesis' },
            { id: 'two-sample-t', label: 'Two-Sample t-Test', description: 'Bandingkan rata-rata dua kelompok independen' },
            { id: 'paired-t', label: 'Paired t-Test', description: 'Bandingkan dua pengukuran pada subjek yang sama (sebelum–sesudah)' },
        ],
    },
    {
        label: 'Uji Z',
        tests: [
            { id: 'one-sample-z', label: 'One-Sample Z-Test', description: 'Uji rata-rata dengan varians populasi diketahui' },
            { id: 'two-sample-z', label: 'Two-Sample Z-Test', description: 'Bandingkan dua rata-rata dengan varians populasi diketahui' },
        ],
    },
    {
        label: 'Chi-Square',
        tests: [
            { id: 'chi-square-goodness', label: 'Chi-Square Goodness-of-Fit', description: 'Uji apakah distribusi data sesuai ekspektasi' },
            { id: 'chi-square-independence', label: 'Chi-Square Independence', description: 'Uji hubungan antara dua variabel kategorikal' },
        ],
    },
    {
        label: 'ANOVA & Korelasi',
        tests: [
            { id: 'one-way-anova', label: 'One-Way ANOVA', description: 'Bandingkan rata-rata tiga kelompok atau lebih' },
            { id: 'pearson-correlation', label: 'Korelasi Pearson', description: 'Uji kekuatan hubungan linear antara dua variabel' },
        ],
    },
];
