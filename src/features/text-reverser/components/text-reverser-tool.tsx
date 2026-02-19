'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Trash2, Type, ArrowLeftRight, ArrowUpDown, LetterText, ListOrdered, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ReversalMode = 'characters' | 'words' | 'word-order' | 'lines' | 'line-order';

interface ModeOption {
  id: ReversalMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MODES: ModeOption[] = [
  { id: 'characters', label: 'Characters', description: 'Reverse entire text', icon: <Type className="w-4 h-4" /> },
  { id: 'words', label: 'Each Word', description: 'Reverse each word', icon: <LetterText className="w-4 h-4" /> },
  { id: 'word-order', label: 'Word Order', description: 'Reverse word order', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: 'lines', label: 'Each Line', description: 'Reverse each line', icon: <ListOrdered className="w-4 h-4" /> },
  { id: 'line-order', label: 'Line Order', description: 'Reverse line order', icon: <ArrowUpDown className="w-4 h-4" /> },
];

function reverseString(str: string): string {
  return [...str].reverse().join('');
}

function applyReversal(text: string, mode: ReversalMode): string {
  if (!text) return '';

  switch (mode) {
    case 'characters':
      return reverseString(text);
    case 'words':
      return text.replace(/\S+/g, (word) => reverseString(word));
    case 'word-order':
      return text
        .split('\n')
        .map((line) => line.split(/(\s+)/).reverse().join(''))
        .join('\n');
    case 'lines':
      return text
        .split('\n')
        .map((line) => reverseString(line))
        .join('\n');
    case 'line-order':
      return text.split('\n').reverse().join('\n');
  }
}

export function TextReverserTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ReversalMode>('characters');
  const [copied, setCopied] = useState(false);

  const [output, setOutput] = useState('');

  const handleReverse = useCallback(() => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    setOutput(applyReversal(input, mode));
  }, [input, mode]);

  const charCount = input.length;
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const lineCount = input ? input.split('\n').length : 0;

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

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Mode Selector */}
        <div className="p-4 lg:p-5 border-b border-gray-100 bg-white">
          <Label className="text-sm font-semibold text-gray-800 mb-3 block">Reversal Mode</Label>
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
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {MODES.find((m) => m.id === mode)?.description}
          </p>
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
                  <Trash2 className="w-3 h-3" />
                  Clear
                </Button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-56 lg:h-72 p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 text-sm text-gray-900 placeholder:text-gray-400 resize-none outline-none transition-all"
              />
              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{charCount} characters</span>
                <span className="w-px h-3 bg-gray-200" />
                <span>{wordCount} words</span>
                <span className="w-px h-3 bg-gray-200" />
                <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
              </div>
              <button
                onClick={handleReverse}
                disabled={!input.trim()}
                className={cn(
                  'w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                  input.trim()
                    ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <Play className="w-4 h-4" />
                Reverse
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
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Reversed text will appear here..."
                className="w-full h-56 lg:h-72 p-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 resize-none outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
