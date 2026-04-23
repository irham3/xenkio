
export type IdTypeKey =
    | 'uuid-v4'
    | 'uuid-v7'
    | 'ulid'
    | 'nanoid-21'
    | 'nanoid-10'
    | 'custom';

export interface IdTypeDefinition {
    key: IdTypeKey;
    label: string;
    shortLabel: string;
    bits: number;
    description: string;
    example: string;
}

export interface CollisionResult {
    probability: number;        // 0–1
    probabilityPct: string;     // e.g. "0.0000042%"
    riskLevel: RiskLevel;
    safeCount50: string;        // IDs before 50% collision chance
    safeCount1pct: string;      // IDs before 1% collision chance
    safeCount1in1million: string; // IDs before 1-in-a-million (0.0001%) collision chance
    idCount: number;
    bitsOfEntropy: number;
    spaceSize: string;          // formatted string like "5.3 × 10^36"
}

export type RiskLevel = 'negligible' | 'low' | 'moderate' | 'high' | 'critical';

export interface CollisionConfig {
    idType: IdTypeKey;
    customBits: number;
    idCount: number;
}
