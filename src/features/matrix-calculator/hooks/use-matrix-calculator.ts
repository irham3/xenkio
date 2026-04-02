'use client';

import { useState, useCallback } from 'react';
import type { Matrix, MatrixOperation, MatrixResult, MatrixSize } from '../types';
import {
    createMatrix,
    transposeMatrix,
    addMatrices,
    subtractMatrices,
    multiplyMatrices,
    scalarMultiply,
    traceMatrix,
    determinant,
    inverseMatrix,
    rankMatrix,
    matrixPower,
    randomMatrix,
} from '../lib/matrix-utils';

function clampedFill(matrix: Matrix, rows: number, cols: number): Matrix {
    return Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => matrix[i]?.[j] ?? 0)
    );
}

export function useMatrixCalculator() {
    const [operation, setOperation] = useState<MatrixOperation>('transpose');
    const [sizeA, setSizeA] = useState<MatrixSize>({ rows: 3, cols: 3 });
    const [sizeB, setSizeB] = useState<MatrixSize>({ rows: 3, cols: 3 });
    const [matrixA, setMatrixA] = useState<Matrix>(createMatrix(3, 3));
    const [matrixB, setMatrixB] = useState<Matrix>(createMatrix(3, 3));
    const [scalar, setScalar] = useState<number>(2);
    const [power, setPower] = useState<number>(2);
    const [result, setResult] = useState<MatrixResult | null>(null);

    const updateSizeA = useCallback(
        (rows: number, cols: number) => {
            setSizeA({ rows, cols });
            setMatrixA((prev) => clampedFill(prev, rows, cols));
            if (operation === 'multiply') {
                setSizeB((prev) => ({ rows: cols, cols: prev.cols }));
                setMatrixB((prev) =>
                    clampedFill(prev, cols, sizeB.cols)
                );
            }
        },
        [operation, sizeB.cols]
    );

    const updateSizeB = useCallback(
        (rows: number, cols: number) => {
            setSizeB({ rows, cols });
            setMatrixB((prev) => clampedFill(prev, rows, cols));
        },
        []
    );

    const updateCellA = useCallback((row: number, col: number, value: number) => {
        setMatrixA((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = value;
            return next;
        });
    }, []);

    const updateCellB = useCallback((row: number, col: number, value: number) => {
        setMatrixB((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = value;
            return next;
        });
    }, []);

    const randomizeA = useCallback(() => {
        setMatrixA(randomMatrix(sizeA.rows, sizeA.cols));
    }, [sizeA]);

    const randomizeB = useCallback(() => {
        setMatrixB(randomMatrix(sizeB.rows, sizeB.cols));
    }, [sizeB]);

    const clearA = useCallback(() => {
        setMatrixA(createMatrix(sizeA.rows, sizeA.cols));
    }, [sizeA]);

    const clearB = useCallback(() => {
        setMatrixB(createMatrix(sizeB.rows, sizeB.cols));
    }, [sizeB]);

    const calculate = useCallback(() => {
        try {
            switch (operation) {
                case 'transpose':
                    setResult({ type: 'matrix', matrix: transposeMatrix(matrixA) });
                    break;

                case 'determinant': {
                    if (sizeA.rows !== sizeA.cols) {
                        setResult({ type: 'scalar', error: 'Determinan hanya bisa dihitung untuk matriks persegi (baris = kolom).' });
                        return;
                    }
                    const det = determinant(matrixA);
                    setResult({ type: 'scalar', scalar: det });
                    break;
                }

                case 'inverse': {
                    if (sizeA.rows !== sizeA.cols) {
                        setResult({ type: 'scalar', error: 'Invers hanya bisa dihitung untuk matriks persegi (baris = kolom).' });
                        return;
                    }
                    const inv = inverseMatrix(matrixA);
                    setResult({ type: 'matrix', matrix: inv });
                    break;
                }

                case 'add': {
                    if (sizeA.rows !== sizeB.rows || sizeA.cols !== sizeB.cols) {
                        setResult({ type: 'scalar', error: 'Penjumlahan membutuhkan dua matriks dengan ukuran yang sama.' });
                        return;
                    }
                    setResult({ type: 'matrix', matrix: addMatrices(matrixA, matrixB) });
                    break;
                }

                case 'subtract': {
                    if (sizeA.rows !== sizeB.rows || sizeA.cols !== sizeB.cols) {
                        setResult({ type: 'scalar', error: 'Pengurangan membutuhkan dua matriks dengan ukuran yang sama.' });
                        return;
                    }
                    setResult({ type: 'matrix', matrix: subtractMatrices(matrixA, matrixB) });
                    break;
                }

                case 'multiply': {
                    if (sizeA.cols !== sizeB.rows) {
                        setResult({ type: 'scalar', error: `Perkalian matriks: jumlah kolom Matriks A (${sizeA.cols}) harus sama dengan jumlah baris Matriks B (${sizeB.rows}).` });
                        return;
                    }
                    setResult({ type: 'matrix', matrix: multiplyMatrices(matrixA, matrixB) });
                    break;
                }

                case 'scalar-multiply':
                    setResult({ type: 'matrix', matrix: scalarMultiply(scalar, matrixA) });
                    break;

                case 'trace': {
                    if (sizeA.rows !== sizeA.cols) {
                        setResult({ type: 'scalar', error: 'Trace hanya bisa dihitung untuk matriks persegi (baris = kolom).' });
                        return;
                    }
                    setResult({ type: 'scalar', scalar: traceMatrix(matrixA) });
                    break;
                }

                case 'rank':
                    setResult({ type: 'scalar', scalar: rankMatrix(matrixA) });
                    break;

                case 'power': {
                    if (sizeA.rows !== sizeA.cols) {
                        setResult({ type: 'scalar', error: 'Pangkat matriks hanya bisa dihitung untuk matriks persegi (baris = kolom).' });
                        return;
                    }
                    setResult({ type: 'matrix', matrix: matrixPower(matrixA, power) });
                    break;
                }
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Terjadi kesalahan dalam perhitungan.';
            setResult({ type: 'scalar', error: msg });
        }
    }, [operation, matrixA, matrixB, scalar, power, sizeA, sizeB]);

    const changeOperation = useCallback((op: MatrixOperation) => {
        setOperation(op);
        setResult(null);
    }, []);

    return {
        operation,
        sizeA,
        sizeB,
        matrixA,
        matrixB,
        scalar,
        power,
        result,
        changeOperation,
        updateSizeA,
        updateSizeB,
        updateCellA,
        updateCellB,
        setScalar,
        setPower,
        randomizeA,
        randomizeB,
        clearA,
        clearB,
        calculate,
        setResult,
    };
}
