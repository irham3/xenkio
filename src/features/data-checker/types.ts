export type RowStatus = 'unchecked' | 'valid' | 'invalid';

export interface DataRow {
    id: string;
    index: number;
    value: string;
    status: RowStatus;
    comment: string;
}

export interface DataCheckerState {
    rows: DataRow[];
    rawInput: string;
    currentIndex: number;
}

export interface DataCheckerStats {
    total: number;
    checked: number;
    valid: number;
    invalid: number;
    unchecked: number;
    progress: number;
}
