'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Copy,
  Check,
  Trash,
  SortAscending,
  SortDescending,
  ArrowsDownUp,
  Shuffle,
  Ruler,
  Hash,
  TextAa,
  ListNumbers,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SortMode =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'natural-asc'
  | 'natural-desc'
  | 'numeric-asc'
  | 'numeric-desc'
  | 'length-asc'
  | 'length-desc'
  | 'reverse'
  | 'shuffle';

type Delimiter = 'line' | 'comma' | 'semicolon' | 'space' | 'tab' | 'pipe';

interface ModeOption {
  id: SortMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MODES: ModeOption[] = [
  {
    id: 'alpha-asc',
    label: 'A → Z',
    description: 'Alphabetical order, ascending.',
    icon: <SortAscending className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'alpha-desc',
    label: 'Z → A',
    description: 'Alphabetical order, descending.',
    icon: <SortDescending className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'natural-asc',
    label: 'Natural ↑',
    description: 'Natural order (e.g. item2 before item10), ascending.',
    icon: <ListNumbers className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'natural-desc',
    label: 'Natural ↓',
    description: 'Natural order (e.g. item10 before item2), descending.',
    icon: <ListNumbers className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'numeric-asc',
    label: 'Numeric ↑',
    description: 'Parse each line as a number, smallest first.',
    icon: <Hash className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'numeric-desc',
    label: 'Numeric ↓',
    description: 'Parse each line as a number, largest first.',
    icon: <Hash className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'length-asc',
    label: 'Length ↑',
    description: 'Shortest entries first.',
    icon: <Ruler className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'length-desc',
    label: 'Length ↓',
    description: 'Longest entries first.',
    icon: <Ruler className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'reverse',
    label: 'Reverse',
    description: 'Reverse the current order of entries.',
    icon: <ArrowsDownUp className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'shuffle',
    label: 'Shuffle',
    description: 'Random order (Fisher–Yates shuffle).',
    icon: <Shuffle className="w-4 h-4" weight="duotone" />,
  },
];

const DELIMITERS: { id: Delimiter; label: string; split: RegExp | string; join: string }[] = [
  { id: 'line', label: 'New line', split: /\r?\n/, join: '\n' },
  { id: 'comma', label: 'Comma', split: ',', join: ', ' },
  { id: 'semicolon', label: 'Semicolon', split: ';', join: '; ' },
  { id: 'space', label: 'Space', split: /\s+/, join: ' ' },
  { id: 'tab', label: 'Tab', split: '\t', join: '\t' },
  { id: 'pipe', label: 'Pipe', split: '|', join: ' | ' },
];

function splitByDelimiter(input: string, d: RegExp | string): string[] {
  return typeof d === 'string' ? input.split(d) : input.split(d);
}

function compareNatural(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function compareAlpha(a: string, b: string, caseSensitive: boolean): number {
  if (caseSensitive) return a < b ? -1 : a > b ? 1 : 0;
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function parseNumber(s: string): number {
  // Extract first numeric token; fallback to NaN → pushed to the end
  const match = s.match(/-?\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

function fisherYates<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SortOptions {
  mode: SortMode;
  caseSensitive: boolean;
  removeDuplicates: boolean;
  trimItems: boolean;
  removeEmpty: boolean;
}

function applySort(items: string[], options: SortOptions): string[] {
  let work = items.slice();

  if (options.trimItems) work = work.map((s) => s.trim());
  if (options.removeEmpty) work = work.filter((s) => s.length > 0);
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    work = work.filter((s) => {
      const key = options.caseSensitive ? s : s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  switch (options.mode) {
    case 'alpha-asc':
      return work.sort((a, b) => compareAlpha(a, b, options.caseSensitive));
    case 'alpha-desc':
      return work.sort((a, b) => compareAlpha(b, a, options.caseSensitive));
    case 'natural-asc':
      return work.sort(compareNatural);
    case 'natural-desc':
      return work.sort((a, b) => compareNatural(b, a));
    case 'numeric-asc':
      return work.sort((a, b) => {
        const na = parseNumber(a);
        const nb = parseNumber(b);
        if (isNaN(na) && isNaN(nb)) return 0;
        if (isNaN(na)) return 1;
        if (isNaN(nb)) return -1;
        return na - nb;
      });
    case 'numeric-desc':
      return work.sort((a, b) => {
        const na = parseNumber(a);
        const nb = parseNumber(b);
        if (isNaN(na) && isNaN(nb)) return 0;
        if (isNaN(na)) return 1;
        if (isNaN(nb)) return -1;
        return nb - na;
      });
    case 'length-asc':
      return work.sort((a, b) => a.length - b.length || compareAlpha(a, b, options.caseSensitive));
    case 'length-desc':
      return work.sort((a, b) => b.length - a.length || compareAlpha(a, b, options.caseSensitive));
    case 'reverse':
      return work.reverse();
    case 'shuffle':
      return fisherYates(work);
  }
}

export function TextSorterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<SortMode>('alpha-asc');
  const [delimiter, setDelimiter] = useState<Delimiter>('line');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [trimItems, setTrimItems] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeDelim = useMemo(
    () => DELIMITERS.find((d) => d.id === delimiter) ?? DELIMITERS[0],
    [delimiter]
  );

  const handleSort = useCallback(() => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    const parts = splitByDelimiter(input, activeDelim.split);
    const sorted = applySort(parts, {
      mode,
      caseSensitive,
      removeDuplicates,
      trimItems,
      removeEmpty,
    });
    setOutput(sorted.join(activeDelim.join));
    toast.success(`Sorted ${sorted.length} ${sorted.length === 1 ? 'item' : 'items'}`);
  }, [input, mode, caseSensitive, removeDuplicates, trimItems, removeEmpty, activeDelim]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
  }, []);

  const charCount = input.length;
  const itemCount = useMemo(() => {
    if (!input) return 0;
    return splitByDelimiter(input, activeDelim.split)
      .map((s) => (trimItems ? s.trim() : s))
      .filter((s) => (removeEmpty ? s.length > 0 : true)).length;
  }, [input, activeDelim, trimItems, removeEmpty]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Mode Selector */}
        <div className="p-4 lg:p-5 border-b border-gray-100 bg-white">
          <Label className="text-sm font-semibold text-gray-800 mb-3 block">Sort Mode</Label>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                  mode === m.id
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {MODES.find((m) => m.id === mode)?.description}
          </p>
        </div>

        {/* Options Row */}
        <div className="p-4 lg:p-5 border-b border-gray-100 bg-gray-50/60 grid md:grid-cols-2 gap-4">
          {/* Delimiter */}
          <div>
            <Label className="text-sm font-semibold text-gray-800 mb-2 block">Separator</Label>
            <div className="flex flex-wrap gap-2">
              {DELIMITERS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDelimiter(d.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border',
                    delimiter === d.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div>
            <Label className="text-sm font-semibold text-gray-800 mb-2 block">Options</Label>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-300"
                />
                <span className="inline-flex items-center gap-1">
                  <TextAa className="w-3 h-3" weight="duotone" /> Case sensitive
                </span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-300"
                />
                Remove duplicates
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trimItems}
                  onChange={(e) => setTrimItems(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-300"
                />
                Trim items
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeEmpty}
                  onChange={(e) => setRemoveEmpty(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-300"
                />
                Remove empty
              </label>
            </div>
          </div>
        </div>

        {/* Input / Output Panels */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Input Panel */}
          <div className="p-4 lg:p-5 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-800">Input</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={!input}
                  className="h-7 text-xs gap-1.5 text-gray-500 hover:text-gray-700"
                >
                  <Trash className="w-3 h-3" weight="duotone" />
                  Clear
                </Button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  delimiter === 'line'
                    ? 'Paste your list — one item per line...'
                    : `Paste your list separated by ${activeDelim.label.toLowerCase()}...`
                }
                className="w-full h-56 lg:h-72 p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 text-sm text-gray-900 placeholder:text-gray-400 resize-none outline-none transition-all font-mono"
              />
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{charCount} characters</span>
                <span className="w-px h-3 bg-gray-200" />
                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              </div>
              <button
                onClick={handleSort}
                disabled={!input.trim()}
                className={cn(
                  'w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                  input.trim()
                    ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <SortAscending className="w-4 h-4" weight="duotone" />
                Sort
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="p-4 lg:p-5 bg-gray-50/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-800">Output</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!output}
                  className={cn(
                    'h-7 text-xs gap-1.5',
                    copied ? 'text-success-600' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {copied ? <Check className="w-3 h-3" weight="duotone" /> : <Copy className="w-3 h-3" weight="duotone" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Sorted text will appear here..."
                className="w-full h-56 lg:h-72 p-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 resize-none outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
