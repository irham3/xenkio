
import { IdTypeDefinition, IdTypeKey, CollisionResult, RiskLevel } from '../types';

export const ID_TYPES: IdTypeDefinition[] = [
    {
        key: 'uuid-v4',
        label: 'UUID v4',
        shortLabel: 'UUID v4',
        bits: 122,
        description: '128-bit with 122 random bits (6 bits fixed for version/variant).',
        example: '550e8400-e29b-41d4-a716-446655440000',
    },
    {
        key: 'uuid-v7',
        label: 'UUID v7',
        shortLabel: 'UUID v7',
        bits: 74,
        description: '128-bit time-ordered UUID with 74 random bits per timestamp window.',
        example: '018e9b5c-5d0a-7d2f-a716-446655440000',
    },
    {
        key: 'ulid',
        label: 'ULID',
        shortLabel: 'ULID',
        bits: 80,
        description: '128-bit with 48-bit timestamp + 80 random bits per millisecond.',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    },
    {
        key: 'nanoid-21',
        label: 'NanoID (21 chars)',
        shortLabel: 'NanoID-21',
        bits: 126,
        description: '21 characters from a 64-character alphabet ≈ 126 bits of entropy.',
        example: 'V1StGXR8_Z5jdHi6B-myT',
    },
    {
        key: 'nanoid-10',
        label: 'NanoID (10 chars)',
        shortLabel: 'NanoID-10',
        bits: 60,
        description: '10 characters from a 64-character alphabet ≈ 60 bits of entropy.',
        example: 'irCdc8_K9x',
    },
    {
        key: 'custom',
        label: 'Custom',
        shortLabel: 'Custom',
        bits: 64,
        description: 'Enter a custom bit length for any identifier scheme.',
        example: '',
    },
];

export function getIdType(key: IdTypeKey): IdTypeDefinition {
    return ID_TYPES.find((t) => t.key === key) ?? ID_TYPES[0];
}

/**
 * Compute collision probability using the Birthday Problem approximation.
 * P(collision) ≈ 1 - exp(-n² / (2·N))
 * where N = 2^bits.
 *
 * To avoid numeric overflow with large exponents we work in log space:
 *   exponent = -n² / (2·2^bits)
 *            = -exp(2·ln(n) - (bits+1)·ln(2))
 */
export function calcCollisionProbability(n: number, bits: number): number {
    if (n <= 1) return 0;

    // log of n²/(2·2^bits) in natural log
    const logNumer = 2 * Math.log(n);       // ln(n²)
    const logDenom = (bits + 1) * Math.LN2; // ln(2·2^bits) = (bits+1)·ln2
    const logRatio = logNumer - logDenom;   // ln(n²/(2·2^bits))

    // the exponent inside exp() is -exp(logRatio)
    const exponent = -Math.exp(logRatio);

    if (exponent < -700) return 1.0;  // exp(-700) ≈ 0, so collision ≈ certain
    if (exponent > -1e-15) return -exponent; // Taylor: 1 - e^x ≈ -x for tiny x

    return 1 - Math.exp(exponent);
}

/**
 * Find n such that P(collision) ≈ targetP.
 * Inverting Birthday formula: n ≈ sqrt(-2·N·ln(1-p)) ≈ sqrt(2·N·ln(1/(1-p)))
 * In log space: ln(n) = 0.5·(bits·ln2 + ln(2·(-ln(1-p))))
 */
export function safeCountForProbability(p: number, bits: number): number {
    // ln(N) = bits * ln(2)
    const lnN = bits * Math.LN2;
    // -ln(1-p) ≈ p for small p, but use exact form
    const innerLog = Math.log(-Math.log(1 - p));  // ln(-ln(1-p))
    const lnN2 = Math.LN2;                         // ln(2)
    const logN_val = lnN2 + lnN + innerLog;        // ln(2*N*(-ln(1-p)))
    return Math.round(Math.exp(0.5 * logN_val));
}

/** Format very large numbers in scientific notation, e.g. "5.32 × 10^36" */
export function formatScientific(n: number): string {
    if (n === 0) return '0';
    const exp = Math.floor(Math.log10(n));
    const mantissa = n / Math.pow(10, exp);
    return `${mantissa.toFixed(2)} × 10^${exp}`;
}

/** Format a large integer count in a human-readable way */
export function formatCount(n: number): string {
    if (!isFinite(n) || n > 1e300) return '∞';
    if (n >= 1e24) return `${formatScientific(n)}`;
    if (n >= 1e18) return `${(n / 1e18).toFixed(2)} × 10^18`;
    if (n >= 1e15) return `${(n / 1e15).toFixed(2)} quadrillion`;
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)} trillion`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)} billion`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)} million`;
    return n.toLocaleString();
}

/** Format probability as readable percentage */
export function formatProbability(p: number): string {
    if (p <= 0) return '0%';
    if (p >= 1) return '100%';
    if (p < 1e-15) {
        const exp = Math.floor(Math.log10(p));
        const m = p / Math.pow(10, exp);
        return `${m.toFixed(2)} × 10^${exp}%`;
    }
    if (p < 0.0001) {
        return `${(p * 100).toExponential(2)}%`;
    }
    if (p < 0.01) return `${(p * 100).toFixed(6)}%`;
    if (p < 0.1) return `${(p * 100).toFixed(4)}%`;
    return `${(p * 100).toFixed(2)}%`;
}

function getRiskLevel(p: number): RiskLevel {
    if (p < 1e-15) return 'negligible';
    if (p < 0.001) return 'low';
    if (p < 0.1) return 'moderate';
    if (p < 0.5) return 'high';
    return 'critical';
}

/** Main entry point: compute all collision stats */
export function computeCollisionResult(n: number, bits: number): CollisionResult {
    const probability = calcCollisionProbability(n, bits);
    const N = Math.pow(2, bits); // may be Infinity for large bits; we use formatScientific

    return {
        probability,
        probabilityPct: formatProbability(probability),
        riskLevel: getRiskLevel(probability),
        safeCount50: formatCount(safeCountForProbability(0.5, bits)),
        safeCount1pct: formatCount(safeCountForProbability(0.01, bits)),
        safeCount1in1million: formatCount(safeCountForProbability(0.00001, bits)),
        idCount: n,
        bitsOfEntropy: bits,
        spaceSize: formatScientific(N),
    };
}
