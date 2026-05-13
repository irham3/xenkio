import { useState, useCallback } from 'react';
import { BinaryOptions, BinaryResult, BinaryMode, BinarySeparator } from '../types';
import { processBinary } from '../lib/binary-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useBinaryConverter() {
  const [options, setOptions] = useState<BinaryOptions>({
    mode: DEFAULT_OPTIONS.mode,
    input: DEFAULT_OPTIONS.input,
    separator: DEFAULT_OPTIONS.separator,
  });

  const [result, setResult] = useState<BinaryResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const process = useCallback(() => {
    if (!options.input.trim()) {
      setResult(null);
      return;
    }

    setIsProcessing(true);
    try {
      const res = processBinary(options);
      setResult(res);
    } catch (error) {
      console.error('Binary conversion failed', error);
      setResult({
        output: '',
        mode: options.mode,
        inputLength: options.input.length,
        outputLength: 0,
        charCount: 0,
        executionTime: 0,
        error: 'Conversion failed',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const updateOption = useCallback(
    <K extends keyof BinaryOptions>(key: K, value: BinaryOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const swapInputOutput = useCallback(() => {
    if (result?.output && !result.error) {
      const newMode: BinaryMode = options.mode === 'encode' ? 'decode' : 'encode';
      setOptions((prev) => ({
        ...prev,
        mode: newMode,
        input: result.output,
      }));
      setResult(null);
    }
  }, [options.mode, result]);

  const setSeparator = useCallback((sep: BinarySeparator) => {
    setOptions((prev) => ({ ...prev, separator: sep }));
    setResult(null);
  }, []);

  const clear = useCallback(() => {
    setOptions((prev) => ({ ...prev, input: '' }));
    setResult(null);
  }, []);

  return {
    options,
    result,
    isProcessing,
    updateOption,
    process,
    swapInputOutput,
    setSeparator,
    clear,
  };
}
