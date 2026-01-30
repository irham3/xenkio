'use client';

import { useState } from 'react';
import { useBase64Encoder } from '../hooks/use-base64-encoder';
import { BASE64_MODES } from '../constants';
import { Base64Mode } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check, ArrowRightLeft, Zap, Terminal, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Base64Encoder() {
  const { options, result, updateOption, swapMode, clearInput } = useBase64Encoder();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (result?.output) {
      try {
        await navigator.clipboard.writeText(result.output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard access may fail due to permissions or security restrictions
        // Fail silently - user will notice copy button didn't change state
      }
    }
  };

  const currentMode = BASE64_MODES.find(m => m.id === options.mode);

  return (
    <div className="w-full">
      {/* Mode Switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200">
        {BASE64_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => updateOption('mode', mode.id as Base64Mode)}
            aria-pressed={options.mode === mode.id}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              options.mode === mode.id
                ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
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

              {/* Text Input */}
              <textarea
                id="input-text"
                value={options.input}
                onChange={(e) => updateOption('input', e.target.value)}
                placeholder={options.mode === 'encode' 
                  ? "Enter text to encode to Base64..." 
                  : "Paste Base64 string to decode..."}
                className="w-full min-h-[200px] p-3 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400 font-mono"
              />

              {/* Options */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label htmlFor="url-safe-checkbox" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="url-safe-checkbox"
                    type="checkbox"
                    checked={options.urlSafe}
                    onChange={(e) => updateOption('urlSafe', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">URL-safe mode</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearInput}
                    disabled={!options.input}
                    className="h-8 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={swapMode}
                    disabled={!result?.output}
                    className="h-8 text-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                    Swap
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Output */}
          <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[300px]">
            <div className="flex flex-col h-full">
              {/* Output Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  {options.mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                </h3>
                {result?.executionTime !== undefined && !result.error && result.output && (
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    {result.executionTime.toFixed(2)}ms
                  </span>
                )}
              </div>

              {/* Output Area */}
              <div className="flex-1 relative group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={result?.output || 'empty'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "w-full min-h-[200px] p-4 rounded-xl border font-mono text-[13px] leading-relaxed break-all transition-all duration-300 overflow-auto",
                      result?.error
                        ? "bg-error-50 border-error-200 text-error-600"
                        : result?.output
                          ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                          : "bg-white/50 border-dashed border-gray-200 text-gray-400"
                    )}
                  >
                    {result?.error ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 min-h-[150px]">
                        <AlertCircle className="w-8 h-8 text-error-400 mb-2" />
                        <p className="font-semibold text-center">Decoding Error</p>
                        <p className="text-xs opacity-80 text-center">{result.error}</p>
                      </div>
                    ) : result?.output ? (
                      result.output
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50 min-h-[150px]">
                        <Terminal className="w-8 h-8 text-gray-300" />
                        <p className="text-center">
                          {options.mode === 'encode' 
                            ? 'Enter text to see Base64 output...' 
                            : 'Paste Base64 to see decoded text...'}
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
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Input: {result.inputLength} chars</span>
                    <span>Output: {result.outputLength} chars</span>
                    <span className={cn(
                      options.mode === 'encode' ? "text-amber-600" : "text-success-600"
                    )}>
                      {options.mode === 'encode' 
                        ? `+${Math.round((result.outputLength / result.inputLength - 1) * 100)}%`
                        : `-${Math.round((1 - result.outputLength / result.inputLength) * 100)}%`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          <strong className="text-gray-700">{currentMode?.name}:</strong> {currentMode?.description}.
          {options.urlSafe && ' URL-safe mode replaces +/ with -_ and removes padding.'}
        </p>
      </div>
    </div>
  );
}
