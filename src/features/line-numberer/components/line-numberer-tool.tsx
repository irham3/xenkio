'use client';

import { useState, useCallback } from 'react';
import { Check, Copy, Eraser, ListNumbers, Trash } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LineNumberAction = 'add' | 'remove';
type LineNumberFormat =
  | 'decimal-dot'
  | 'decimal-paren'
  | 'decimal-colon'
  | 'bracketed'
  | 'pipe'
  | 'padded-dot'
  | 'upper-alpha'
  | 'lower-alpha'
  | 'upper-roman'
  | 'lower-roman';

interface ActionOption {
  id: LineNumberAction;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface NumberFormatOption {
  id: LineNumberFormat;
  label: string;
  preview: string;
}

interface TransformResult {
  output: string;
  lineCount: number;
  changedLines: number;
}

const ACTIONS: ActionOption[] = [
  {
    id: 'add',
    label: 'Add Numbers',
    description: 'Prefix every line with the selected list format.',
    icon: <ListNumbers className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'remove',
    label: 'Remove Numbers',
    description: 'Strip common prefixes like 1., 1), [1], A., I., or gutter numbers.',
    icon: <Eraser className="w-4 h-4" weight="duotone" />,
  },
];

const NUMBER_FORMATS: NumberFormatOption[] = [
  { id: 'decimal-dot', label: 'Decimal Dot', preview: '1. Line' },
  { id: 'decimal-paren', label: 'Decimal Paren', preview: '1) Line' },
  { id: 'decimal-colon', label: 'Decimal Colon', preview: '1: Line' },
  { id: 'bracketed', label: 'Bracketed', preview: '[1] Line' },
  { id: 'pipe', label: 'Pipe', preview: '1 | Line' },
  { id: 'padded-dot', label: 'Padded', preview: '01. Line' },
  { id: 'upper-alpha', label: 'Upper Alpha', preview: 'A. Line' },
  { id: 'lower-alpha', label: 'Lower Alpha', preview: 'a. Line' },
  { id: 'upper-roman', label: 'Roman', preview: 'I. Line' },
  { id: 'lower-roman', label: 'Lower Roman', preview: 'i. Line' },
];

function getLineParts(text: string) {
  const hasTrailingNewline = /\r?\n$/.test(text);
  const lines = text.split(/\r?\n/);

  return {
    lines: hasTrailingNewline ? lines.slice(0, -1) : lines,
    hasTrailingNewline,
  };
}

function joinLines(lines: string[], hasTrailingNewline: boolean) {
  return `${lines.join('\n')}${hasTrailingNewline ? '\n' : ''}`;
}

function toAlphabeticNumber(value: number) {
  let result = '';
  let nextValue = value;

  while (nextValue > 0) {
    nextValue -= 1;
    result = String.fromCharCode(65 + (nextValue % 26)) + result;
    nextValue = Math.floor(nextValue / 26);
  }

  return result;
}

function toRomanNumeral(value: number) {
  const numerals: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let nextValue = value;

  for (const [number, numeral] of numerals) {
    while (nextValue >= number) {
      result += numeral;
      nextValue -= number;
    }
  }

  return result;
}

function formatLinePrefix(index: number, totalLines: number, format: LineNumberFormat) {
  const number = index + 1;

  switch (format) {
    case 'decimal-paren':
      return `${number}) `;
    case 'decimal-colon':
      return `${number}: `;
    case 'bracketed':
      return `[${number}] `;
    case 'pipe':
      return `${number} | `;
    case 'padded-dot':
      return `${String(number).padStart(Math.max(2, String(totalLines).length), '0')}. `;
    case 'upper-alpha':
      return `${toAlphabeticNumber(number)}. `;
    case 'lower-alpha':
      return `${toAlphabeticNumber(number).toLowerCase()}. `;
    case 'upper-roman':
      return `${toRomanNumeral(number)}. `;
    case 'lower-roman':
      return `${toRomanNumeral(number).toLowerCase()}. `;
    default:
      return `${number}. `;
  }
}

function stripLineNumberPrefix(line: string) {
  const bracketed = line.match(/^\s*\[(?:\d+|[A-Za-z]{1,3}|(?=[MDCLXVI])M{0,4}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3}))\][ \t]?/i);
  if (bracketed) return line.slice(bracketed[0].length);

  const punctuated = line.match(/^\s*\d+[ \t]*(?:[.)\]:]|\|)[ \t]?/);
  if (punctuated) return line.slice(punctuated[0].length);

  const alphabetic = line.match(/^\s*(?:[A-Za-z]{1,3}|(?=[MDCLXVI])M{0,4}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3}))[ \t]*(?:[.)\]:]|\|)[ \t]?/i);
  if (alphabetic) return line.slice(alphabetic[0].length);

  const gutter = line.match(/^\s*\d+[ \t]{1,2}/);
  return gutter ? line.slice(gutter[0].length) : line;
}

function transformText(input: string, action: LineNumberAction, format: LineNumberFormat): TransformResult {
  const { lines, hasTrailingNewline } = getLineParts(input);
  const outputLines =
    action === 'add'
      ? lines.map((line, index) => `${formatLinePrefix(index, lines.length, format)}${line}`)
      : lines.map(stripLineNumberPrefix);
  const changedLines =
    action === 'add'
      ? lines.length
      : outputLines.filter((line, index) => line !== lines[index]).length;

  return {
    output: joinLines(outputLines, hasTrailingNewline),
    lineCount: lines.length,
    changedLines,
  };
}

function countLines(text: string) {
  if (!text) return 0;
  return getLineParts(text).lines.length;
}

export function LineNumbererTool() {
  const [input, setInput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<LineNumberFormat>('decimal-dot');
  const [result, setResult] = useState<TransformResult | null>(null);
  const [copied, setCopied] = useState(false);

  const output = result?.output ?? '';
  const lineCount = countLines(input);

  const handleTransform = useCallback(
    (action: LineNumberAction) => {
      if (!input) {
        toast.error('Please enter some text first');
        return;
      }

      const nextResult = transformText(input, action, selectedFormat);
      setResult(nextResult);
      setCopied(false);

      if (action === 'add') {
        toast.success(`Added numbers to ${nextResult.lineCount} ${nextResult.lineCount === 1 ? 'line' : 'lines'}`);
      } else if (nextResult.changedLines > 0) {
        toast.success(`Removed prefixes from ${nextResult.changedLines} ${nextResult.changedLines === 1 ? 'line' : 'lines'}`);
      } else {
        toast.info('No line number prefixes found');
      }
    },
    [input, selectedFormat]
  );

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
    setResult(null);
    setCopied(false);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-2 gap-0">
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
                onChange={(event) => setInput(event.target.value)}
                placeholder="Paste text or a numbered code snippet here..."
                className="w-full h-56 lg:h-72 p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 text-sm text-gray-900 placeholder:text-gray-400 resize-none outline-none transition-all font-mono"
              />
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{input.length} characters</span>
                <span className="w-px h-3 bg-gray-200" />
                <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
              </div>
            </div>
          </div>

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
                placeholder="Processed text will appear here..."
                className="w-full h-56 lg:h-72 p-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 resize-none outline-none font-mono"
              />
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Processed: <strong className="text-gray-800">{result?.lineCount ?? 0}</strong> {(result?.lineCount ?? 0) === 1 ? 'line' : 'lines'}
                </span>
                <span className="w-px h-3 bg-gray-200" />
                <span>
                  Changed: <strong className="text-primary-600">{result?.changedLines ?? 0}</strong> {(result?.changedLines ?? 0) === 1 ? 'line' : 'lines'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-5 border-t border-gray-100 bg-gray-50/60 grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-800 mb-2 block">Add Number Format</Label>
            <div className="flex flex-wrap gap-2">
              {NUMBER_FORMATS.map((format) => {
                const prefix = format.preview.replace(' Line', '');

                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={cn(
                      'inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border',
                      selectedFormat === format.id
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <span>{format.label}</span>
                    <span
                      className={cn(
                        'font-mono',
                        selectedFormat === format.id ? 'text-white/80' : 'text-gray-400'
                      )}
                    >
                      {prefix}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-800 mb-2 block">Actions</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleTransform(action.id)}
                  disabled={!input}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border',
                    input && action.id === 'add'
                      ? 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 shadow-sm'
                      : input
                        ? 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                  )}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add uses the selected format. Remove strips detected prefixes from pasted text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
