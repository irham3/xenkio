'use client';

import { useState } from 'react';
import { useDiffChecker } from '../hooks/use-diff-checker';
import { DIFF_TYPES, VIEW_MODES, SAMPLE_ORIGINAL, SAMPLE_MODIFIED } from '../constants';
import { DiffType, DiffChange } from '../types';
import { hasChanges } from '../lib/diff-utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ChevronDown,
  ArrowRightLeft,
  Trash2,
  Zap,
  Plus,
  Minus,
  Equal,
  FileText,
  Columns,
  AlignJustify,
  Check,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DiffChecker() {
  const {
    options,
    viewMode,
    result,
    isComparing,
    updateOption,
    updateDiffType,
    setViewMode,
    compare,
    clearAll,
    swapTexts,
  } = useDiffChecker();

  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLoadSample = () => {
    updateOption('originalText', SAMPLE_ORIGINAL);
    updateOption('modifiedText', SAMPLE_MODIFIED);
  };

  const handleCopyDiff = () => {
    if (!result) return;

    const diffText = result.changes
      .map(change => {
        if (change.added) return `+ ${change.value}`;
        if (change.removed) return `- ${change.value}`;
        return `  ${change.value}`;
      })
      .join('');

    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canCompare = options.originalText.length > 0 || options.modifiedText.length > 0;

  return (
    <div className="w-full">
      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-gray-200">
              {VIEW_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    viewMode === mode.id
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {mode.id === 'split' ? (
                    <Columns className="w-3.5 h-3.5" />
                  ) : (
                    <AlignJustify className="w-3.5 h-3.5" />
                  )}
                  {mode.name}
                </button>
              ))}
            </div>

            {/* Diff Type Selector */}
            <div className="relative">
              <select
                value={options.diffType}
                onChange={(e) => updateDiffType(e.target.value as DiffType)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg pl-3 pr-8 py-2 outline-none transition-all hover:bg-gray-50 cursor-pointer"
              >
                {DIFF_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all border",
                showAdvanced
                  ? "bg-primary-50 text-primary-700 border-primary-200"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              )}
            >
              Options
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
            >
              Load Sample
            </button>
            <button
              onClick={swapTexts}
              disabled={!canCompare}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Swap texts"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <button
              onClick={clearAll}
              disabled={!canCompare}
              className="p-2 text-gray-500 hover:text-error-600 rounded-lg hover:bg-error-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Options Panel */}
        {showAdvanced && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={(e) => updateOption('ignoreCase', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Ignore case</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.ignoreWhitespace}
                  onChange={(e) => updateOption('ignoreWhitespace', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Ignore whitespace</span>
              </label>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={cn(
          "grid gap-0",
          viewMode === 'split' ? "lg:grid-cols-2" : "grid-cols-1"
        )}>
          {/* Original Text */}
          <div className={cn(
            "p-5 border-b lg:border-b-0",
            viewMode === 'split' && "lg:border-r border-gray-100"
          )}>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="original-text" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error-400"></span>
                  Original Text
                </Label>
                <span className="text-xs text-gray-400 font-medium tabular-nums">
                  {options.originalText.length} chars • {options.originalText.split('\n').length} lines
                </span>
              </div>
              <textarea
                id="original-text"
                value={options.originalText}
                onChange={(e) => updateOption('originalText', e.target.value)}
                placeholder="Paste original text here..."
                className="w-full min-h-[200px] p-3 text-[14px] leading-relaxed font-mono bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-y placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Modified Text */}
          <div className="p-5">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="modified-text" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success-400"></span>
                  Modified Text
                </Label>
                <span className="text-xs text-gray-400 font-medium tabular-nums">
                  {options.modifiedText.length} chars • {options.modifiedText.split('\n').length} lines
                </span>
              </div>
              <textarea
                id="modified-text"
                value={options.modifiedText}
                onChange={(e) => updateOption('modifiedText', e.target.value)}
                placeholder="Paste modified text here..."
                className="w-full min-h-[200px] p-3 text-[14px] leading-relaxed font-mono bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-y placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Compare Button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          <Button
            onClick={compare}
            disabled={isComparing || !canCompare}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all h-11"
          >
            {isComparing ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Comparing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Compare Differences
              </>
            )}
          </Button>
        </div>

        {/* Results Area */}
        {(result || isComparing) && (
          <div className="border-t border-gray-200">
            {/* Stats Bar */}
            {result && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-success-600 bg-success-50 px-2.5 py-1 rounded-full">
                    <Plus className="w-3 h-3" />
                    {result.stats.additions} added
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-error-600 bg-error-50 px-2.5 py-1 rounded-full">
                    <Minus className="w-3 h-3" />
                    {result.stats.deletions} removed
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    <Equal className="w-3 h-3" />
                    {result.stats.unchanged} unchanged
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    {result.executionTime.toFixed(1)}ms
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyDiff}
                    className={cn(
                      "h-7 gap-1.5 text-xs font-medium border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all",
                      copied && "text-success-600 border-success-500 bg-success-50"
                    )}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            )}

            {/* Diff Output */}
            <div className="p-4 bg-white">
              {isComparing ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-60">
                  <span className="relative flex h-8 w-8 mb-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-primary-500 justify-center items-center">
                      <Zap className="w-4 h-4 text-white" />
                    </span>
                  </span>
                  <p className="text-sm font-medium text-gray-600">Computing differences...</p>
                </div>
              ) : result && hasChanges(result) ? (
                viewMode === 'unified' ? (
                  <UnifiedDiffView changes={result.changes} />
                ) : (
                  <SplitDiffView changes={result.changes} />
                )
              ) : result ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-success-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">No Differences Found</h3>
                  <p className="text-sm text-gray-500">The two texts are identical.</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isComparing && (
          <div className="p-8 border-t border-gray-100 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Ready to Compare</h3>
              <p className="text-xs text-gray-500 max-w-[250px]">
                Enter or paste two texts above and click &quot;Compare Differences&quot; to see the changes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Unified Diff View Component
function UnifiedDiffView({ changes }: { changes: DiffChange[] }) {
  return (
    <div className="font-mono text-[13px] leading-relaxed bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-x-auto">
      <div className="whitespace-pre-wrap wrap-break-word">
        {changes.map((change, index) => (
          <span
            key={index}
            className={cn(
              change.added && "bg-success-100 text-success-800 px-0.5 rounded",
              change.removed && "bg-error-100 text-error-800 line-through px-0.5 rounded",
              !change.added && !change.removed && "text-gray-700"
            )}
          >
            {change.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// Split Diff View Component
function SplitDiffView({ changes }: { changes: DiffChange[] }) {
  // Build left (original) and right (modified) content
  const leftContent: { value: string; type: 'removed' | 'unchanged' }[] = [];
  const rightContent: { value: string; type: 'added' | 'unchanged' }[] = [];

  for (const change of changes) {
    if (change.removed) {
      leftContent.push({ value: change.value, type: 'removed' });
    } else if (change.added) {
      rightContent.push({ value: change.value, type: 'added' });
    } else {
      leftContent.push({ value: change.value, type: 'unchanged' });
      rightContent.push({ value: change.value, type: 'unchanged' });
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left (Original) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="w-2 h-2 rounded-full bg-error-400"></span>
          Original
        </div>
        <div className="font-mono text-[13px] leading-relaxed bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-x-auto min-h-[100px]">
          <div className="whitespace-pre-wrap wrap-break-word">
            {leftContent.map((item, index) => (
              <span
                key={index}
                className={cn(
                  item.type === 'removed' && "bg-error-100 text-error-800 px-0.5 rounded",
                  item.type === 'unchanged' && "text-gray-700"
                )}
              >
                {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right (Modified) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="w-2 h-2 rounded-full bg-success-400"></span>
          Modified
        </div>
        <div className="font-mono text-[13px] leading-relaxed bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-x-auto min-h-[100px]">
          <div className="whitespace-pre-wrap wrap-break-word">
            {rightContent.map((item, index) => (
              <span
                key={index}
                className={cn(
                  item.type === 'added' && "bg-success-100 text-success-800 px-0.5 rounded",
                  item.type === 'unchanged' && "text-gray-700"
                )}
              >
                {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
