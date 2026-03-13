'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Trash2, Link, Play } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SeparatorType = 'hyphen' | 'underscore' | 'dot';

interface SeparatorOption {
  key: SeparatorType;
  label: string;
  char: string;
  example: string;
}

const SEPARATOR_OPTIONS: SeparatorOption[] = [
  { key: 'hyphen', label: 'Hyphen (-)', char: '-', example: 'hello-world' },
  { key: 'underscore', label: 'Underscore (_)', char: '_', example: 'hello_world' },
  { key: 'dot', label: 'Dot (.)', char: '.', example: 'hello.world' },
];

function generateSlug(text: string, separator: SeparatorType, maxLength: number, lowercase: boolean): string {
  if (!text) return '';

  const sep = SEPARATOR_OPTIONS.find((o) => o.key === separator)?.char ?? '-';

  let slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, sep)
    .replace(new RegExp(`[${sep === '.' ? '\\.' : sep}]+`, 'g'), sep);

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`${sep === '.' ? '\\.' : sep}+$`), '');
  }

  return slug;
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function SlugGeneratorTool() {
  const [input, setInput] = useState<string>('');
  const [separator, setSeparator] = useState<SeparatorType>('hyphen');
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [maxLength, setMaxLength] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');

  const handleGenerate = useCallback((): void => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    setOutput(generateSlug(input, separator, maxLength, lowercase));
  }, [input, separator, maxLength, lowercase]);

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
        {/* Options Section */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Link className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-800">
              Options
            </span>
          </div>

          {/* Separator */}
          <div className="mb-3">
            <span className="text-xs font-medium text-gray-500 mb-1.5 block">Separator</span>
            <div className="flex flex-wrap gap-1.5">
              {SEPARATOR_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSeparator(option.key)}
                  title={option.example}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                    separator === option.key
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lowercase & Max Length */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20"
              />
              <span className="text-xs font-medium text-gray-600">Lowercase</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Max length</span>
              <input
                type="number"
                min={0}
                max={500}
                value={maxLength}
                onChange={(e) => setMaxLength(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                placeholder="0 = no limit"
              />
              <span className="text-xs text-gray-400">0 = no limit</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Input Panel */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="slug-input"
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
              id="slug-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your title, heading, or text here..."
              className="w-full h-56 p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-gray-400"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{input.length} characters</span>
              <span>{countWords(input)} words</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!input.trim()}
              className={cn(
                'w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                input.trim()
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <Play className="w-4 h-4" />
              Generate Slug
            </button>
          </div>

          {/* Output Panel */}
          <div className="p-5 bg-gray-50/30">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="slug-output"
                className="text-sm font-semibold text-gray-800"
              >
                Output
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {SEPARATOR_OPTIONS.find((o) => o.key === separator)?.label}
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
            <div
              id="slug-output"
              className="w-full h-56 p-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl overflow-auto flex items-start"
            >
              {output ? (
                <span className="font-mono text-sm break-all">{output}</span>
              ) : (
                <span className="text-gray-400">Generated slug will appear here...</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{output.length} characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
