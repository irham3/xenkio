'use client';

import { useState, useCallback } from 'react';
import { Check, Copy, Eraser, ListNumbers, Trash } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LineNumberAction = 'add' | 'remove';

interface ActionOption {
  id: LineNumberAction;
  label: string;
  description: string;
  icon: React.ReactNode;
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
    description: 'Prefix every line with 1., 2., 3., and so on.',
    icon: <ListNumbers className="w-4 h-4" weight="duotone" />,
  },
  {
    id: 'remove',
    label: 'Remove Numbers',
    description: 'Strip common prefixes like 1., 1), 1:, 1 |, [1], or gutter numbers.',
    icon: <Eraser className="w-4 h-4" weight="duotone" />,
  },
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

function stripLineNumberPrefix(line: string) {
  const bracketed = line.match(/^\s*\[\d+\][ \t]?/);
  if (bracketed) return line.slice(bracketed[0].length);

  const punctuated = line.match(/^\s*\d+[ \t]*(?:[.)\]:]|\|)[ \t]?/);
  if (punctuated) return line.slice(punctuated[0].length);

  const gutter = line.match(/^\s*\d+[ \t]{1,2}/);
  return gutter ? line.slice(gutter[0].length) : line;
}

function transformText(input: string, action: LineNumberAction): TransformResult {
  const { lines, hasTrailingNewline } = getLineParts(input);
  const outputLines =
    action === 'add'
      ? lines.map((line, index) => `${index + 1}. ${line}`)
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

      const nextResult = transformText(input, action);
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
    [input]
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
        <div className="p-4 lg:p-5 border-b border-gray-100 bg-white">
          <Label className="text-sm font-semibold text-gray-800 mb-3 block">Line Number Actions</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleTransform(action.id)}
                disabled={!input}
                className={cn(
                  'text-left rounded-xl border p-3 transition-all duration-200',
                  input
                    ? 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50/40'
                    : 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <span className="text-primary-600">{action.icon}</span>
                  {action.label}
                </span>
                <span className="mt-1 block text-xs text-gray-500 leading-relaxed">{action.description}</span>
              </button>
            ))}
          </div>
        </div>

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
      </div>
    </div>
  );
}
