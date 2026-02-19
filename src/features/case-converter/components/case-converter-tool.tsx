'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Trash2, Type, Play } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type CaseType =
  | 'uppercase'
  | 'lowercase'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'dot'
  | 'path'
  | 'alternating'
  | 'inverse';

interface CaseOption {
  key: CaseType;
  label: string;
  example: string;
}

const CASE_OPTIONS: CaseOption[] = [
  { key: 'uppercase', label: 'UPPERCASE', example: 'HELLO WORLD' },
  { key: 'lowercase', label: 'lowercase', example: 'hello world' },
  { key: 'title', label: 'Title Case', example: 'Hello World' },
  { key: 'sentence', label: 'Sentence case', example: 'Hello world' },
  { key: 'camel', label: 'camelCase', example: 'helloWorld' },
  { key: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { key: 'snake', label: 'snake_case', example: 'hello_world' },
  { key: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { key: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { key: 'dot', label: 'dot.case', example: 'hello.world' },
  { key: 'path', label: 'path/case', example: 'hello/world' },
  { key: 'alternating', label: 'aLtErNaTiNg', example: 'hElLo WoRlD' },
  { key: 'inverse', label: 'Inverse Case', example: 'hELLO wORLD' },
];

function splitIntoWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-./\\]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function convertCase(text: string, caseType: CaseType): string {
  if (!text) return '';

  switch (caseType) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'title':
      return text
        .toLowerCase()
        .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
    case 'sentence':
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());
    case 'camel': {
      const words = splitIntoWords(text);
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join('');
    }
    case 'pascal': {
      const words = splitIntoWords(text);
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
    }
    case 'snake': {
      const words = splitIntoWords(text);
      return words.map((w) => w.toLowerCase()).join('_');
    }
    case 'kebab': {
      const words = splitIntoWords(text);
      return words.map((w) => w.toLowerCase()).join('-');
    }
    case 'constant': {
      const words = splitIntoWords(text);
      return words.map((w) => w.toUpperCase()).join('_');
    }
    case 'dot': {
      const words = splitIntoWords(text);
      return words.map((w) => w.toLowerCase()).join('.');
    }
    case 'path': {
      const words = splitIntoWords(text);
      return words.map((w) => w.toLowerCase()).join('/');
    }
    case 'alternating':
      return text
        .split('')
        .map((char, i) =>
          i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        )
        .join('');
    case 'inverse':
      return text
        .split('')
        .map((char) =>
          /[a-z]/i.test(char)
            ? char === char.toUpperCase()
              ? char.toLowerCase()
              : char.toUpperCase()
            : char
        )
        .join('');
    default:
      return text;
  }
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function CaseConverterTool() {
  const [input, setInput] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<CaseType>('uppercase');
  const [copied, setCopied] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');

  const handleConvert = useCallback((): void => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    setOutput(convertCase(input, selectedCase));
  }, [input, selectedCase]);

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
        {/* Case Type Selector */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-800">
              Select Case
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CASE_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => setSelectedCase(option.key)}
                title={option.example}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                  selectedCase === option.key
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
                htmlFor="case-input"
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
              id="case-input"
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
              onClick={handleConvert}
              disabled={!input.trim()}
              className={cn(
                'w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                input.trim()
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <Play className="w-4 h-4" />
              Convert
            </button>
          </div>

          {/* Output Panel */}
          <div className="p-5 bg-gray-50/30">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="case-output"
                className="text-sm font-semibold text-gray-800"
              >
                Output
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {CASE_OPTIONS.find((o) => o.key === selectedCase)?.label}
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
              id="case-output"
              value={output}
              readOnly
              placeholder="Converted text will appear here..."
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
