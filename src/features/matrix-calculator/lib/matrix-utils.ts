import type { Matrix } from '../types';

export function createMatrix(rows: number, cols: number, value = 0): Matrix {
    return Array.from({ length: rows }, () => Array(cols).fill(value));
}

export function identityMatrix(size: number): Matrix {
    return Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
    );
}

export function transposeMatrix(matrix: Matrix): Matrix {
    const rows = matrix.length;
    const cols = matrix[0].length;
    return Array.from({ length: cols }, (_, j) =>
        Array.from({ length: rows }, (_, i) => matrix[i][j])
    );
}

export function addMatrices(a: Matrix, b: Matrix): Matrix {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

export function subtractMatrices(a: Matrix, b: Matrix): Matrix {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
    const rows = a.length;
    const cols = b[0].length;
    const inner = b.length;
    return Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) =>
            Array.from({ length: inner }, (_, k) => a[i][k] * b[k][j]).reduce(
                (sum, v) => sum + v,
                0
            )
        )
    );
}

export function scalarMultiply(scalar: number, matrix: Matrix): Matrix {
    return matrix.map((row) => row.map((val) => scalar * val));
}

export function traceMatrix(matrix: Matrix): number {
    return matrix.reduce((sum, row, i) => sum + row[i], 0);
}

function minorMatrix(matrix: Matrix, row: number, col: number): Matrix {
    return matrix
        .filter((_, i) => i !== row)
        .map((r) => r.filter((_, j) => j !== col));
}

export function determinant(matrix: Matrix): number {
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    if (n === 2)
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

    let det = 0;
    for (let j = 0; j < n; j++) {
        det +=
            (j % 2 === 0 ? 1 : -1) *
            matrix[0][j] *
            determinant(minorMatrix(matrix, 0, j));
    }
    return det;
}

export function inverseMatrix(matrix: Matrix): Matrix {
    const det = determinant(matrix);

    if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is not invertible (determinant = 0)');
    }

    const cofactors = matrix.map((row, i) =>
        row.map(
            (_, j) =>
                ((i + j) % 2 === 0 ? 1 : -1) *
                determinant(minorMatrix(matrix, i, j))
        )
    );

    const adj = transposeMatrix(cofactors);
    return adj.map((row) => row.map((val) => val / det));
}

export function rankMatrix(matrix: Matrix): number {
    const m = matrix.map((row) => [...row]);
    const rows = m.length;
    const cols = m[0].length;
    let r = 0;

    for (let col = 0; col < cols && r < rows; col++) {
        let pivotRow = -1;
        for (let i = r; i < rows; i++) {
            if (Math.abs(m[i][col]) > 1e-10) {
                pivotRow = i;
                break;
            }
        }
        if (pivotRow === -1) continue;

        [m[r], m[pivotRow]] = [m[pivotRow], m[r]];

        const pivot = m[r][col];
        for (let j = col; j < cols; j++) m[r][j] /= pivot;

        for (let i = 0; i < rows; i++) {
            if (i !== r && Math.abs(m[i][col]) > 1e-10) {
                const factor = m[i][col];
                for (let j = col; j < cols; j++) m[i][j] -= factor * m[r][j];
            }
        }
        r++;
    }

    return r;
}

export function matrixPower(matrix: Matrix, n: number): Matrix {
    if (n === 0) return identityMatrix(matrix.length);
    if (n === 1) return matrix;
    if (n < 0) {
        const inv = inverseMatrix(matrix);
        return matrixPower(inv, -n);
    }

    let result = identityMatrix(matrix.length);
    let base = matrix.map((row) => [...row]);
    let exp = n;

    while (exp > 0) {
        if (exp % 2 === 1) result = multiplyMatrices(result, base);
        base = multiplyMatrices(base, base);
        exp = Math.floor(exp / 2);
    }

    return result;
}

export function formatNum(num: number): string {
    if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
    if (isNaN(num)) return 'NaN';
    const rounded = Math.round(num * 1e10) / 1e10;
    if (Number.isInteger(rounded)) return String(rounded);
    const str = rounded.toPrecision(6);
    return String(parseFloat(str));
}

export function randomMatrix(rows: number, cols: number, max = 9): Matrix {
    // Generates values in range [-max, max]
    const range = max * 2 + 1;
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.floor(Math.random() * range) - max)
    );
}
