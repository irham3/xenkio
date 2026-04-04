export type TestType =
    | 'one-sample-t'
    | 'two-sample-t'
    | 'paired-t'
    | 'one-sample-z'
    | 'two-sample-z'
    | 'chi-square-goodness'
    | 'chi-square-independence'
    | 'one-way-anova'
    | 'pearson-correlation';

export type AlternativeHypothesis = 'two-tailed' | 'left-tailed' | 'right-tailed';

export interface TestDefinition {
    id: TestType;
    label: string;
    description: string;
    category: string;
}

export type DataInputMode = 'paste' | 'manual';

export interface HypothesisTestConfig {
    testType: TestType;
    alpha: number;
    alternative: AlternativeHypothesis;
    // One-sample inputs
    mu0: number;
    sigma: number;
    sigma2: number;
    // Two-sample / paired
    pooled: boolean;
}

export interface ParsedData {
    group1: number[];
    group2: number[];
    observed: number[];
    expected: number[];
    groups: number[][];
    contingencyTable: number[][];
}

export interface DescriptiveStats {
    n: number;
    mean: number;
    std: number;
    se: number;
    min: number;
    max: number;
    median: number;
}

export interface HypothesisTestResult {
    testName: string;
    h0: string;
    h1: string;
    statistic: number;
    statisticLabel: string;
    df?: number;
    pValue: number;
    alpha: number;
    criticalValue?: number;
    criticalValueLabel?: string;
    reject: boolean;
    conclusion: string;
    descriptive?: DescriptiveStats[];
    groupLabels?: string[];
    // ANOVA specifics
    ssb?: number;
    ssw?: number;
    sst?: number;
    dfb?: number;
    dfw?: number;
    msb?: number;
    msw?: number;
    // Correlation specifics
    r?: number;
    r2?: number;
}
