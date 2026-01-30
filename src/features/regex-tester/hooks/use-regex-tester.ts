import { useState, useCallback, useMemo } from 'react';
import { RegexOptions, RegexFlags } from '../types';
import { executeRegex, buildFlagsString } from '../lib/regex-utils';
import { DEFAULT_FLAGS } from '../constants';

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

  const setFlags = useCallback((flags: RegexFlags) => {
    setOptions(prev => ({ ...prev, flags }));
  }, []);

  const resetFlags = useCallback(() => {
    setOptions(prev => ({ ...prev, flags: { ...DEFAULT_FLAGS } }));
  }, []);

  const setPattern = useCallback((pattern: string) => {
    setOptions(prev => ({ ...prev, pattern }));
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
    setFlags,
    resetFlags,
    setPattern,
    clearAll,
  };
}
