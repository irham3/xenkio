import { useState, useCallback, useMemo } from 'react';
import { RegexConfig, RegexFlags, RegexResult, RegexHistoryItem } from '../types';
import { DEFAULT_CONFIG, testRegex, buildFlagsString } from '../lib/regex-utils';

export function useRegexTester() {
  const [config, setConfig] = useState<RegexConfig>(DEFAULT_CONFIG);
  const [testString, setTestString] = useState('');
  const [history, setHistory] = useState<RegexHistoryItem[]>([]);

  const result = useMemo((): RegexResult => {
    return testRegex(config.pattern, config.flags, testString);
  }, [config.pattern, config.flags, testString]);

  const updatePattern = useCallback((pattern: string) => {
    setConfig(prev => ({ ...prev, pattern }));
  }, []);

  const updateFlags = useCallback((updates: Partial<RegexFlags>) => {
    setConfig(prev => ({
      ...prev,
      flags: { ...prev.flags, ...updates },
    }));
  }, []);

  const updateTestString = useCallback((value: string) => {
    setTestString(value);
  }, []);

  const saveToHistory = useCallback(() => {
    if (!config.pattern || !testString) return;

    const historyItem: RegexHistoryItem = {
      id: crypto.randomUUID(),
      pattern: config.pattern,
      flags: buildFlagsString(config.flags),
      testString: testString.substring(0, 100),
      matchCount: result.matches.length,
      createdAt: Date.now(),
    };

    setHistory(prev => [historyItem, ...prev].slice(0, 10));
  }, [config.pattern, config.flags, testString, result.matches.length]);

  const loadFromHistory = useCallback((item: RegexHistoryItem) => {
    const newFlags: RegexFlags = {
      global: item.flags.includes('g'),
      ignoreCase: item.flags.includes('i'),
      multiline: item.flags.includes('m'),
      dotAll: item.flags.includes('s'),
      unicode: item.flags.includes('u'),
      sticky: item.flags.includes('y'),
    };

    setConfig({
      pattern: item.pattern,
      flags: newFlags,
    });
  }, []);

  const clearAll = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setTestString('');
  }, []);

  return {
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
  };
}
