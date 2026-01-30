import { useState, useCallback } from 'react';
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
  
  // Initialize state with generated values to avoid cascading render on mount
  const [initialData] = useState(() => {
    const pwd = generatePassword(DEFAULT_CONFIG);
    return {
      password: pwd,
      strength: calculateStrength(pwd),
      historyItem: {
        id: crypto.randomUUID(),
        password: pwd,
        generatedAt: Date.now(),
        copied: false
      } as PasswordHistoryItem
    };
  });

  const [password, setPassword] = useState(initialData.password);
  const [strength, setStrength] = useState<PasswordStrength>(initialData.strength);
  const [history, setHistory] = useState<PasswordHistoryItem[]>([initialData.historyItem]);
  


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
