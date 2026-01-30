'use client';

import { useState } from 'react';
import { useBase64 } from '../hooks/use-base64';
import { BASE64_MODES } from '../constants';
import { Base64Mode } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check, ArrowRightLeft, Trash2, FileCode, FileText, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Base64Encoder() {
  const { options, result, updateOption, swapInputOutput, clear } = useBase64();
  const [copied, setCopied] = useState(false);

  const currentMode = BASE64_MODES.find(m => m.id === options.mode);

  const handleCopy = async () => {
    if (result?.output) {
      try {
        await navigator.clipboard.writeText(result.output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback: clipboard access may fail in non-secure contexts
        console.warn('Clipboard access denied');
      }
    }
  };

  return (
    <div className="w-full">
      {/* Mode Switcher */}
      <div 
        className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200"
        role="tablist"
        aria-label="Base64 mode selection"
      >
        {BASE64_MODES.map((mode) => (
          <button
            key={mode.id}
            role="tab"
            aria-selected={options.mode === mode.id}
            onClick={() => updateOption('mode', mode.id as Base64Mode)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              options.mode === mode.id
                ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            {mode.id === 'encode' ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {mode.name}
          </button>
        ))}
      </div>

      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-2 gap-0">

          {/* LEFT PANEL: Input */}
          <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-4">
              {/* Input Header */}
              <div className="flex items-baseline justify-between">
                <Label htmlFor="input-text" className="text-sm font-semibold text-gray-800">
                  {options.mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                </Label>
                <span className="text-xs text-gray-400 font-medium tabular-nums">
                  {options.input.length} chars
                </span>
              </div>

              {/* Input Textarea */}
              <textarea
                id="input-text"
                value={options.input}
                onChange={(e) => updateOption('input', e.target.value)}
                placeholder={options.mode === 'encode' 
                  ? "Type or paste text to encode..." 
                  : "Paste Base64 string to decode..."
                }
                className="w-full min-h-[200px] p-4 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400 font-mono"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapInputOutput}
                  disabled={!result?.output || !!result.error}
                  className="flex-1 gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Swap
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  disabled={!options.input}
                  className="flex-1 gap-2 hover:text-error-600 hover:border-error-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </div>

              {/* Mode Description */}
              <p className="text-xs text-gray-500 leading-relaxed">
                {currentMode?.description}
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Output */}
          <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[300px]">
            <div className="flex flex-col h-auto">
              {/* Output Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  {options.mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                </h3>
                {result?.executionTime !== undefined && !result.error && result.output && (
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    {result.executionTime.toFixed(1)}ms
                  </span>
                )}
              </div>

              {/* Output Area */}
              <div className="flex-1 relative group" aria-live="polite" aria-label="Conversion result">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={result?.error ? 'error' : result?.output ? 'output' : 'empty'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "w-full min-h-[200px] p-4 rounded-xl border font-mono text-[13px] leading-relaxed break-all transition-all duration-300",
                      result?.error
                        ? "bg-error-50 border-error-200 text-error-600"
                        : result?.output
                          ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                          : "bg-white/50 border-dashed border-gray-200 text-gray-400"
                    )}
                  >
                    {result?.error ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                        <AlertCircle className="w-10 h-10 text-error-400" />
                        <p className="font-semibold text-sm">Decoding Error</p>
                        <p className="text-xs opacity-80 text-center max-w-[250px]">{result.error}</p>
                      </div>
                    ) : result?.output ? (
                      result.output
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3 py-8 opacity-50">
                        {options.mode === 'encode' ? (
                          <FileCode className="w-10 h-10 text-gray-300" />
                        ) : (
                          <FileText className="w-10 h-10 text-gray-300" />
                        )}
                        <p className="text-sm">
                          {options.mode === 'encode' 
                            ? 'Enter text to see Base64 output...' 
                            : 'Enter Base64 to see decoded text...'
                          }
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Copy Button */}
                {result?.output && !result.error && (
                  <div className="absolute top-3 right-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className={cn(
                        "h-8 gap-1.5 text-xs font-medium border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all",
                        copied && "text-success-600 border-success-500 bg-success-50"
                      )}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              {result?.output && !result.error && (
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>Input: <strong className="text-gray-700">{result.inputLength}</strong> chars</span>
                  <span className="text-gray-300">→</span>
                  <span>Output: <strong className="text-gray-700">{result.outputLength}</strong> chars</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
