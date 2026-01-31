import { useState, useCallback } from 'react';
import { Base64Options, Base64Result, Base64Mode } from '../types';
import { processBase64 } from '../lib/base64-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useBase64() {
  const [options, setOptions] = useState<Base64Options>({
    mode: DEFAULT_OPTIONS.mode,
    input: DEFAULT_OPTIONS.input,
  });

  const [result, setResult] = useState<Base64Result | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const process = useCallback(() => {
    if (!options.input) {
      setResult(null);
      return;
    }

    setIsProcessing(true);
    try {
      const res = processBase64(options);
      setResult(res);
    } catch (error) {
      console.error('Base64 processing failed', error);
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
