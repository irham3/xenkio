import { useState, useCallback } from 'react';
import { RegexOptions, RegexFlags, RegexResult } from '../types';
import { executeRegex, buildFlagsString } from '../lib/regex-utils';
import { DEFAULT_FLAGS } from '../constants';

/**
 * Hook for managing regex tester state and functionality.
 * Provides regex matching with pattern, test text, and flags management.
 * 
 * @returns Object containing:
 * - options: Current regex options (pattern, testText, flags)
 * - result: Computed regex result with matches and validity
 * - flagsString: String representation of active flags (e.g., "gi")
 * - isProcessing: Boolean indicating if regex is being processed
 * - updatePattern: Function to update the regex pattern
 * - updateTestText: Function to update the test string
 * - updateFlag: Function to toggle individual flags
 * - test: Function to execute the regex test
 * - clearAll: Function to reset all inputs to defaults
 */
export function useRegexTester() {
  const [options, setOptions] = useState<RegexOptions>({
    pattern: '',
    testText: '',
    flags: { ...DEFAULT_FLAGS },
  });

  const [result, setResult] = useState<RegexResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute flags string
  const flagsString = buildFlagsString(options.flags);

  const test = useCallback(() => {
    if (!options.pattern || !options.testText) {
      setResult(null);
      return;
    }

    setIsProcessing(true);
    try {
      const res = executeRegex(options);
      setResult(res);
    } catch (error) {
      console.error('Regex test failed', error);
      setResult({
        matches: [],
        matchCount: 0,
        isValid: false,
        error: 'Processing failed',
        executionTime: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const updatePattern = useCallback((pattern: string) => {
    setOptions(prev => ({ ...prev, pattern }));
  }, []);

  const updateTestText = useCallback((testText: string) => {
    setOptions(prev => ({ ...prev, testText }));
  }, []);

  const updateFlag = useCallback((flag: keyof RegexFlags, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      flags: { ...prev.flags, [flag]: value },
    }));
  }, []);

  const clearAll = useCallback(() => {
    setOptions({
      pattern: '',
      testText: '',
      flags: { ...DEFAULT_FLAGS },
    });
    setResult(null);
  }, []);

  return {
    options,
    result,
    flagsString,
    isProcessing,
    updatePattern,
    updateTestText,
    updateFlag,
    test,
    clearAll,
  };
}
