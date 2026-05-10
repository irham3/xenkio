'use client';

import { useCallback, useState } from 'react';
import { BracketsCurly, Check, Copy, Play, TextT, Trash } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AffixMode = 'lines' | 'whole';

interface AffixResult {
  output: string;
  affectedCount: number;
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

function addAffixes(
  text: string,
  prefix: string,
  suffix: string,
  mode: AffixMode,
  skipEmptyLines: boolean
): AffixResult {
  if (mode === 'whole') {
    return {
      output: `${prefix}${text}${suffix}`,
      affectedCount: text ? 1 : 0,
    };
  }

  let affectedCount = 0;
  const output = text
    .split('\n')
    .map((line) => {
      if (skipEmptyLines && line.trim().length === 0) {
        return line;
      }

      affectedCount++;
      return `${prefix}${line}${suffix}`;
    })
    .join('\n');

  return { output, affectedCount };
}

export function TextAffixerTool() {
  const [input, setInput] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [mode, setMode] = useState<AffixMode>('lines');
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);
  const [output, setOutput] = useState('');
  const [affectedCount, setAffectedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleAffix = useCallback((): void => {
    if (!input) {
      toast.error('Please enter some text first');
      return;
    }

    if (!prefix && !suffix) {
      toast.error('Add a prefix, suffix, or both');
      return;
    }

    const result = addAffixes(input, prefix, suffix, mode, skipEmptyLines);
    setOutput(result.output);
    setAffectedCount(result.affectedCount);
    toast.success(
      mode === 'whole'
        ? 'Text affixed successfully'
        : `Affixed ${result.affectedCount} line${result.affectedCount === 1 ? '' : 's'}`
    );
  }, [input, mode, prefix, skipEmptyLines, suffix]);

  const handleCopy = useCallback(async (): Promise<void> => {
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

  const handleClear = useCallback((): void => {
    setInput('');
    setPrefix('');
    setSuffix('');
    setOutput('');
    setAffectedCount(0);
  }, []);

  const canAffix = input.length > 0 && (prefix.length > 0 || suffix.length > 0);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <BracketsCurly className="h-4 w-4 text-gray-500" weight="duotone" />
            <span className="text-sm font-semibold text-gray-800">Affix Options</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="affix-prefix" className="mb-1 block text-xs font-medium text-gray-500">
                Prefix
              </label>
              <input
                id="affix-prefix"
                type="text"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
                placeholder="Text to add before..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label htmlFor="affix-suffix" className="mb-1 block text-xs font-medium text-gray-500">
                Suffix
              </label>
              <input
                id="affix-suffix"
                type="text"
                value={suffix}
                onChange={(event) => setSuffix(event.target.value)}
                placeholder="Text to add after..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('lines')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                mode === 'lines'
                  ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              <TextT className="h-3.5 w-3.5" weight="duotone" />
              Each Line
            </button>
            <button
              type="button"
              onClick={() => setMode('whole')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                mode === 'whole'
                  ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              <BracketsCurly className="h-3.5 w-3.5" weight="duotone" />
              Whole Text
            </button>
            <label
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                mode === 'whole'
                  ? 'cursor-not-allowed border-gray-100 bg-gray-100 text-gray-300'
                  : skipEmptyLines
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              <input
                type="checkbox"
                checked={skipEmptyLines}
                onChange={(event) => setSkipEmptyLines(event.target.checked)}
                disabled={mode === 'whole'}
                className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Skip Empty Lines
            </label>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-gray-100 p-5 md:border-b-0 md:border-r">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="affix-input" className="text-sm font-semibold text-gray-800">
                Input
              </label>
              <button
                type="button"
                onClick={handleClear}
                disabled={!input && !prefix && !suffix}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                  input || prefix || suffix
                    ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    : 'cursor-not-allowed text-gray-300'
                )}
              >
                <Trash className="h-3.5 w-3.5" weight="duotone" />
                Clear
              </button>
            </div>
            <textarea
              id="affix-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type or paste your text here..."
              className="h-56 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            />
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span>{input.length} characters</span>
              <span>{countWords(input)} words</span>
              <span>{countLines(input)} lines</span>
            </div>
            <button
              type="button"
              onClick={handleAffix}
              disabled={!canAffix}
              className={cn(
                'mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                canAffix
                  ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              )}
            >
              <Play className="h-4 w-4" weight="duotone" />
              Add Prefix/Suffix
            </button>
          </div>

          <div className="bg-gray-50/30 p-5">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="affix-output" className="text-sm font-semibold text-gray-800">
                Output
                {output && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {mode === 'whole'
                      ? '1 block updated'
                      : `${affectedCount} line${affectedCount === 1 ? '' : 's'} updated`}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                  copied
                    ? 'bg-success-50 text-success-600'
                    : output
                      ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      : 'cursor-not-allowed text-gray-300'
                )}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" weight="duotone" />
                ) : (
                  <Copy className="h-3.5 w-3.5" weight="duotone" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              id="affix-output"
              value={output}
              readOnly
              placeholder="Affixed text will appear here..."
              className="h-56 w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span>{output.length} characters</span>
              <span>{countWords(output)} words</span>
              <span>{countLines(output)} lines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
