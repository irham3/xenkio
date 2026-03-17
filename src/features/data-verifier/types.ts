export type MatchStatus = 'identical' | 'partial' | 'mismatch' | 'missing_in_target' | 'missing_in_source' | 'duplicate';

export type MatchType = 'exact' | 'contains' | 'fuzzy';

export type DataSource = {
    id: string;
    name: string;
    headers: string[];
    rows: Record<string, string>[];
    sourceKey: string;
    targetKey: string;
};

export type ColumnMapping = {
    sourceId: string;
    sourceColumn: string;
    targetColumn: string;
    matchType: MatchType;
};

export type AuditEntry = {
    rowId: string;
    timestamp: number;
    column: string;
    oldValue: string;
    newValue: string;
};

export type VerificationRow = {
    _id: string;
    sourceData: Record<string, Record<string, string>> | null;
    targetData: Record<string, string> | null;
    originalTargetData: Record<string, string> | null; // Added for Audit Trail
    status: MatchStatus;
    mismatchedColumns: string[];
    partialColumns: string[];
    isDuplicate?: boolean;
};

export type VerificationState = {
    targetHeaders: string[];
    targetRaw: Record<string, string>[];
    sources: DataSource[];
    columnMappings: ColumnMapping[];
    results: VerificationRow[];
    auditLog: AuditEntry[]; // Added for Audit Trail
    checkDuplicates: boolean;
    duplicateKey: string;
};
