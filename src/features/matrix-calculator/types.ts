export type MatrixOperation =
    | 'transpose'
    | 'determinant'
    | 'inverse'
    | 'add'
    | 'subtract'
    | 'multiply'
    | 'scalar-multiply'
    | 'trace'
    | 'rank'
    | 'power';

export type Matrix = number[][];

export interface MatrixSize {
    rows: number;
    cols: number;
}

export interface OperationDef {
    id: MatrixOperation;
    label: string;
    symbol: string;
    description: string;
    isBinary: boolean;
    requiresSquare: boolean;
    hasScalarInput: boolean;
    hasPowerInput: boolean;
    resultType: 'matrix' | 'scalar';
}

export interface MatrixResult {
    type: 'matrix' | 'scalar';
    matrix?: Matrix;
    scalar?: number;
    error?: string;
}
