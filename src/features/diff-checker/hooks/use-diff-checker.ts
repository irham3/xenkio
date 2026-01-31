import { useState, useCallback } from 'react';
import { DiffOptions, DiffResult, DiffType, DiffViewMode } from '../types';
import { computeDiff } from '../lib/diff-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useDiffChecker() {
  const [options, setOptions] = useState<DiffOptions>({
    originalText: '',
    modifiedText: '',
    diffType: DEFAULT_OPTIONS.diffType,
    ignoreCase: DEFAULT_OPTIONS.ignoreCase,
    ignoreWhitespace: DEFAULT_OPTIONS.ignoreWhitespace,
  });

  const [viewMode, setViewMode] = useState<DiffViewMode>(DEFAULT_OPTIONS.viewMode);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const compare = useCallback(() => {
    if (!options.originalText && !options.modifiedText) {
      setResult(null);
      return;
    }

    setIsComparing(true);

    // Use setTimeout to allow UI to update before computation
    setTimeout(() => {
      try {
        const diffResult = computeDiff(options);
        setResult(diffResult);
      } catch (error) {
        console.error('Diff computation failed', error);
        setResult(null);
      } finally {
        setIsComparing(false);
      }
    }, 10);
  }, [options]);

  const updateOption = <K extends keyof DiffOptions>(key: K, value: DiffOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateDiffType = (diffType: DiffType) => {
    setOptions(prev => ({ ...prev, diffType }));
  };

  const clearAll = useCallback(() => {
    setOptions({
      originalText: '',
      modifiedText: '',
      diffType: DEFAULT_OPTIONS.diffType,
      ignoreCase: DEFAULT_OPTIONS.ignoreCase,
      ignoreWhitespace: DEFAULT_OPTIONS.ignoreWhitespace,
    });
    setResult(null);
  }, []);

  const swapTexts = useCallback(() => {
    setOptions(prev => ({
      ...prev,
      originalText: prev.modifiedText,
      modifiedText: prev.originalText,
    }));
    setResult(null);
  }, []);

  return {
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
  };
}
