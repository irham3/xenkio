import { useState, useCallback, useMemo } from 'react';
import { RegexOptions, RegexFlags } from '../types';
import { executeRegex, buildFlagsString } from '../lib/regex-utils';
import { DEFAULT_FLAGS } from '../constants';

/**
 * Hook for managing regex tester state and functionality.
 * Provides live regex matching with pattern, test text, and flags management.
 * 
 * @returns Object containing:
 * - options: Current regex options (pattern, testText, flags)
 * - result: Computed regex result with matches and validity
 * - flagsString: String representation of active flags (e.g., "gi")
 * - updatePattern: Function to update the regex pattern
 * - updateTestText: Function to update the test string
 * - updateFlag: Function to toggle individual flags
 * - clearAll: Function to reset all inputs to defaults
 */
export function useRegexTester() {
  const [options, setOptions] = useState<RegexOptions>({
    pattern: '',
    testText: '',
    flags: { ...DEFAULT_FLAGS },
  });

  // Memoize the flags string for display
  const flagsString = useMemo(() => buildFlagsString(options.flags), [options.flags]);

  // Compute result directly from options using useMemo instead of useEffect + setState
  const result = useMemo(() => executeRegex(options), [options]);

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
  }, []);

  return {
    options,
    result,
    flagsString,
    updatePattern,
    updateTestText,
    updateFlag,
    clearAll,
  };
}
