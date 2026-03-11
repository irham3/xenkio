'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Trash2, Sparkles, Play } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CleaningOption {
  key: string;
  label: string;
  description: string;
}

const SPACES_PER_TAB = 4;

const CLEANING_OPTIONS: CleaningOption[] = [
  { key: 'trimLines', label: 'Trim Lines', description: 'Remove leading & trailing spaces from each line' },
  { key: 'multipleSpaces', label: 'Multiple Spaces', description: 'Collapse multiple spaces into one' },
  { key: 'blankLines', label: 'Blank Lines', description: 'Remove empty or whitespace-only lines' },
  { key: 'duplicateLines', label: 'Duplicate Lines', description: 'Remove consecutive duplicate lines' },
  { key: 'trailingNewlines', label: 'Trailing Newlines', description: 'Remove extra newlines at the end' },
  { key: 'tabs', label: 'Tabs to Spaces', description: 'Convert tab characters to spaces' },
];

function cleanText(text: string, options: Record<string, boolean>): string {
  if (!text) return '';

  let lines = text.split('\n');

  if (options.trimLines) {
    lines = lines.map((line) => line.trim());
  }

  if (options.multipleSpaces) {
    lines = lines.map((line) => line.replace(/ {2,}/g, ' '));
  }

  if (options.tabs) {
    lines = lines.map((line) => line.replace(/\t/g, ' '.repeat(SPACES_PER_TAB)));
  }

  if (options.blankLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  }

  if (options.duplicateLines) {
    lines = lines.filter((line, index) => index === 0 || line !== lines[index - 1]);
  }

  let result = lines.join('\n');

  if (options.trailingNewlines) {
    result = result.replace(/\n+$/, '');
  }

  return result;
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

export function TextCleanerTool() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [options, setOptions] = useState<Record<string, boolean>>({
    trimLines: true,
    multipleSpaces: true,
    blankLines: false,
    duplicateLines: false,
    trailingNewlines: true,
    tabs: false,
  });

  const toggleOption = useCallback((key: string): void => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleClean = useCallback((): void => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    const result = cleanText(input, options);
    setOutput(result);
    toast.success('Text cleaned successfully');
  }, [input, options]);

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
    setOutput('');
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Cleaning Options */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-800">
              Cleaning Options
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CLEANING_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => toggleOption(option.key)}
                title={option.description}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                  options[option.key]
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Input Panel */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="cleaner-input"
                className="text-sm font-semibold text-gray-800"
              >
                Input
              </label>
              <button
                onClick={handleClear}
                disabled={!input}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                  input
                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
            <textarea
              id="cleaner-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your messy text here..."
              className="w-full h-56 p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-gray-400 font-mono"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{input.length} characters</span>
              <span>{countWords(input)} words</span>
              <span>{countLines(input)} lines</span>
            </div>
            <button
              onClick={handleClean}
              disabled={!input.trim()}
              className={cn(
                'w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                input.trim()
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <Play className="w-4 h-4" />
              Clean Text
            </button>
          </div>

          {/* Output Panel */}
          <div className="p-5 bg-gray-50/30">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="cleaner-output"
                className="text-sm font-semibold text-gray-800"
              >
                Output
                <span className="ml-2 text-xs font-normal text-gray-400">
                  Cleaned
                </span>
              </label>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                  copied
                    ? 'text-success-600 bg-success-50'
                    : output
                      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 cursor-not-allowed'
                )}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              id="cleaner-output"
              value={output}
              readOnly
              placeholder="Cleaned text will appear here..."
              className="w-full h-56 p-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none placeholder:text-gray-400 font-mono"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
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
