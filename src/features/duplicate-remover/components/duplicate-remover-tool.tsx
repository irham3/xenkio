'use client';

import { useState, useMemo, useCallback } from 'react';
import { Copy, Check, Trash2, Type, AlignLeft, ListFilter, ArrowDownAZ } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Options {
  caseSensitive: boolean;
  trimWhitespace: boolean;
  removeEmptyLines: boolean;
  sortOutput: boolean;
}

function removeDuplicates(input: string, options: Options) {
  const lines = input.split('\n');
  const seen = new Set<string>();
  const uniqueLines: string[] = [];

  for (const line of lines) {
    const processedLine = options.trimWhitespace ? line.trim() : line;

    if (options.removeEmptyLines && processedLine === '') {
      continue;
    }

    const key = options.caseSensitive ? processedLine : processedLine.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      uniqueLines.push(processedLine);
    }
  }

  if (options.sortOutput) {
    uniqueLines.sort((a, b) =>
      options.caseSensitive
        ? a.localeCompare(b)
        : a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }

  return {
    output: uniqueLines.join('\n'),
    totalLines: lines.length,
    uniqueLines: uniqueLines.length,
    duplicatesRemoved: lines.length - uniqueLines.length,
  };
}

export function DuplicateRemoverTool() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<Options>({
    caseSensitive: true,
    trimWhitespace: true,
    removeEmptyLines: false,
    sortOutput: false,
  });

  const result = useMemo(() => removeDuplicates(input, options), [input, options]);

  const toggleOption = useCallback((key: keyof Options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      toast.success('Output copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [result.output]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const optionItems: { key: keyof Options; label: string; icon: React.ReactNode }[] = [
    { key: 'caseSensitive', label: 'Case Sensitive', icon: <Type className="w-3.5 h-3.5" /> },
    { key: 'trimWhitespace', label: 'Trim Whitespace', icon: <AlignLeft className="w-3.5 h-3.5" /> },
    { key: 'removeEmptyLines', label: 'Remove Empty Lines', icon: <ListFilter className="w-3.5 h-3.5" /> },
    { key: 'sortOutput', label: 'Sort Output', icon: <ArrowDownAZ className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Options Bar */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-sm font-semibold text-gray-800 mr-1">Options:</Label>
            {optionItems.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => toggleOption(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
                  options[key]
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Input */}
          <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800">Input</Label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-64 lg:h-80 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 text-sm font-mono text-gray-900 placeholder:text-gray-400 resize-none outline-none transition-all"
              />
            </div>
          </div>

          {/* Output */}
          <div className="p-5 lg:p-6 bg-gray-50/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-800">Output</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={!input}
                    className="h-7 text-xs gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!result.output}
                    className={cn(
                      'h-7 text-xs gap-1.5 transition-all',
                      copied && 'text-success-600 border-success-500 bg-success-50'
                    )}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <textarea
                value={result.output}
                readOnly
                placeholder="Unique lines will appear here..."
                className="w-full h-64 lg:h-80 p-3 rounded-xl border border-gray-200 bg-white text-sm font-mono text-gray-900 placeholder:text-gray-400 resize-none outline-none"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
            <span>
              Total Lines: <strong className="text-gray-800">{result.totalLines}</strong>
            </span>
            <span>
              Unique Lines: <strong className="text-primary-600">{result.uniqueLines}</strong>
            </span>
            <span>
              Duplicates Removed: <strong className="text-error-600">{result.duplicatesRemoved}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
