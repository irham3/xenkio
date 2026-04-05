import { DescriptiveStats, HypothesisTestResult, AlternativeHypothesis } from '../types';

// ── Descriptive stats ──────────────────────────────────────────────────────

export function descriptive(data: number[]): DescriptiveStats {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const sorted = [...data].sort((a, b) => a - b);
    const median =
        n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const variance = data.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
    const std = Math.sqrt(variance);
    return { n, mean, std, se: std / Math.sqrt(n), min: sorted[0], max: sorted[n - 1], median };
}

// ── Normal distribution (standard) ────────────────────────────────────────

/** Approximation of the CDF of the standard normal. */
export function normalCdf(z: number): number {
    const a1 = 0.254829592,
        a2 = -0.284496736,
        a3 = 1.421413741,
        a4 = -1.453152027,
        a5 = 1.061405429;
    const p = 0.3275911;
    const sign = z < 0 ? -1 : 1;
    const x = Math.abs(z) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * erf);
}

export function normalPvalue(z: number, alt: AlternativeHypothesis): number {
    if (alt === 'two-tailed') return 2 * (1 - normalCdf(Math.abs(z)));
    if (alt === 'right-tailed') return 1 - normalCdf(z);
    return normalCdf(z);
}

export function normalCritical(alpha: number, alt: AlternativeHypothesis): number {
    if (alt === 'two-tailed') return invNormalCdf(1 - alpha / 2);
    if (alt === 'right-tailed') return invNormalCdf(1 - alpha);
    return invNormalCdf(alpha);
}

/** Inverse normal CDF (Beasley-Springer-Moro algorithm). */
export function invNormalCdf(p: number): number {
    const a = [
        -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
        -3.066479806614716e1, 2.506628277459239,
    ];
    const b = [
        -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
        -1.328068155288572e1,
    ];
    const c = [
        -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
        4.374664141464968, 2.938163982698783,
    ];
    const d = [
        7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
    ];
    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    if (p < pLow) {
        const q = Math.sqrt(-2 * Math.log(p));
        return (
            (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
        );
    }
    if (p <= pHigh) {
        const q = p - 0.5;
        const r = q * q;
        return (
            ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
        );
    }
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
        (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
}

// ── t-distribution ────────────────────────────────────────────────────────

/** Regularized incomplete beta function via continued fraction (Lentz). */
function betaCf(a: number, b: number, x: number): number {
    const MAXIT = 200;
    const EPS = 3e-7;
    const FPMIN = 1e-30;
    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - (qab * x) / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
        const m2 = 2 * m;
        let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
        d = 1 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1 / d;
        h *= d * c;
        aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
        d = 1 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1 / d;
        const del = d * c;
        h *= del;
        if (Math.abs(del - 1) < EPS) break;
    }
    return h;
}

function betai(a: number, b: number, x: number): number {
    if (x < 0 || x > 1) return NaN;
    if (x === 0) return 0;
    if (x === 1) return 1;
    const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
    const front = (Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a) * betaCf(a, b, x);
    if (x < (a + 1) / (a + b + 2)) return front;
    return 1 - (Math.exp(Math.log(1 - x) * b + Math.log(x) * a - lbeta) / b) * betaCf(b, a, 1 - x);
}

function lgamma(x: number): number {
    const coef = [
        76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
        0.001208650973866179, -0.000005395239384953,
    ];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (const c of coef) ser += c / ++y;
    return -tmp + Math.log((2.506628274631 * ser) / x);
}

/** Two-tailed p-value from t statistic with df degrees of freedom. */
export function tPvalue(t: number, df: number, alt: AlternativeHypothesis): number {
    const x = df / (df + t * t);
    const oneTail = 0.5 * betai(df / 2, 0.5, x);
    if (alt === 'two-tailed') return 2 * oneTail;
    if (alt === 'right-tailed') return t >= 0 ? oneTail : 1 - oneTail;
    return t <= 0 ? oneTail : 1 - oneTail;
}

export function tCritical(alpha: number, df: number, alt: AlternativeHypothesis): number {
    const a = alt === 'two-tailed' ? alpha / 2 : alpha;
    return invT(1 - a, df);
}

/** Approximate inverse t CDF via Newton-Raphson on the CDF. */
function invT(p: number, df: number): number {
    // Start with normal approximation
    let t = invNormalCdf(p);
    for (let i = 0; i < 50; i++) {
        const pt = 1 - tPvalue(Math.abs(t), df, 'right-tailed');
        const pdf =
            Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(Math.PI * df)) *
            Math.pow(1 + (t * t) / df, -(df + 1) / 2);
        const err = pt - p;
        if (Math.abs(err) < 1e-10) break;
        t -= err / pdf;
    }
    return t;
}

// ── Chi-square distribution ────────────────────────────────────────────────

function gammaCdf(x: number, a: number): number {
    if (x < 0) return 0;
    if (x < a + 1) return gammaIncLower(x, a);
    return 1 - gammaIncUpper(x, a);
}

function gammaIncLower(x: number, a: number): number {
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 200; n++) {
        term *= x / (a + n);
        sum += term;
        if (Math.abs(term) < Math.abs(sum) * 1e-10) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
}

function gammaIncUpper(x: number, a: number): number {
    let b = x + 1 - a;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i <= 200; i++) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        c = b + an / c;
        if (Math.abs(c) < 1e-30) c = 1e-30;
        d = 1 / d;
        h *= d * c;
        if (Math.abs(d * c - 1) < 1e-10) break;
    }
    return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
}

export function chiSquarePvalue(chi2: number, df: number): number {
    return 1 - gammaCdf(chi2 / 2, df / 2);
}

export function chiSquareCritical(alpha: number, df: number): number {
    // Newton-Raphson
    let x = df * Math.pow(1 - (2 / (9 * df)) + invNormalCdf(1 - alpha) * Math.sqrt(2 / (9 * df)), 3);
    if (x < 0) x = 0.001;
    for (let i = 0; i < 50; i++) {
        const p = chiSquarePvalue(x, df);
        const pdf =
            Math.exp(((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.log(2) - lgamma(df / 2)));
        const err = p - alpha;
        if (Math.abs(err) < 1e-10) break;
        if (pdf < 1e-30) break;
        x += err / pdf;
        if (x < 0) x = 1e-6;
    }
    return x;
}

// ── F-distribution ─────────────────────────────────────────────────────────

export function fPvalue(f: number, df1: number, df2: number): number {
    const x = df2 / (df2 + df1 * f);
    return betai(df2 / 2, df1 / 2, x);
}

export function fCritical(alpha: number, df1: number, df2: number): number {
    let low = 0;
    let high = 1e6;
    for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        const p = fPvalue(mid, df1, df2);
        if (p > alpha) {
            low = mid;
        } else {
            high = mid;
        }
        if (Math.abs(high - low) < 1e-9) break;
    }
    return high;
}

// ── Parsing helpers ────────────────────────────────────────────────────────

/** Parse a blob of text (Excel paste, CSV, space/newline-separated). */
export function parseNumbers(text: string): number[] {
    return text
        .split(/[\s,;\t\n\r]+/)
        .map((s) => s.trim().replace(/,/g, '.'))
        .filter((s) => s.length > 0)
        .map(Number)
        .filter((n) => !isNaN(n));
}

/** Parse multiple columns (tab/comma separated). Returns array of columns. */
export function parseColumns(text: string): number[][] {
    const rows = text
        .trim()
        .split(/\n|\r\n/)
        .map((r) =>
            r
                .split(/[\t,;]/)
                .map((c) => c.trim().replace(/,/g, '.'))
                .map(Number),
        )
        .filter((r) => r.every((v) => !isNaN(v)) && r.length > 0);
    if (rows.length === 0) return [];
    const numCols = rows[0].length;
    return Array.from({ length: numCols }, (_, i) => rows.map((r) => r[i]));
}

// ── Individual test runners ────────────────────────────────────────────────

function altLabel(alt: AlternativeHypothesis): string {
    return alt === 'two-tailed' ? '≠' : alt === 'right-tailed' ? '>' : '<';
}

function criticalValueLabel(cv: number, alt: AlternativeHypothesis): string {
    return alt === 'two-tailed' ? `±${cv.toFixed(4)}` : cv.toFixed(4);
}

export function runOneSampleT(
    data: number[],
    mu0: number,
    alpha: number,
    alt: AlternativeHypothesis,
): HypothesisTestResult {
    const s = descriptive(data);
    const t = s.se === 0 ? (s.mean === mu0 ? 0 : (s.mean > mu0 ? Infinity : -Infinity)) : (s.mean - mu0) / s.se;
    const df = s.n - 1;
    const pValue = tPvalue(t, df, alt);
    const cv = tCritical(alpha, df, alt);
    const reject = pValue < alpha;
    const label = altLabel(alt);
    return {
        testName: 'One-Sample t-Test',
        h0: `μ = ${mu0}`,
        h1: `μ ${label} ${mu0}`,
        statistic: t,
        statisticLabel: 't',
        df,
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: criticalValueLabel(cv, alt),
        reject,
        conclusion: reject
            ? `Reject H₀. Sufficient evidence that the mean is different from ${mu0} (α=${alpha}).`
            : `Fail to reject H₀. Insufficient evidence that the mean is different from ${mu0} (α=${alpha}).`,
        descriptive: [s],
        groupLabels: ['Data'],
    };
}

export function runTwoSampleT(
    g1: number[],
    g2: number[],
    alpha: number,
    alt: AlternativeHypothesis,
    pooled: boolean,
): HypothesisTestResult {
    const s1 = descriptive(g1);
    const s2 = descriptive(g2);
    let t: number, df: number;
    if (pooled) {
        const sp2 =
            ((s1.n - 1) * s1.std ** 2 + (s2.n - 1) * s2.std ** 2) / (s1.n + s2.n - 2);
        const se = Math.sqrt(sp2 * (1 / s1.n + 1 / s2.n));
        t = se === 0 ? (s1.mean === s2.mean ? 0 : (s1.mean > s2.mean ? Infinity : -Infinity)) : (s1.mean - s2.mean) / se;
        df = s1.n + s2.n - 2;
    } else {
        // Welch
        const se = Math.sqrt(s1.std ** 2 / s1.n + s2.std ** 2 / s2.n);
        t = se === 0 ? (s1.mean === s2.mean ? 0 : (s1.mean > s2.mean ? Infinity : -Infinity)) : (s1.mean - s2.mean) / se;
        const num = (s1.std ** 2 / s1.n + s2.std ** 2 / s2.n) ** 2;
        const den =
            (s1.std ** 2 / s1.n) ** 2 / (s1.n - 1) + (s2.std ** 2 / s2.n) ** 2 / (s2.n - 1);
        df = num / den;
    }
    const pValue = tPvalue(t, df, alt);
    const cv = tCritical(alpha, df, alt);
    const reject = pValue < alpha;
    const label = altLabel(alt);
    return {
        testName: `Two-Sample t-Test (${pooled ? 'Pooled' : 'Welch'})`,
        h0: 'μ₁ = μ₂',
        h1: `μ₁ ${label} μ₂`,
        statistic: t,
        statisticLabel: 't',
        df,
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: criticalValueLabel(cv, alt),
        reject,
        conclusion: reject
            ? `Reject H₀. Sufficient evidence of a difference in means between the two groups (α=${alpha}).`
            : `Fail to reject H₀. Insufficient evidence of a difference in means between the two groups (α=${alpha}).`,
        descriptive: [s1, s2],
        groupLabels: ['Group 1', 'Group 2'],
    };
}

export function runPairedT(
    before: number[],
    after: number[],
    alpha: number,
    alt: AlternativeHypothesis,
): HypothesisTestResult {
    const diffs = before.map((b, i) => b - after[i]);
    const s = descriptive(diffs);
    const t = s.se === 0 ? (s.mean === 0 ? 0 : (s.mean > 0 ? Infinity : -Infinity)) : s.mean / s.se;
    const df = s.n - 1;
    const pValue = tPvalue(t, df, alt);
    const cv = tCritical(alpha, df, alt);
    const reject = pValue < alpha;
    const label = altLabel(alt);
    return {
        testName: 'Paired t-Test',
        h0: 'μd = 0',
        h1: `μd ${label} 0`,
        statistic: t,
        statisticLabel: 't',
        df,
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: criticalValueLabel(cv, alt),
        reject,
        conclusion: reject
            ? `Reject H₀. Sufficient evidence of a difference before and after treatment (α=${alpha}).`
            : `Fail to reject H₀. Insufficient evidence of a difference before and after treatment (α=${alpha}).`,
        descriptive: [descriptive(before), descriptive(after), s],
        groupLabels: ['Before', 'After', 'Difference (d)'],
    };
}

export function runOneSampleZ(
    data: number[],
    mu0: number,
    sigma: number,
    alpha: number,
    alt: AlternativeHypothesis,
): HypothesisTestResult {
    const s = descriptive(data);
    const z = (s.mean - mu0) / (sigma / Math.sqrt(s.n));
    const pValue = normalPvalue(z, alt);
    const cv = normalCritical(alpha, alt);
    const reject = pValue < alpha;
    const label = altLabel(alt);
    return {
        testName: 'One-Sample Z-Test',
        h0: `μ = ${mu0}`,
        h1: `μ ${label} ${mu0}`,
        statistic: z,
        statisticLabel: 'z',
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: criticalValueLabel(cv, alt),
        reject,
        conclusion: reject
            ? `Reject H₀. Sufficient evidence that the mean is different from ${mu0} (α=${alpha}).`
            : `Fail to reject H₀. Insufficient evidence that the mean is different from ${mu0} (α=${alpha}).`,
        descriptive: [s],
        groupLabels: ['Data'],
    };
}

export function runTwoSampleZ(
    g1: number[],
    g2: number[],
    sigma1: number,
    sigma2: number,
    alpha: number,
    alt: AlternativeHypothesis,
): HypothesisTestResult {
    const s1 = descriptive(g1);
    const s2 = descriptive(g2);
    const se = Math.sqrt(sigma1 ** 2 / s1.n + sigma2 ** 2 / s2.n);
    const z = (s1.mean - s2.mean) / se;
    const pValue = normalPvalue(z, alt);
    const cv = normalCritical(alpha, alt);
    const reject = pValue < alpha;
    const label = altLabel(alt);
    return {
        testName: 'Two-Sample Z-Test',
        h0: 'μ₁ = μ₂',
        h1: `μ₁ ${label} μ₂`,
        statistic: z,
        statisticLabel: 'z',
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: criticalValueLabel(cv, alt),
        reject,
        conclusion: reject
            ? `Reject H₀. Sufficient evidence of a difference in means between the two groups (α=${alpha}).`
            : `Fail to reject H₀. Insufficient evidence of a difference in means between the two groups (α=${alpha}).`,
        descriptive: [s1, s2],
        groupLabels: ['Group 1', 'Group 2'],
    };
}

export function runChiSquareGoodness(
    observed: number[],
    expected: number[],
    alpha: number,
): HypothesisTestResult {
    const chi2 = observed.reduce((acc, o, i) => acc + (o - expected[i]) ** 2 / expected[i], 0);
    const df = observed.length - 1;
    const pValue = chiSquarePvalue(chi2, df);
    const cv = chiSquareCritical(alpha, df);
    const reject = pValue < alpha;
    return {
        testName: 'Chi-Square Goodness-of-Fit',
        h0: 'Data follows the expected distribution',
        h1: 'Data does not follow the expected distribution',
        statistic: chi2,
        statisticLabel: 'χ²',
        df,
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: cv.toFixed(4),
        reject,
        conclusion: reject
            ? `Reject H₀. Data does not follow the expected distribution (α=${alpha}).`
            : `Fail to reject H₀. Data follows the expected distribution (α=${alpha}).`,
    };
}

export function runChiSquareIndependence(
    table: number[][],
    alpha: number,
): HypothesisTestResult {
    const rows = table.length;
    const cols = table[0].length;
    const rowSums = table.map((r) => r.reduce((a, b) => a + b, 0));
    const colSums = Array.from({ length: cols }, (_, j) =>
        table.reduce((a, r) => a + r[j], 0),
    );
    const total = rowSums.reduce((a, b) => a + b, 0);
    let chi2 = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const e = (rowSums[i] * colSums[j]) / total;
            chi2 += (table[i][j] - e) ** 2 / e;
        }
    }
    const df = (rows - 1) * (cols - 1);
    const pValue = chiSquarePvalue(chi2, df);
    const cv = chiSquareCritical(alpha, df);
    const reject = pValue < alpha;
    return {
        testName: 'Chi-Square Test of Independence',
        h0: 'Both variables are independent',
        h1: 'Both variables are not independent (there is an association)',
        statistic: chi2,
        statisticLabel: 'χ²',
        df,
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: cv.toFixed(4),
        reject,
        conclusion: reject
            ? `Reject H₀. There is a significant association between the two variables (α=${alpha}).`
            : `Fail to reject H₀. No evidence of an association between the two variables (α=${alpha}).`,
    };
}

export function runOneWayAnova(
    groups: number[][],
    alpha: number,
): HypothesisTestResult {
    const k = groups.length;
    const stats = groups.map(descriptive);
    const nTotal = stats.reduce((a, s) => a + s.n, 0);
    const grandMean = stats.reduce((a, s) => a + s.mean * s.n, 0) / nTotal;
    const ssb = stats.reduce((a, s) => a + s.n * (s.mean - grandMean) ** 2, 0);
    const ssw = stats.reduce(
        (acc, s, gi) => acc + groups[gi].reduce((a, v) => a + (v - s.mean) ** 2, 0),
        0,
    );
    const sst = ssb + ssw;
    const dfb = k - 1;
    const dfw = nTotal - k;
    const msb = ssb / dfb;
    const msw = ssw / dfw;
    const f = msw === 0 ? (msb === 0 ? 0 : Infinity) : msb / msw;
    const pValue = fPvalue(f, dfb, dfw);
    const cv = fCritical(alpha, dfb, dfw);
    const reject = pValue < alpha;
    return {
        testName: 'One-Way ANOVA',
        h0: 'μ₁ = μ₂ = ... = μₖ (all means are equal)',
        h1: 'At least one mean is different',
        statistic: f,
        statisticLabel: 'F',
        df: dfb,
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: cv.toFixed(4),
        reject,
        conclusion: reject
            ? `Reject H₀. At least one group has a different mean (α=${alpha}).`
            : `Fail to reject H₀. No significant difference in means between groups (α=${alpha}).`,
        descriptive: stats,
        groupLabels: groups.map((_, i) => `Group ${i + 1}`),
        ssb,
        ssw,
        sst,
        dfb,
        dfw,
        msb,
        msw,
    };
}

export function runPearsonCorrelation(
    x: number[],
    y: number[],
    alpha: number,
    alt: AlternativeHypothesis,
): HypothesisTestResult {
    const n = x.length;
    const sx = descriptive(x);
    const sy = descriptive(y);
    const cov = x.reduce((a, xi, i) => a + (xi - sx.mean) * (y[i] - sy.mean), 0) / (n - 1);
    const r = cov / (sx.std * sy.std);
    const r2 = r * r;
    const t = (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r2);
    const df = n - 2;
    const pValue = tPvalue(t, df, alt);
    const cv = tCritical(alpha, df, alt);
    const reject = pValue < alpha;
    const label = altLabel(alt);
    return {
        testName: 'Pearson Correlation',
        h0: 'ρ = 0 (no linear correlation)',
        h1: `ρ ${label} 0`,
        statistic: t,
        statisticLabel: 't',
        df,
        pValue,
        alpha,
        criticalValue: cv,
        criticalValueLabel: criticalValueLabel(cv, alt),
        reject,
        conclusion: reject
            ? `Reject H₀. There is a significant linear correlation (r = ${r.toFixed(4)}, α=${alpha}).`
            : `Fail to reject H₀. No evidence of a significant linear correlation (α=${alpha}).`,
        descriptive: [sx, sy],
        groupLabels: ['X', 'Y'],
        r,
        r2,
    };
}
