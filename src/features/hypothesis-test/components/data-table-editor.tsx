'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export type TableEditorVariant =
    | 'single'          // one-sample-t, one-sample-z
    | 'dual'            // two-sample-t, two-sample-z
    | 'paired'          // paired-t, pearson-correlation
    | 'observed-expected' // chi-square-goodness
    | 'contingency'     // chi-square-independence
    | 'anova';          // one-way-anova

interface ColumnDef {
    label: string;
    placeholder?: string;
}

interface DataTableEditorProps {
    variant: TableEditorVariant;
    columns: ColumnDef[];
    /** 2D array: rows x cols of string values */
    data: string[][];
    onChange: (data: string[][]) => void;
    /** For contingency & anova: allow adding/removing columns */
    allowAddColumns?: boolean;
    minRows?: number;
    minCols?: number;
}

// ── Component ──────────────────────────────────────────────────────────────

export function DataTableEditor({
    variant,
    columns,
    data,
    onChange,
    allowAddColumns = false,
    minRows = 1,
    minCols = 2,
}: DataTableEditorProps) {
    const numCols = columns.length;
    const numRows = data.length;

    // ── Cell update ──
    const updateCell = useCallback(
        (row: number, col: number, value: string) => {
            // Allow empty, minus sign, decimal point, and numbers
            if (value !== '' && value !== '-' && value !== '.' && value !== '-.' && isNaN(Number(value))) return;
            const next = data.map((r) => [...r]);
            next[row][col] = value;
            onChange(next);
        },
        [data, onChange],
    );

    // ── Row operations ──
    const addRow = useCallback(() => {
        const newRow = Array(numCols).fill('');
        onChange([...data, newRow]);
    }, [data, numCols, onChange]);

    const removeRow = useCallback(
        (index: number) => {
            if (numRows <= minRows) return;
            onChange(data.filter((_, i) => i !== index));
        },
        [data, numRows, minRows, onChange],
    );

    // ── Column operations (for anova & contingency) ──
    const addColumn = useCallback(() => {
        const newData = data.map((r) => [...r, '']);
        onChange(newData);
    }, [data, onChange]);

    const removeColumn = useCallback(
        (colIndex: number) => {
            if (numCols <= minCols) return;
            const newData = data.map((r) => r.filter((_, j) => j !== colIndex));
            onChange(newData);
        },
        [data, numCols, minCols, onChange],
    );

    // ── Determine cell style based on validity ──
    const cellClass = (value: string) => {
        if (value === '' || value === '-' || value === '.' || value === '-.') return '';
        return isNaN(Number(value)) ? 'ring-2 ring-red-300 bg-red-50' : '';
    };

    // ── Keyboard navigation ──
    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        row: number,
        col: number,
    ) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (row === numRows - 1) {
                addRow();
                // Focus will happen after render via autoFocus or effect
                setTimeout(() => {
                    const next = document.querySelector(
                        `[data-cell="${row + 1}-${col}"]`,
                    ) as HTMLInputElement;
                    next?.focus();
                }, 0);
            } else {
                const next = document.querySelector(
                    `[data-cell="${row + 1}-${col}"]`,
                ) as HTMLInputElement;
                next?.focus();
            }
        } else if (e.key === 'ArrowUp' && row > 0) {
            e.preventDefault();
            const prev = document.querySelector(
                `[data-cell="${row - 1}-${col}"]`,
            ) as HTMLInputElement;
            prev?.focus();
        } else if (e.key === 'Tab' && !e.shiftKey && col === numCols - 1 && row === numRows - 1) {
            // Auto-add row when tabbing past last cell
            e.preventDefault();
            addRow();
            setTimeout(() => {
                const next = document.querySelector(
                    `[data-cell="${row + 1}-0"]`,
                ) as HTMLInputElement;
                next?.focus();
            }, 0);
        }
    };

    return (
        <div className="space-y-3">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    {/* Header */}
                    <thead>
                        <tr>
                            <th className="w-10 px-2 py-2 text-xs font-semibold text-gray-400 text-center border-b border-gray-200">
                                #
                            </th>
                            {columns.map((col, ci) => (
                                <th
                                    key={ci}
                                    className="px-2 py-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>{col.label}</span>
                                        {allowAddColumns && numCols > minCols && (
                                            <button
                                                onClick={() => removeColumn(ci)}
                                                className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                                title={`Remove ${col.label}`}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="w-9 border-b border-gray-200" />
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {data.map((row, ri) => (
                            <tr
                                key={ri}
                                className="group hover:bg-blue-50/30 transition-colors"
                            >
                                {/* Row number */}
                                <td className="px-2 py-1 text-xs text-gray-400 text-center font-mono border-b border-gray-100">
                                    {ri + 1}
                                </td>

                                {/* Cells */}
                                {row.map((cell, ci) => (
                                    <td
                                        key={ci}
                                        className="px-1 py-1 border-b border-gray-100"
                                    >
                                        <Input
                                            data-cell={`${ri}-${ci}`}
                                            type="text"
                                            inputMode="decimal"
                                            value={cell}
                                            onChange={(e) =>
                                                updateCell(ri, ci, e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(e, ri, ci)
                                            }
                                            placeholder={
                                                columns[ci]?.placeholder ?? '0'
                                            }
                                            className={`h-8 text-sm font-mono text-center px-2 ${cellClass(cell)} transition-all`}
                                        />
                                    </td>
                                ))}

                                {/* Delete row button */}
                                <td className="px-1 py-1 border-b border-gray-100">
                                    <button
                                        onClick={() => removeRow(ri)}
                                        disabled={numRows <= minRows}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all disabled:opacity-0"
                                        title="Remove row"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    className="h-7 text-xs gap-1 text-gray-600"
                >
                    <Plus className="w-3 h-3" />
                    Add Row
                </Button>
                {allowAddColumns && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            addColumn();
                        }}
                        className="h-7 text-xs gap-1 text-gray-600"
                    >
                        <Plus className="w-3 h-3" />
                        Add Column
                    </Button>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                    {numRows} row{numRows !== 1 ? 's' : ''}
                    {allowAddColumns ? `, ${numCols} col${numCols !== 1 ? 's' : ''}` : ''}
                    {' · Press Enter or ↓ to add rows'}
                </span>
            </div>
        </div>
    );
}

// ── Helper: convert form data to paste-format string ──────────────────────

/** Convert 2D string array to whitespace-separated text (for syncing with paste mode). */
export function formDataToText(data: string[][], separator = '\n'): string {
    if (data.length === 0) return '';
    const numCols = data[0].length;

    if (numCols === 1) {
        // Single column: just join values by newline
        return data.map((r) => r[0]).filter((v) => v.trim() !== '').join(separator);
    }

    // Multiple columns: tab-separated
    return data
        .filter((r) => r.some((v) => v.trim() !== ''))
        .map((r) => r.join('\t'))
        .join('\n');
}

/** Convert paste-format text to 2D string array. */
export function textToFormData(text: string, numCols: number): string[][] {
    if (!text.trim()) return [Array(numCols).fill('')];

    const lines = text.trim().split(/\n|\r\n/);
    const result: string[][] = [];

    for (const line of lines) {
        // Try tab/comma/semicolon split first
        const parts = line.split(/[\t,;]/).map((s) => s.trim());

        if (parts.length >= numCols) {
            result.push(parts.slice(0, numCols));
        } else if (numCols === 1) {
            // Single column: each space-separated value becomes a row
            const tokens = line.split(/[\s,;]+/).filter((s) => s.trim() !== '');
            for (const t of tokens) {
                result.push([t]);
            }
        } else {
            // Pad with empty strings
            result.push([...parts, ...Array(numCols - parts.length).fill('')]);
        }
    }

    if (result.length === 0) return [Array(numCols).fill('')];
    return result;
}

/** Create an empty form data grid. */
export function createEmptyFormData(rows: number, cols: number): string[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(''));
}
