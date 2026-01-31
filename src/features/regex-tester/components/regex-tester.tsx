'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRegexTester } from '../hooks/use-regex-tester';
import { COMMON_PATTERNS, FLAG_DESCRIPTIONS } from '../constants';
import { RegexFlags, RegexMatch } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check, ChevronDown, Zap, AlertCircle, Regex, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function RegexTester() {
  const {
    options,
    result,
    flagsString,
    isProcessing,
    updatePattern,
    updateTestText,
    updateFlag,
    test,
    clearAll,
  } = useRegexTester();

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);

  const handleCopy = useCallback(async () => {
    if (options.pattern) {
      try {
        await navigator.clipboard.writeText(`/${options.pattern}/${flagsString}`);
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      }
    }
  }, [options.pattern, flagsString]);

  const handleSelectPattern = useCallback((pattern: string) => {
    updatePattern(pattern);
    setShowPatternDropdown(false);
  }, [updatePattern]);

  // Highlighted text with matches
  const highlightedText = useMemo(() => {
    if (!result || !result.isValid || result.matches.length === 0 || !options.testText) {
      return null;
    }

    const text = options.testText;
    const matches = result.matches;
    const parts: { text: string; isMatch: boolean; matchIndex: number }[] = [];
    let lastIndex = 0;

    // Sort matches by index
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

    sortedMatches.forEach((match, idx) => {
      // Add non-matching text before this match
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.index),
          isMatch: false,
          matchIndex: -1,
        });
      }
      // Add the match
      parts.push({
        text: match.match,
        isMatch: true,
        matchIndex: idx,
      });
      lastIndex = match.index + match.length;
    });

    // Add remaining text after last match
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        isMatch: false,
        matchIndex: -1,
      });
    }

    return parts;
  }, [result, options.testText]);

  return (
    <div className="w-full">
      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-5 gap-0">

          {/* LEFT PANEL: Pattern & Options */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-5">
              {/* Pattern Input */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="regex-pattern" className="text-sm font-semibold text-gray-800">
                    Regular Expression
                  </Label>
                  {result?.isValid && options.pattern && (
                    <span className="text-xs text-gray-400 font-medium">
                      /{flagsString}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="flex items-center">
                    <span className="absolute left-3 text-gray-400 font-mono text-sm">/</span>
                    <input
                      id="regex-pattern"
                      type="text"
                      value={options.pattern}
                      onChange={(e) => updatePattern(e.target.value)}
                      placeholder="Enter regex pattern..."
                      className={cn(
                        "w-full pl-6 pr-16 py-3 text-[14px] font-mono bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all placeholder:text-gray-400",
                        result && !result.isValid && options.pattern
                          ? "border-error-300 bg-error-50"
                          : "border-gray-200"
                      )}
                    />
                    <span className="absolute right-3 text-gray-400 font-mono text-sm">
                      /{flagsString}
                    </span>
                  </div>
                </div>
                {result && !result.isValid && result.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 text-error-600 text-xs bg-error-50 px-3 py-2 rounded-lg border border-error-100"
                  >
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{result.error}</span>
                  </motion.div>
                )}
              </div>

              {/* Common Patterns Dropdown */}
              <div className="space-y-2 relative">
                <Label htmlFor="common-patterns-btn" className="text-sm font-semibold text-gray-800">Common Patterns</Label>
                <div className="relative">
                  <button
                    id="common-patterns-btn"
                    type="button"
                    onClick={() => setShowPatternDropdown(!showPatternDropdown)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && showPatternDropdown) {
                        setShowPatternDropdown(false);
                      }
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={showPatternDropdown}
                    aria-controls="common-patterns-listbox"
                    className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3 outline-none transition-all hover:bg-gray-100 cursor-pointer focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                  >
                    <span className="text-gray-500">Select a pattern...</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-500 transition-transform",
                      showPatternDropdown && "rotate-180"
                    )} />
                  </button>
                  <AnimatePresence>
                    {showPatternDropdown && (
                      <motion.div
                        id="common-patterns-listbox"
                        role="listbox"
                        aria-label="Common regex patterns"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      >
                        {COMMON_PATTERNS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            role="option"
                            aria-selected={options.pattern === p.pattern}
                            onClick={() => handleSelectPattern(p.pattern)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                              <span className="text-sm font-medium text-gray-800">{p.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 ml-5">{p.description}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Flags */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label className="text-sm font-semibold text-gray-800">Flags</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FLAG_DESCRIPTIONS) as [keyof RegexFlags, typeof FLAG_DESCRIPTIONS[keyof RegexFlags]][]).map(([key, desc]) => (
                    <label
                      key={key}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all",
                        options.flags[key]
                          ? "bg-primary-50 border-primary-200 text-primary-700"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={options.flags[key]}
                        onChange={(e) => updateFlag(key, e.target.checked)}
                        className="sr-only"
                      />
                      <span className={cn(
                        "w-5 h-5 flex items-center justify-center text-xs font-mono font-bold rounded",
                        options.flags[key]
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      )}>
                        {desc.flag}
                      </span>
                      <span className="text-xs font-medium">{desc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Test Text Input */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="test-text" className="text-sm font-semibold text-gray-800">
                    Test String
                  </Label>
                  <span className="text-xs text-gray-400 font-medium tabular-nums">
                    {options.testText.length} chars
                  </span>
                </div>
                <textarea
                  id="test-text"
                  value={options.testText}
                  onChange={(e) => updateTestText(e.target.value)}
                  placeholder="Enter text to test against..."
                  className="w-full min-h-[120px] p-3 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                />
              </div>

              {/* Test Button */}
              <div className="pt-2">
                <Button
                  onClick={test}
                  disabled={isProcessing || !options.pattern || !options.testText}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test Regex
                    </>
                  )}
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCopy}
                  disabled={!options.pattern}
                  className={cn(
                    "flex-1 shadow-sm transition-all",
                    copyError 
                      ? "bg-error-600 hover:bg-error-700 text-white" 
                      : "bg-primary-600 hover:bg-primary-700 text-white"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : copyError ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Failed
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Regex
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Results */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[400px] border-l border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Results</h3>
              {result && result.executionTime > 0 && (
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  {result.executionTime.toFixed(2)}ms
                </span>
              )}
            </div>

            {/* Match Count Badge */}
            {result?.isValid && options.pattern && (
              <div className="mb-4">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  result.matchCount > 0
                    ? "bg-success-100 text-success-700"
                    : "bg-gray-100 text-gray-600"
                )}>
                  <span className="font-bold">{result.matchCount}</span>
                  <span>match{result.matchCount !== 1 ? 'es' : ''} found</span>
                </div>
              </div>
            )}

            {/* Highlighted Text Preview */}
            <div className="flex-1 relative">
              <div className="w-full h-full min-h-[200px] p-4 rounded-xl border border-gray-200 bg-white overflow-auto">
                {!result ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                    <Regex className="w-10 h-10 text-gray-300" />
                    <p className="text-sm text-gray-400">Click &quot;Test Regex&quot; to see results</p>
                  </div>
                ) : !result.isValid ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-error-500">
                    <AlertCircle className="w-10 h-10 text-error-300" />
                    <p className="text-sm">Fix the pattern error above</p>
                  </div>
                ) : highlightedText ? (
                  <pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap break-all leading-relaxed">
                    {highlightedText.map((part, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          part.isMatch && "bg-yellow-200 text-yellow-900 rounded px-0.5"
                        )}
                      >
                        {part.text}
                      </span>
                    ))}
                  </pre>
                ) : options.testText ? (
                  <pre className="font-mono text-sm text-gray-400 whitespace-pre-wrap break-all leading-relaxed">
                    {options.testText}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                    <Regex className="w-8 h-8 text-gray-300" />
                    <p className="text-sm text-gray-400">Enter text to test</p>
                  </div>
                )}
              </div>
            </div>

            {/* Match List */}
            {result?.isValid && result.matches.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Match Details
                </h4>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {result.matches.slice(0, 50).map((match: RegexMatch, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 text-sm"
                    >
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 font-bold text-xs rounded-full">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-gray-800 break-all bg-gray-50 px-2 py-1 rounded">
                          {match.match || <span className="text-gray-400 italic">(empty string)</span>}
                        </div>
                        <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                          <span>Index: <span className="font-mono font-medium text-gray-700">{match.index}</span></span>
                          <span>Length: <span className="font-mono font-medium text-gray-700">{match.length}</span></span>
                        </div>
                        {match.groups && Object.keys(match.groups).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-medium">Groups:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(match.groups).map(([name, value]) => (
                                <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                  <span className="font-medium text-gray-600">{name}:</span>
                                  <span className="font-mono text-gray-800">{value}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {result.matches.length > 50 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Showing first 50 of {result.matches.length} matches
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
