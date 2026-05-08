'use client';

import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  DownloadSimple,
  GridFour,
  SlidersHorizontal,
  Trash,
} from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type DelimiterOption = 'auto' | ',' | '\t' | ';' | '|';
type ConcreteDelimiter = Exclude<DelimiterOption, 'auto'>;
type Alignment = 'auto' | 'left' | 'center' | 'right';

interface TableOptions {
  hasHeader: boolean;
  rowSeparators: boolean;
  align: Alignment;
  maxColumnWidth: number;
}

const SAMPLE_INPUT = `Name,Role,Status,Notes
Ada Lovelace,Engineer,Active,First programmer
Grace Hopper,Computer scientist,Done,Popularized compiler work
Katherine Johnson,Mathematician,Review,Orbital calculations`;

const DELIMITER_OPTIONS: { value: DelimiterOption; label: string; hint: string }[] = [
  { value: 'auto', label: 'Auto', hint: 'Detect delimiter' },
  { value: ',', label: 'Comma', hint: 'CSV' },
  { value: '\t', label: 'Tab', hint: 'TSV' },
  { value: ';', label: 'Semicolon', hint: 'European CSV' },
  { value: '|', label: 'Pipe', hint: 'Pipe-separated' },
];

const ALIGNMENT_OPTIONS: { value: Alignment; label: string; hint: string }[] = [
  { value: 'auto', label: 'Auto', hint: 'Right-align numeric columns' },
  { value: 'left', label: 'Left', hint: 'Left align every column' },
  { value: 'center', label: 'Center', hint: 'Center align every column' },
  { value: 'right', label: 'Right', hint: 'Right align every column' },
];

function countDelimiter(line: string, delimiter: ConcreteDelimiter): number {
  let count = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && char === delimiter) {
      count++;
    }
  }

  return count;
}

function detectDelimiter(text: string): ConcreteDelimiter {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);
  const delimiters: ConcreteDelimiter[] = ['\t', '|', ';', ','];

  let bestDelimiter: ConcreteDelimiter = ',';
  let bestScore = 0;

  for (const delimiter of delimiters) {
    const score = lines.reduce((total, line) => total + countDelimiter(line, delimiter), 0);

    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

function parseDelimitedText(text: string, delimiterOption: DelimiterOption): string[][] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd();

  if (!normalized.trim()) {
    return [];
  }

  const delimiter = delimiterOption === 'auto' ? detectDelimiter(normalized) : delimiterOption;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (char === '"') {
      if (inQuotes && normalized[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (!inQuotes && char === '\n') {
      row.push(cell);
      rows.push(cleanPipeRow(row, delimiter));
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(cleanPipeRow(row, delimiter));

  return rows.filter((cells) => cells.some((value) => value.trim().length > 0));
}

function cleanPipeRow(row: string[], delimiter: ConcreteDelimiter): string[] {
  if (delimiter !== '|' || row.length < 3) {
    return row;
  }

  const next = [...row];

  if (next[0].trim() === '') {
    next.shift();
  }

  if (next[next.length - 1]?.trim() === '') {
    next.pop();
  }

  return next;
}

function normalizeRows(rows: string[][], trimCells: boolean): string[][] {
  const columns = Math.max(0, ...rows.map((row) => row.length));

  return rows.map((row) =>
    Array.from({ length: columns }, (_, index) => {
      const value = row[index] ?? '';
      return trimCells ? value.trim() : value;
    }),
  );
}

function charLength(value: string): number {
  return Array.from(value).length;
}

function takeChars(value: string, count: number): string {
  return Array.from(value).slice(0, count).join('');
}

function dropChars(value: string, count: number): string {
  return Array.from(value).slice(count).join('');
}

function wrapLine(line: string, width: number): string[] {
  if (line === '') {
    return [''];
  }

  const wrapped: string[] = [];
  let remaining = line;

  while (charLength(remaining) > width) {
    const slice = takeChars(remaining, width);
    const chars = Array.from(slice);
    let breakAt = -1;

    for (let i = chars.length - 1; i >= 0; i--) {
      if (/\s/.test(chars[i])) {
        breakAt = i;
        break;
      }
    }

    if (breakAt > 0) {
      wrapped.push(chars.slice(0, breakAt).join('').trimEnd());
      remaining = Array.from(remaining).slice(breakAt + 1).join('').trimStart();
    } else {
      wrapped.push(slice);
      remaining = dropChars(remaining, width);
    }
  }

  wrapped.push(remaining);
  return wrapped;
}

function wrapCell(value: string, width: number): string[] {
  return value
    .replace(/\t/g, '    ')
    .split('\n')
    .flatMap((line) => wrapLine(line, width));
}

function maxWrappedLineLength(value: string, width: number): number {
  return Math.max(0, ...wrapCell(value, width).map(charLength));
}

function isNumericCell(value: string): boolean {
  return /^[-+]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?%?$/.test(value.trim());
}

function getColumnAlignments(rows: string[][], options: TableOptions): Exclude<Alignment, 'auto'>[] {
  const columnCount = rows[0]?.length ?? 0;

  if (options.align !== 'auto') {
    const alignment: Exclude<Alignment, 'auto'> = options.align;
    return Array.from({ length: columnCount }, () => alignment);
  }

  const bodyRows = options.hasHeader ? rows.slice(1) : rows;

  return Array.from({ length: columnCount }, (_, columnIndex) => {
    const values = bodyRows.map((row) => row[columnIndex]).filter((value) => value.trim() !== '');
    return values.length > 0 && values.every(isNumericCell) ? 'right' : 'left';
  });
}

function padCell(value: string, width: number, align: Exclude<Alignment, 'auto'>): string {
  const padding = Math.max(0, width - charLength(value));

  if (align === 'right') {
    return `${' '.repeat(padding)}${value}`;
  }

  if (align === 'center') {
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return `${' '.repeat(left)}${value}${' '.repeat(right)}`;
  }

  return `${value}${' '.repeat(padding)}`;
}

function makeSeparator(widths: number[]): string {
  return `+-${widths.map((width) => '-'.repeat(width)).join('-+-')}-+`;
}

function formatAsciiRow(
  row: string[],
  widths: number[],
  alignments: Exclude<Alignment, 'auto'>[],
): string[] {
  const wrappedCells = row.map((cell, index) => wrapCell(cell, widths[index]));
  const height = Math.max(...wrappedCells.map((cellLines) => cellLines.length));
  const lines: string[] = [];

  for (let lineIndex = 0; lineIndex < height; lineIndex++) {
    const cells = wrappedCells.map((cellLines, columnIndex) =>
      padCell(cellLines[lineIndex] ?? '', widths[columnIndex], alignments[columnIndex]),
    );

    lines.push(`| ${cells.join(' | ')} |`);
  }

  return lines;
}

function generateAsciiTable(rows: string[][], options: TableOptions): string {
  if (rows.length === 0 || rows[0].length === 0) {
    return '';
  }

  const widths = Array.from({ length: rows[0].length }, (_, columnIndex) =>
    Math.max(
      3,
      ...rows.map((row) =>
        Math.min(options.maxColumnWidth, maxWrappedLineLength(row[columnIndex] ?? '', options.maxColumnWidth)),
      ),
    ),
  );
  const alignments = getColumnAlignments(rows, options);
  const separator = makeSeparator(widths);
  const lines: string[] = [separator];

  rows.forEach((row, rowIndex) => {
    lines.push(...formatAsciiRow(row, widths, alignments));

    if (options.hasHeader && rowIndex === 0 && rows.length > 1) {
      lines.push(separator);
    } else if (options.rowSeparators && rowIndex < rows.length - 1) {
      lines.push(separator);
    }
  });

  lines.push(separator);
  return lines.join('\n');
}

function countCharacters(rows: string[][]): number {
  return rows.flat().reduce((total, cell) => total + cell.length, 0);
}

export function AsciiTableGeneratorTool() {
  const [input, setInput] = useState<string>(SAMPLE_INPUT);
  const [delimiter, setDelimiter] = useState<DelimiterOption>('auto');
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [trimCells, setTrimCells] = useState<boolean>(true);
  const [rowSeparators, setRowSeparators] = useState<boolean>(false);
  const [align, setAlign] = useState<Alignment>('auto');
  const [maxColumnWidth, setMaxColumnWidth] = useState<number>(28);
  const [copied, setCopied] = useState<boolean>(false);

  const detectedDelimiter = useMemo(
    () => (input.trim() ? detectDelimiter(input) : ','),
    [input],
  );

  const rows = useMemo(
    () => normalizeRows(parseDelimitedText(input, delimiter), trimCells),
    [delimiter, input, trimCells],
  );

  const tableOutput = useMemo(
    () =>
      generateAsciiTable(rows, {
        hasHeader,
        rowSeparators,
        align,
        maxColumnWidth,
      }),
    [align, hasHeader, maxColumnWidth, rowSeparators, rows],
  );

  const dataRows = Math.max(0, rows.length - (hasHeader && rows.length > 0 ? 1 : 0));
  const columnCount = rows[0]?.length ?? 0;

  const handleCopy = useCallback(async (): Promise<void> => {
    if (!tableOutput) {
      toast.error('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(tableOutput);
      setCopied(true);
      toast.success('ASCII table copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy table');
    }
  }, [tableOutput]);

  const handleDownload = useCallback((): void => {
    if (!tableOutput) {
      toast.error('Nothing to download');
      return;
    }

    const blob = new Blob([tableOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ascii-table.txt';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('ASCII table downloaded');
  }, [tableOutput]);

  const handleClear = useCallback((): void => {
    setInput('');
    toast.success('Input cleared');
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Data Rows" value={dataRows} />
        <StatCard label="Columns" value={columnCount} />
        <StatCard label="Input Chars" value={countCharacters(rows)} />
        <StatCard label="Output Lines" value={tableOutput ? tableOutput.split('\n').length : 0} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" weight="duotone" />
            <span className="text-sm font-semibold text-gray-800">Table Options</span>
            <span className="text-xs text-gray-400">
              Detected: {formatDelimiterLabel(detectedDelimiter)}
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr_auto] gap-4">
            <ControlGroup label="Source delimiter">
              {DELIMITER_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setDelimiter(option.value)}
                  title={option.hint}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                    delimiter === option.value
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </ControlGroup>

            <ControlGroup label="Alignment">
              {ALIGNMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAlign(option.value)}
                  title={option.hint}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                    align === option.value
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </ControlGroup>

            <div className="space-y-2">
              <label htmlFor="max-column-width" className="text-xs font-semibold text-gray-500">
                Max column width
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="max-column-width"
                  type="range"
                  min={8}
                  max={60}
                  value={maxColumnWidth}
                  onChange={(event) => setMaxColumnWidth(Number(event.target.value))}
                  className="w-32 accent-primary-500"
                />
                <input
                  type="number"
                  min={8}
                  max={60}
                  value={maxColumnWidth}
                  onChange={(event) =>
                    setMaxColumnWidth(Math.min(60, Math.max(8, Number(event.target.value) || 8)))
                  }
                  className="w-16 px-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <CheckboxControl
              checked={hasHeader}
              label="First row is header"
              onChange={setHasHeader}
            />
            <CheckboxControl
              checked={trimCells}
              label="Trim cell whitespace"
              onChange={setTrimCells}
            />
            <CheckboxControl
              checked={rowSeparators}
              label="Separate every row"
              onChange={setRowSeparators}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="flex items-center justify-between gap-3 mb-3">
              <label htmlFor="ascii-table-input" className="text-sm font-semibold text-gray-800">
                Input Data
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInput(SAMPLE_INPUT)}
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sample
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!input}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                    input
                      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 cursor-not-allowed',
                  )}
                >
                  <Trash className="w-3.5 h-3.5" weight="duotone" />
                  Clear
                </button>
              </div>
            </div>
            <textarea
              id="ascii-table-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Paste CSV, TSV, semicolon-separated, or pipe-separated data..."
              className="w-full h-80 p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-gray-400 font-mono"
              spellCheck={false}
            />
            <p className="mt-2 text-xs text-gray-400">
              Quoted CSV values and multi-line cells are supported.
            </p>
          </div>

          <div className="p-5 bg-gray-50/30">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <GridFour className="w-4 h-4 text-primary-500" weight="duotone" />
                <label htmlFor="ascii-table-output" className="text-sm font-semibold text-gray-800">
                  ASCII Output
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!tableOutput}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                    tableOutput
                      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 cursor-not-allowed',
                  )}
                >
                  <DownloadSimple className="w-3.5 h-3.5" weight="duotone" />
                  TXT
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!tableOutput}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                    copied
                      ? 'text-success-600 bg-success-50'
                      : tableOutput
                        ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed',
                  )}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" weight="duotone" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" weight="duotone" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <textarea
              id="ascii-table-output"
              value={tableOutput}
              readOnly
              placeholder="Your ASCII table will appear here..."
              className="w-full h-80 p-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl resize-y focus:outline-none placeholder:text-gray-400 font-mono leading-relaxed"
              spellCheck={false}
            />
            <p className="mt-2 text-xs text-gray-400">
              Output uses plain ASCII characters for terminals, READMEs, docs, and tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDelimiterLabel(delimiter: ConcreteDelimiter): string {
  if (delimiter === '\t') {
    return 'Tab';
  }

  if (delimiter === ',') {
    return 'Comma';
  }

  if (delimiter === ';') {
    return 'Semicolon';
  }

  return 'Pipe';
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center space-y-1">
      <div className="text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function CheckboxControl({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary-500 accent-primary-500"
      />
      {label}
    </label>
  );
}
