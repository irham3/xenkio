import { useState, useCallback, useEffect } from 'react';
import { PasswordConfig, PasswordStrength, PasswordHistoryItem } from '../types';
import { generatePassword, calculateStrength } from '../lib/password-utils';

const DEFAULT_CONFIG: PasswordConfig = {
  type: 'random',
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
  // Memorable defaults
  wordCount: 4,
  separator: '-',
  capitalize: true,
};

export function usePasswordGenerator() {
  const [config, setConfig] = useState<PasswordConfig>(DEFAULT_CONFIG);

  // Initialize with empty/default values to prevent hydration mismatch
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, level: 'weak', feedback: [] });
  const [history, setHistory] = useState<PasswordHistoryItem[]>([]);

  // Generate initial password on client-side only
  useEffect(() => {
    // Generate initial password
    // Generate initial password
    // Use setTimeout to avoid synchronous state update warning during effect execution
    setTimeout(() => {
      const pwd = generatePassword(DEFAULT_CONFIG);
      setPassword(pwd);
      setStrength(calculateStrength(pwd));

      // Initial history item
      setHistory([{
        id: crypto.randomUUID(),
        password: pwd,
        generatedAt: Date.now(),
        copied: false
      }]);
    }, 0);
  }, []); // Run once on mount

  const generateWithConfig = useCallback((targetConfig: PasswordConfig) => {
    const newPassword = generatePassword(targetConfig);
    setPassword(newPassword);
    setStrength(calculateStrength(newPassword));

    setHistory(prev => {
      const newItem: PasswordHistoryItem = {
        id: crypto.randomUUID(),
        password: newPassword,
        generatedAt: Date.now(),
        copied: false
      };
      // Keep last 10 passwords
      return [newItem, ...prev].slice(0, 10);
    });
  }, []);

  const generate = useCallback(() => {
    generateWithConfig(config);
  }, [config, generateWithConfig]);

  const updateConfig = (updates: Partial<PasswordConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    generateWithConfig(newConfig);
  };

  return {
    config,
    updateConfig,
    password,
    strength,
    history,
    generate
  };
}
