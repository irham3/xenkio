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
    history: Partial<DataRow>[]; // Store previous states for undo/redo if needed, but for now just simple undo
}

export interface DataCheckerStats {
    total: number;
    checked: number;
    valid: number;
    invalid: number;
    unchecked: number;
    progress: number;
}
