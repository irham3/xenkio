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
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, level: 'weak', feedback: [] });
  const [history, setHistory] = useState<PasswordHistoryItem[]>([]);

  const generate = useCallback(() => {
    const newPassword = generatePassword(config);
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
  }, [config]);

  // Generate on initial load and when config changes
  useEffect(() => {
    generate();
  }, [generate]);

  const updateConfig = (updates: Partial<PasswordConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
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
