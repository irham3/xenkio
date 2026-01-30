'use client';

import React, { useState, useCallback } from 'react';
import { useRegexTester } from '../hooks/use-regex-tester';
import { COMMON_PATTERNS, buildFlagsString } from '../lib/regex-utils';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Trash2, 
  History, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function RegexTester() {
  const {
    config,
    testString,
    result,
    history,
    updatePattern,
    updateFlags,
    updateTestString,
    saveToHistory,
    loadFromHistory,
    clearAll,
  } = useRegexTester();

  const [copied, setCopied] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleCopyPattern = useCallback(async () => {
    if (!config.pattern) return;
    const fullPattern = `/${config.pattern}/${buildFlagsString(config.flags)}`;
    await navigator.clipboard.writeText(fullPattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [config.pattern, config.flags]);

  const handleSelectPattern = useCallback((pattern: string) => {
    updatePattern(pattern);
    setShowPatterns(false);
  }, [updatePattern]);

  const flagButtons = [
    { key: 'global', label: 'g', title: 'Global - Find all matches' },
    { key: 'ignoreCase', label: 'i', title: 'Ignore Case - Case insensitive matching' },
    { key: 'multiline', label: 'm', title: 'Multiline - ^ and $ match line boundaries' },
    { key: 'dotAll', label: 's', title: 'DotAll - Dot matches newlines' },
    { key: 'unicode', label: 'u', title: 'Unicode - Enable unicode support' },
    { key: 'sticky', label: 'y', title: 'Sticky - Match from lastIndex only' },
  ] as const;

  const highlightMatches = useCallback(() => {
    if (!testString || result.matches.length === 0) {
      return <span className="text-gray-600">{testString || 'Enter test string...'}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort matches by index to ensure proper ordering
    const sortedMatches = [...result.matches].sort((a, b) => a.index - b.index);

    sortedMatches.forEach((match, i) => {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`} className="text-gray-600">
            {testString.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the match with highlight
      parts.push(
        <span
          key={`match-${i}`}
          className="bg-primary-100 text-primary-700 border-b-2 border-primary-400 px-0.5 rounded-sm"
          title={`Match ${i + 1}: "${match.fullMatch}" at index ${match.index}`}
        >
          {match.fullMatch}
        </span>
      );

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      parts.push(
        <span key="text-end" className="text-gray-600">
          {testString.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  }, [testString, result.matches]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Pattern Input */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Status Bar */}
          <div className={cn(
            "h-1.5 w-full transition-colors duration-300",
            !config.pattern ? "bg-gray-100" :
            result.error ? "bg-error-500" :
            result.matches.length > 0 ? "bg-success-500" : "bg-accent-400"
          )} />

          <div className="p-6 md:p-8">
            {/* Pattern Field */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Regular Expression</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPatterns(!showPatterns)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Common Patterns
                    {showPatterns ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Pattern Input with delimiters */}
              <div className="flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-primary-500 transition-colors">
                <span className="text-xl text-gray-400 pl-4 font-mono">/</span>
                <input
                  type="text"
                  value={config.pattern}
                  onChange={(e) => updatePattern(e.target.value)}
                  placeholder="Enter your regex pattern..."
                  className="flex-1 px-2 py-4 bg-transparent font-mono text-lg text-gray-800 placeholder:text-gray-400 focus:outline-none"
                  spellCheck={false}
                />
                <span className="text-xl text-gray-400 font-mono">/</span>
                <span className="text-lg text-primary-600 font-mono pr-4">
                  {buildFlagsString(config.flags)}
                </span>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {result.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 flex items-center gap-2 text-error-600 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {result.error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Common Patterns Dropdown */}
              <AnimatePresence>
                {showPatterns && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      {COMMON_PATTERNS.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => handleSelectPattern(p.pattern)}
                          className="text-left px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        >
                          <span className="font-medium text-gray-700">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Flags */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Flags</label>
              <div className="flex flex-wrap gap-2">
                {flagButtons.map((flag) => (
                  <button
                    key={flag.key}
                    onClick={() => updateFlags({ [flag.key]: !config.flags[flag.key] })}
                    title={flag.title}
                    className={cn(
                      "w-10 h-10 rounded-lg font-mono text-lg font-bold transition-all border-2",
                      config.flags[flag.key]
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
                    )}
                  >
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCopyPattern}
                disabled={!config.pattern}
                className={cn(
                  "rounded-xl px-5 h-11 font-medium transition-all",
                  copied
                    ? "bg-success-100 text-success-700 border-2 border-success-200"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600"
                )}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Pattern
                  </>
                )}
              </Button>

              <Button
                onClick={saveToHistory}
                disabled={!config.pattern || !testString}
                className="rounded-xl px-5 h-11 font-medium bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600"
              >
                <History className="mr-2 h-4 w-4" />
                Save
              </Button>

              <Button
                onClick={clearAll}
                className="rounded-xl px-5 h-11 font-medium bg-white text-gray-700 border-2 border-gray-200 hover:border-error-500 hover:text-error-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Test String Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700">Test String</label>
              <span className="text-xs text-gray-400">{testString.length} characters</span>
            </div>
            <textarea
              value={testString}
              onChange={(e) => updateTestString(e.target.value)}
              placeholder="Enter text to test against your regex..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none font-mono text-sm text-gray-700 placeholder:text-gray-400 resize-none transition-colors"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Results with Highlighting */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">Match Results</label>
                {result.matches.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-success-600 bg-success-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>
              {result.executionTime > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {result.executionTime.toFixed(2)}ms
                </span>
              )}
            </div>

            {/* Highlighted Text */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm whitespace-pre-wrap break-all min-h-[120px]">
              {highlightMatches()}
            </div>

            {/* Match Details */}
            {result.matches.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Match Details</label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {result.matches.map((match, index) => (
                    <div
                      key={match.id}
                      className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-gray-800 break-all bg-white px-2 py-1 rounded border border-gray-200">
                          {match.fullMatch}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-3">
                          <span>Index: {match.index}</span>
                          <span>Length: {match.length}</span>
                          <span>Line: {match.lineNumber}, Col: {match.columnNumber}</span>
                        </div>
                        {match.groups.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {match.groups.map((group, gi) => (
                              <span
                                key={gi}
                                className="px-2 py-0.5 bg-accent-100 text-accent-700 rounded text-xs font-mono"
                              >
                                ${gi + 1}: {group}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Quick Reference */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent-500" />
              Quick Reference
            </h3>
          </div>
          <div className="p-4 space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Characters</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">.</code>
                <span className="text-gray-600">Any character</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">\d</code>
                <span className="text-gray-600">Digit [0-9]</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">\w</code>
                <span className="text-gray-600">Word character</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">\s</code>
                <span className="text-gray-600">Whitespace</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Quantifiers</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">*</code>
                <span className="text-gray-600">0 or more</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">+</code>
                <span className="text-gray-600">1 or more</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">?</code>
                <span className="text-gray-600">0 or 1</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">{'{n}'}</code>
                <span className="text-gray-600">Exactly n</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Anchors</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">^</code>
                <span className="text-gray-600">Start of string</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">$</code>
                <span className="text-gray-600">End of string</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">\b</code>
                <span className="text-gray-600">Word boundary</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Groups</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">(abc)</code>
                <span className="text-gray-600">Capture group</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">(?:abc)</code>
                <span className="text-gray-600">Non-capture</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">[abc]</code>
                <span className="text-gray-600">Character set</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">[^abc]</code>
                <span className="text-gray-600">Negated set</span>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between"
          >
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">{history.length}/10</span>
              {showHistory ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No saved patterns yet</p>
                  ) : (
                    history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors"
                      >
                        <div className="font-mono text-xs text-gray-700 truncate">
                          /{item.pattern}/{item.flags}
                        </div>
                        <div className="mt-1 text-xs text-gray-400 flex items-center gap-2">
                          <span>{item.matchCount} matches</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
