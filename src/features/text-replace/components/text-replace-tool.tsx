'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Trash2, Play, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function performReplace(
  text: string,
  search: string,
  replace: string,
  useRegex: boolean,
  caseSensitive: boolean,
  replaceAll: boolean
): { result: string; count: number } {
  if (!text || !search) return { result: text, count: 0 };

  let count = 0;

  if (useRegex) {
    try {
      let flags = '';
      if (replaceAll) flags += 'g';
      if (!caseSensitive) flags += 'i';
      const regex = new RegExp(search, flags);
      const result = text.replace(regex, () => {
        count++;
        return replace;
      });
      return { result, count };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid regex pattern';
      toast.error(`Invalid regex: ${message}`);
      return { result: text, count: 0 };
    }
  }

  if (!replaceAll) {
    const index = caseSensitive
      ? text.indexOf(search)
      : text.toLowerCase().indexOf(search.toLowerCase());

    if (index === -1) return { result: text, count: 0 };

    return {
      result: text.slice(0, index) + replace + text.slice(index + search.length),
      count: 1,
    };
  }

  // Replace all without regex
  let result = '';
  let remaining = text;
  const searchLen = search.length;

  while (remaining.length > 0) {
    const index = caseSensitive
      ? remaining.indexOf(search)
      : remaining.toLowerCase().indexOf(search.toLowerCase());

    if (index === -1) {
      result += remaining;
      break;
    }

    result += remaining.slice(0, index) + replace;
    remaining = remaining.slice(index + searchLen);
    count++;
  }

  return { result, count };
}

export function TextReplaceTool() {
  const [input, setInput] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(true);
  const [replaceAll, setReplaceAll] = useState<boolean>(true);
  const [matchCount, setMatchCount] = useState<number>(0);

  const handleReplace = useCallback((): void => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    if (!searchText) {
      toast.error('Please enter a search term');
      return;
    }
    const { result, count } = performReplace(
      input,
      searchText,
      replaceText,
      useRegex,
      caseSensitive,
      replaceAll
    );
    setOutput(result);
    setMatchCount(count);
    if (count > 0) {
      toast.success(`Replaced ${count} occurrence${count > 1 ? 's' : ''}`);
    } else {
      toast.info('No matches found');
    }
  }, [input, searchText, replaceText, useRegex, caseSensitive, replaceAll]);

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
    setSearchText('');
    setReplaceText('');
    setOutput('');
    setMatchCount(0);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Options Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-800">
              Replace Options
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Search Field */}
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="search-text"
                className="block text-xs font-medium text-gray-500 mb-1"
              >
                Search for
              </label>
              <input
                id="search-text"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Text to find..."
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-gray-400"
              />
            </div>
            {/* Replace Field */}
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="replace-text"
                className="block text-xs font-medium text-gray-500 mb-1"
              >
                Replace with
              </label>
              <input
                id="replace-text"
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replacement text..."
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
          {/* Toggle Options */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                caseSensitive
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              Case Sensitive
            </button>
            <button
              onClick={() => setReplaceAll(!replaceAll)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                replaceAll
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              Replace All
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                useRegex
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              Use Regex
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Input Panel */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="replace-input"
                className="text-sm font-semibold text-gray-800"
              >
                Input
              </label>
              <button
                onClick={handleClear}
                disabled={!input && !searchText && !replaceText}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                  input || searchText || replaceText
                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
            <textarea
              id="replace-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full h-56 p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-gray-400"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{input.length} characters</span>
              <span>{countWords(input)} words</span>
            </div>
            <button
              onClick={handleReplace}
              disabled={!input.trim() || !searchText}
              className={cn(
                'w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                input.trim() && searchText
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <Play className="w-4 h-4" />
              Replace
            </button>
          </div>

          {/* Output Panel */}
          <div className="p-5 bg-gray-50/30">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="replace-output"
                className="text-sm font-semibold text-gray-800"
              >
                Output
                {matchCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {matchCount} replacement{matchCount > 1 ? 's' : ''} made
                  </span>
                )}
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
              id="replace-output"
              value={output}
              readOnly
              placeholder="Replaced text will appear here..."
              className="w-full h-56 p-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none placeholder:text-gray-400"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{output.length} characters</span>
              <span>{countWords(output)} words</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
