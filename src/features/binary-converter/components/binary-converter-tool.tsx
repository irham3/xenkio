'use client';

import { useMemo, useState } from 'react';
import {
  ArrowsLeftRight,
  CodeSimple,
  FileText,
  Lightning,
  WarningCircle,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyButton, ClearButton } from '@/components/shared';
import { cn } from '@/lib/utils';

type BinaryMode = 'encode' | 'decode';
type BinarySeparator = 'space' | 'dash' | 'none';

interface BinaryResult {
  output: string;
  inputLength: number;
  outputLength: number;
  byteCount: number;
  executionTime: number;
  error?: string;
}

interface BinaryConversion {
  output: string;
  byteCount: number;
  error?: string;
}

const MODES: { id: BinaryMode; name: string; description: string }[] = [
  {
    id: 'encode',
    name: 'Text to Binary',
    description: 'Convert text into 8-bit UTF-8 binary byte groups.',
  },
  {
    id: 'decode',
    name: 'Binary to Text',
    description: 'Decode binary byte groups back into readable UTF-8 text.',
  },
];

const SEPARATORS: { id: BinarySeparator; label: string; value: string }[] = [
  { id: 'space', label: 'Space', value: ' ' },
  { id: 'dash', label: 'Dash', value: '-' },
  { id: 'none', label: 'None', value: '' },
];

function encodeTextToBinary(input: string, separator: BinarySeparator): BinaryConversion {
  const bytes = new TextEncoder().encode(input);
  const separatorValue = SEPARATORS.find((item) => item.id === separator)?.value ?? ' ';
  const output = Array.from(bytes, (byte) => byte.toString(2).padStart(8, '0')).join(separatorValue);

  return { output, byteCount: bytes.length };
}

function getBinaryTokens(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return { tokens: [] };
  }

  if (/[\s-]/.test(trimmed)) {
    return { tokens: trimmed.split(/[\s-]+/).filter(Boolean) };
  }

  if (trimmed.length % 8 !== 0) {
    return {
      tokens: [],
      error: 'Binary input without separators must be a multiple of 8 bits.',
    };
  }

  return { tokens: trimmed.match(/.{8}/g) ?? [] };
}

function decodeBinaryToText(input: string): BinaryConversion {
  const { tokens, error } = getBinaryTokens(input);

  if (error) {
    return { output: '', byteCount: 0, error };
  }

  const invalidToken = tokens.find((token) => !/^[01]{8}$/.test(token));

  if (invalidToken) {
    return {
      output: '',
      byteCount: 0,
      error: `Invalid binary group "${invalidToken.slice(0, 16)}". Each group must contain exactly 8 bits.`,
    };
  }

  try {
    const bytes = new Uint8Array(tokens.map((token) => parseInt(token, 2)));
    const output = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

    return { output, byteCount: bytes.length };
  } catch {
    return {
      output: '',
      byteCount: 0,
      error: 'Could not decode the binary input as valid UTF-8 text.',
    };
  }
}

export function BinaryConverterTool() {
  const [mode, setMode] = useState<BinaryMode>('encode');
  const [separator, setSeparator] = useState<BinarySeparator>('space');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<BinaryResult | null>(null);

  const activeMode = useMemo(() => MODES.find((item) => item.id === mode) ?? MODES[0], [mode]);
  const hasInput = mode === 'encode' ? input.length > 0 : input.trim().length > 0;

  const handleConvert = () => {
    if (!hasInput) {
      setResult(null);
      return;
    }

    const startTime = performance.now();
    const conversion = mode === 'encode' ? encodeTextToBinary(input, separator) : decodeBinaryToText(input);

    setResult({
      output: conversion.output,
      inputLength: input.length,
      outputLength: conversion.output.length,
      byteCount: conversion.byteCount,
      executionTime: performance.now() - startTime,
      error: conversion.error,
    });
  };

  const handleModeChange = (nextMode: BinaryMode) => {
    setMode(nextMode);
    setResult(null);
  };

  const handleSeparatorChange = (nextSeparator: BinarySeparator) => {
    setSeparator(nextSeparator);
    setResult(null);
  };

  const handleSwap = () => {
    if (!result?.output || result.error) return;
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(result.output);
    setResult(null);
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
  };

  return (
    <div className="w-full">
      <div
        className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200"
        role="tablist"
        aria-label="Binary converter mode selection"
      >
        {MODES.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={mode === item.id}
            onClick={() => handleModeChange(item.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              mode === item.id
                ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            )}
          >
            {item.id === 'encode' ? (
              <CodeSimple className="w-4 h-4" weight="duotone" />
            ) : (
              <FileText className="w-4 h-4" weight="duotone" />
            )}
            {item.name}
          </button>
        ))}
      </div>

      {mode === 'encode' && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm text-gray-500 font-medium">Byte separator:</span>
          <div className="flex items-center gap-1">
            {SEPARATORS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSeparatorChange(item.id)}
                className={cn(
                  'px-3 py-1 text-xs rounded-lg border font-medium transition-all duration-150',
                  separator === item.id
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="binary-input" className="text-sm font-semibold text-gray-800">
                  {mode === 'encode' ? 'Text Input' : 'Binary Input'}
                </Label>
                <span className="text-xs text-gray-400 font-medium tabular-nums">{input.length} chars</span>
              </div>

              <textarea
                id="binary-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  mode === 'encode'
                    ? 'Type or paste text to convert to binary...'
                    : 'Paste binary such as 01001000 01100101 01101100 01101100 01101111...'
                }
                className="w-full min-h-50 p-4 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400 font-mono"
              />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwap}
                  disabled={!result?.output || !!result.error}
                  className="flex-1 gap-2 cursor-pointer"
                >
                  <ArrowsLeftRight className="w-4 h-4" weight="duotone" />
                  Swap
                </Button>
                <ClearButton onClick={handleClear} disabled={!input} className="flex-1" />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleConvert}
                  disabled={!hasInput}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                >
                  <Lightning className="w-4 h-4 mr-2" weight="duotone" />
                  {mode === 'encode' ? 'Convert to Binary' : 'Convert to Text'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">{activeMode.description}</p>
            </div>
          </div>

          <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-75">
            <div className="flex flex-col h-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  {mode === 'encode' ? 'Binary Output' : 'Decoded Text'}
                </h3>
                {result?.executionTime !== undefined && !result.error && result.output && (
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    <Lightning className="w-3 h-3" weight="duotone" />
                    {result.executionTime.toFixed(1)}ms
                  </span>
                )}
              </div>

              <div className="flex-1 relative group" aria-live="polite" aria-label="Conversion result">
                <div
                  className={cn(
                    'w-full min-h-50 p-4 rounded-xl border font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap transition-all duration-300',
                    result?.error
                      ? 'bg-error-50 border-error-200 text-error-600'
                      : result?.output
                        ? 'bg-white border-gray-200 text-gray-700 shadow-sm'
                        : 'bg-white/50 border-dashed border-gray-200 text-gray-400'
                  )}
                >
                  {result?.error ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                      <WarningCircle className="w-10 h-10 text-error-400" weight="duotone" />
                      <p className="font-semibold text-sm">Conversion Error</p>
                      <p className="text-xs opacity-80 text-center max-w-xs">{result.error}</p>
                    </div>
                  ) : result?.output ? (
                    result.output
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-8 opacity-50">
                      {mode === 'encode' ? (
                        <CodeSimple className="w-10 h-10 text-gray-300" weight="duotone" />
                      ) : (
                        <FileText className="w-10 h-10 text-gray-300" weight="duotone" />
                      )}
                      <p className="text-sm">
                        {mode === 'encode'
                          ? 'Enter text to see binary output...'
                          : 'Enter binary to see decoded text...'}
                      </p>
                    </div>
                  )}
                </div>

                {result?.output && !result.error && (
                  <div className="absolute top-3 right-3">
                    <CopyButton value={result.output} size="sm" />
                  </div>
                )}
              </div>

              {result?.output && !result.error && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                  <span>
                    Input: <strong className="text-gray-700">{result.inputLength}</strong> chars
                  </span>
                  <span>
                    Output: <strong className="text-gray-700">{result.outputLength}</strong> chars
                  </span>
                  <span>
                    Bytes: <strong className="text-gray-700">{result.byteCount}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
