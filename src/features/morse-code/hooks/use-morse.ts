import { useState, useCallback } from 'react';
import { MorseOptions, MorseResult, MorseMode } from '../types';
import { processMorse } from '../lib/morse-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useMorse() {
  const [options, setOptions] = useState<MorseOptions>({
    mode: DEFAULT_OPTIONS.mode,
    input: DEFAULT_OPTIONS.input,
  });

  const [result, setResult] = useState<MorseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const process = useCallback(() => {
    if (!options.input.trim()) {
      setResult(null);
      return;
    }

    setIsProcessing(true);
    try {
      const res = processMorse(options);
      setResult(res);
    } catch (error) {
      console.error('Morse processing failed', error);
      setResult({
        output: '',
        mode: options.mode,
        inputLength: options.input.length,
        outputLength: 0,
        executionTime: 0,
        error: 'Processing failed',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const updateOption = useCallback(<K extends keyof MorseOptions>(key: K, value: MorseOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const swapInputOutput = useCallback(() => {
    if (result?.output && !result.error) {
      const newMode: MorseMode = options.mode === 'encode' ? 'decode' : 'encode';
      setOptions({
        mode: newMode,
        input: result.output,
      });
      setResult(null);
    }
  }, [options.mode, result]);

  const clear = useCallback(() => {
    setOptions({
      mode: options.mode,
      input: '',
    });
    setResult(null);
  }, [options.mode]);

  return {
    options,
    result,
    isProcessing,
    updateOption,
    process,
    swapInputOutput,
    clear,
  };
}
