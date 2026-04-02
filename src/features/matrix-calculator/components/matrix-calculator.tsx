'use client';

import { useState } from 'react';
import {
    Shuffle,
    Trash2,
    Copy,
    Check,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMatrixCalculator } from '../hooks/use-matrix-calculator';
import { formatNum } from '../lib/matrix-utils';
import type { Matrix, OperationDef } from '../types';

const OPERATIONS: OperationDef[] = [
    {
        id: 'transpose',
        label: 'Transpose',
        symbol: 'Aᵀ',
        description: 'Tukar baris dan kolom',
        isBinary: false,
        requiresSquare: false,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'matrix',
    },
    {
        id: 'add',
        label: 'Penjumlahan',
        symbol: 'A + B',
        description: 'Tambahkan dua matriks',
        isBinary: true,
        requiresSquare: false,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'matrix',
    },
    {
        id: 'subtract',
        label: 'Pengurangan',
        symbol: 'A − B',
        description: 'Kurangkan dua matriks',
        isBinary: true,
        requiresSquare: false,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'matrix',
    },
    {
        id: 'multiply',
        label: 'Perkalian',
        symbol: 'A × B',
        description: 'Kalikan dua matriks',
        isBinary: true,
        requiresSquare: false,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'matrix',
    },
    {
        id: 'scalar-multiply',
        label: 'Skalar × Matriks',
        symbol: 'k × A',
        description: 'Kalikan matriks dengan angka',
        isBinary: false,
        requiresSquare: false,
        hasScalarInput: true,
        hasPowerInput: false,
        resultType: 'matrix',
    },
    {
        id: 'determinant',
        label: 'Determinan',
        symbol: '|A|',
        description: 'Hitung determinan matriks',
        isBinary: false,
        requiresSquare: true,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'scalar',
    },
    {
        id: 'inverse',
        label: 'Invers',
        symbol: 'A⁻¹',
        description: 'Hitung invers matriks',
        isBinary: false,
        requiresSquare: true,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'matrix',
    },
    {
        id: 'trace',
        label: 'Trace',
        symbol: 'tr(A)',
        description: 'Jumlah elemen diagonal',
        isBinary: false,
        requiresSquare: true,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'scalar',
    },
    {
        id: 'rank',
        label: 'Rank',
        symbol: 'rank(A)',
        description: 'Hitung rank matriks',
        isBinary: false,
        requiresSquare: false,
        hasScalarInput: false,
        hasPowerInput: false,
        resultType: 'scalar',
    },
    {
        id: 'power',
        label: 'Pangkat',
        symbol: 'Aⁿ',
        description: 'Pangkatkan matriks',
        isBinary: false,
        requiresSquare: true,
        hasScalarInput: false,
        hasPowerInput: true,
        resultType: 'matrix',
    },
];

const SIZE_OPTIONS = [1, 2, 3, 4, 5];
const MIN_SQUARE_MATRIX_SIZE = 2;

function MatrixGrid({
    matrix,
    rows,
    cols,
    label,
    onCellChange,
    onRandomize,
    onClear,
    onRowsChange,
    onColsChange,
    fixedRows,
    fixedCols,
    showSizeControl = true,
}: {
    matrix: Matrix;
    rows: number;
    cols: number;
    label: string;
    onCellChange: (r: number, c: number, v: number) => void;
    onRandomize: () => void;
    onClear: () => void;
    onRowsChange?: (v: number) => void;
    onColsChange?: (v: number) => void;
    fixedRows?: boolean;
    fixedCols?: boolean;
    showSizeControl?: boolean;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold text-gray-800 text-sm">{label}</span>
                {showSizeControl && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {!fixedRows && onRowsChange && (
                            <span className="flex items-center gap-1">
                                Baris:
                                <select
                                    value={rows}
                                    onChange={(e) => onRowsChange(Number(e.target.value))}
                                    className="border border-gray-200 rounded px-1 py-0.5 text-xs bg-white cursor-pointer"
                                >
                                    {SIZE_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </span>
                        )}
                        {!fixedCols && onColsChange && (
                            <span className="flex items-center gap-1">
                                Kolom:
                                <select
                                    value={cols}
                                    onChange={(e) => onColsChange(Number(e.target.value))}
                                    className="border border-gray-200 rounded px-1 py-0.5 text-xs bg-white cursor-pointer"
                                >
                                    {SIZE_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </span>
                        )}
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onRandomize}
                        title="Isi acak"
                        className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <Shuffle className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onClear}
                        title="Kosongkan"
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div
                className="inline-grid gap-1"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {Array.from({ length: rows }, (_, r) =>
                    Array.from({ length: cols }, (_, c) => (
                        <input
                            key={`${r}-${c}`}
                            type="number"
                            value={matrix[r]?.[c] ?? 0}
                            onChange={(e) => {
                                const v = e.target.value === '' || e.target.value === '-' ? 0 : parseFloat(e.target.value);
                                if (!isNaN(v)) onCellChange(r, c, v);
                            }}
                            className={cn(
                                'text-center text-sm font-mono border border-gray-200 rounded-md bg-white',
                                'focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400',
                                'transition-colors hover:border-gray-300',
                                cols <= 3 ? 'w-14 h-10' : cols === 4 ? 'w-12 h-10' : 'w-10 h-9'
                            )}
                        />
                    ))
                )}
            </div>

            <div className="text-xs text-gray-400 font-mono">
                {rows} × {cols}
            </div>
        </div>
    );
}

function ResultMatrix({ matrix }: { matrix: Matrix }) {
    const cols = matrix[0]?.length ?? 0;
    return (
        <div
            className="inline-grid gap-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
            {matrix.map((row, r) =>
                row.map((val, c) => (
                    <div
                        key={`${r}-${c}`}
                        className={cn(
                            'flex items-center justify-center text-sm font-mono',
                            'bg-indigo-50 border border-indigo-100 rounded-md text-indigo-800',
                            cols <= 3 ? 'w-16 h-10' : cols === 4 ? 'w-14 h-10' : 'w-12 h-9'
                        )}
                    >
                        {formatNum(val)}
                    </div>
                ))
            )}
        </div>
    );
}

export function MatrixCalculator() {
    const {
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
    } = useMatrixCalculator();

    const [copied, setCopied] = useState(false);

    const currentOp = OPERATIONS.find((o) => o.id === operation)!;

    const copyResult = () => {
        if (!result) return;
        let text = '';
        if (result.type === 'scalar' && result.scalar !== undefined) {
            text = String(result.scalar);
        } else if (result.type === 'matrix' && result.matrix) {
            text = result.matrix
                .map((row) => row.map((v) => formatNum(v)).join('\t'))
                .join('\n');
        }
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="space-y-8">
            {/* Operation Selector */}
            <div>
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-semibold">
                    Pilih Operasi
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {OPERATIONS.map((op) => (
                        <button
                            key={op.id}
                            onClick={() => changeOperation(op.id)}
                            className={cn(
                                'flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all text-xs',
                                operation === op.id
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                            )}
                        >
                            <span className={cn(
                                'text-lg font-bold font-mono leading-none',
                                operation === op.id ? 'text-indigo-600' : 'text-gray-500'
                            )}>
                                {op.symbol}
                            </span>
                            <span className="font-medium leading-tight">{op.label}</span>
                            <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">
                                {op.description}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    <strong>{currentOp.label}:</strong> {currentOp.description}.
                    {currentOp.requiresSquare && ' Membutuhkan matriks persegi (baris = kolom).'}
                    {currentOp.isBinary && ' Membutuhkan dua matriks.'}
                    {currentOp.hasScalarInput && ' Masukkan nilai skalar di bawah.'}
                    {currentOp.hasPowerInput && ' Masukkan nilai pangkat di bawah.'}
                </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Matrix A */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <MatrixGrid
                        matrix={matrixA}
                        rows={sizeA.rows}
                        cols={sizeA.cols}
                        label="Matriks A"
                        onCellChange={updateCellA}
                        onRandomize={randomizeA}
                        onClear={clearA}
                        onRowsChange={(v) => updateSizeA(v, sizeA.cols)}
                        onColsChange={(v) => updateSizeA(sizeA.rows, v)}
                        fixedRows={currentOp.requiresSquare}
                        fixedCols={currentOp.requiresSquare}
                    />
                    {currentOp.requiresSquare && (
                        <div className="mt-3">
                            <label className="text-xs text-gray-500 block mb-1">Ukuran (persegi)</label>
                            <select
                                value={sizeA.rows}
                                onChange={(e) => {
                                    const n = Number(e.target.value);
                                    updateSizeA(n, n);
                                }}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white cursor-pointer"
                            >
                                {SIZE_OPTIONS.filter((s) => s >= MIN_SQUARE_MATRIX_SIZE).map((s) => (
                                    <option key={s} value={s}>{s} × {s}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Scalar Input */}
                    {currentOp.hasScalarInput && (
                        <div className="mt-4 space-y-1">
                            <label className="text-xs text-gray-500">Nilai Skalar (k)</label>
                            <input
                                type="number"
                                value={scalar}
                                onChange={(e) => setScalar(parseFloat(e.target.value) || 0)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                    )}

                    {/* Power Input */}
                    {currentOp.hasPowerInput && (
                        <div className="mt-4 space-y-1">
                            <label className="text-xs text-gray-500">Nilai Pangkat (n)</label>
                            <input
                                type="number"
                                value={power}
                                onChange={(e) => setPower(parseInt(e.target.value) || 0)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                            <p className="text-[10px] text-gray-400">Bisa negatif untuk invers pangkat</p>
                        </div>
                    )}
                </div>

                {/* Matrix B (binary only) */}
                {currentOp.isBinary && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <MatrixGrid
                            matrix={matrixB}
                            rows={sizeB.rows}
                            cols={sizeB.cols}
                            label="Matriks B"
                            onCellChange={updateCellB}
                            onRandomize={randomizeB}
                            onClear={clearB}
                            onRowsChange={
                                operation !== 'multiply'
                                    ? (v) => updateSizeB(v, sizeB.cols)
                                    : undefined
                            }
                            onColsChange={(v) => updateSizeB(sizeB.rows, v)}
                            fixedRows={operation === 'multiply'}
                            showSizeControl={operation !== 'add' && operation !== 'subtract'}
                        />
                        {(operation === 'add' || operation === 'subtract') && (
                            <p className="mt-3 text-xs text-gray-400">
                                Ukuran Matriks B mengikuti Matriks A ({sizeA.rows} × {sizeA.cols})
                            </p>
                        )}
                        {operation === 'multiply' && (
                            <p className="mt-3 text-xs text-gray-400">
                                Baris Matriks B terkunci = kolom A ({sizeA.cols})
                            </p>
                        )}
                    </div>
                )}

                {/* Placeholder when unary */}
                {!currentOp.isBinary && (
                    <div className="hidden md:flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 text-sm">
                        <div className="text-center space-y-1">
                            <div className="text-3xl font-mono text-gray-200">{currentOp.symbol}</div>
                            <div>Hanya menggunakan Matriks A</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center">
                <Button
                    onClick={calculate}
                    size="lg"
                    className="px-10 rounded-xl text-base font-semibold"
                >
                    Hitung {currentOp.symbol}
                </Button>
            </div>

            {/* Result */}
            {result && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Hasil</h3>
                        {!result.error && (
                            <button
                                onClick={copyResult}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                                {copied ? 'Disalin!' : 'Salin'}
                            </button>
                        )}
                    </div>

                    {result.error ? (
                        <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{result.error}</span>
                        </div>
                    ) : result.type === 'scalar' && result.scalar !== undefined ? (
                        <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold font-mono text-indigo-700">
                                {formatNum(result.scalar)}
                            </div>
                            <div className="text-sm text-gray-400">
                                {operation === 'determinant' && '(nilai determinan)'}
                                {operation === 'trace' && '(jumlah elemen diagonal)'}
                                {operation === 'rank' && '(rank matriks)'}
                            </div>
                        </div>
                    ) : result.type === 'matrix' && result.matrix ? (
                        <div className="space-y-2">
                            <ResultMatrix matrix={result.matrix} />
                            <div className="text-xs text-gray-400 font-mono">
                                {result.matrix.length} × {result.matrix[0]?.length ?? 0}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Tips / Guide */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm">Panduan Operasi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {OPERATIONS.map((op) => (
                        <div key={op.id} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="font-mono font-bold text-indigo-500 w-16 shrink-0">{op.symbol}</span>
                            <span>{op.description}{op.requiresSquare ? ' (matriks persegi)' : ''}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
