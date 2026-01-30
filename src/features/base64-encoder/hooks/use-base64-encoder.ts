import { useState, useCallback, useEffect, useRef } from 'react';
import { Base64Options, Base64Result, Base64Mode } from '../types';
import { processBase64 } from '../lib/base64-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useBase64Encoder() {
  const [options, setOptions] = useState<Base64Options>({
    mode: DEFAULT_OPTIONS.mode,
    input: '',
    urlSafe: DEFAULT_OPTIONS.urlSafe,
  });

  const [result, setResult] = useState<Base64Result | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live processing with debounce
  const processInput = useCallback(() => {
    if (!options.input) {
      setResult(null);
      return;
    }

    const res = processBase64(options);
    setResult(res);
  }, [options]);

  // Auto-process on input change with debounce for better performance
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      processInput();
    }, 100); // Small debounce for live updates

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [processInput]);

  const updateOption = <K extends keyof Base64Options>(key: K, value: Base64Options[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const swapMode = useCallback(() => {
    // When swapping mode, use the current output as the new input
    setOptions(prev => {
      const newMode: Base64Mode = prev.mode === 'encode' ? 'decode' : 'encode';
      const newInput = result?.output || '';
      return {
        ...prev,
        mode: newMode,
        input: newInput,
      };
    });
  }, [result]);

  const clearInput = useCallback(() => {
    setOptions(prev => ({ ...prev, input: '' }));
    setResult(null);
  }, []);

  return {
    options,
    result,
    updateOption,
    swapMode,
    clearInput,
  };
}
