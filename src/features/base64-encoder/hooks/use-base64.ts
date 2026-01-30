import { useState, useCallback, useMemo } from 'react';
import { Base64Options, Base64Result, Base64Mode } from '../types';
import { processBase64 } from '../lib/base64-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useBase64() {
  const [options, setOptions] = useState<Base64Options>({
    mode: DEFAULT_OPTIONS.mode,
    input: DEFAULT_OPTIONS.input,
  });

  // Compute result synchronously based on options (no useEffect needed)
  const result = useMemo<Base64Result | null>(() => {
    if (!options.input) {
      return null;
    }
    return processBase64(options);
  }, [options]);

  const updateOption = useCallback(<K extends keyof Base64Options>(key: K, value: Base64Options[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const swapInputOutput = useCallback(() => {
    if (result?.output && !result.error) {
      const newMode: Base64Mode = options.mode === 'encode' ? 'decode' : 'encode';
      setOptions({
        mode: newMode,
        input: result.output,
      });
    }
  }, [options.mode, result]);

  const clear = useCallback(() => {
    setOptions({
      mode: options.mode,
      input: '',
    });
  }, [options.mode]);

  return {
    options,
    result,
    updateOption,
    swapInputOutput,
    clear,
  };
}
