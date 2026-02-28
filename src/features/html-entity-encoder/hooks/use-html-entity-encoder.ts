import { useState, useCallback } from 'react';
import { HtmlEntityOptions, HtmlEntityResult, HtmlEntityStats } from '../types';
import { encodeHtmlEntities, decodeHtmlEntities, calculateStats } from '../lib/html-entity-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useHtmlEntityEncoder() {
  const [options, setOptions] = useState<HtmlEntityOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<HtmlEntityResult | null>(null);
  const [stats, setStats] = useState<HtmlEntityStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const encode = useCallback(() => {
    if (!options.input.trim()) {
      setResult(null);
      setStats(null);
      return;
    }

    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const encoded = encodeHtmlEntities(options.input);
      const executionTime = performance.now() - startTime;

      setResult({
        output: encoded,
        originalSize: options.input.length,
        resultSize: encoded.length,
        executionTime,
      });
      setStats(calculateStats(options.input, encoded, 'encode'));
    } catch (error) {
      setResult({
        output: options.input,
        originalSize: options.input.length,
        resultSize: options.input.length,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Encoding failed',
      });
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options.input]);

  const decode = useCallback(() => {
    if (!options.input.trim()) {
      setResult(null);
      setStats(null);
      return;
    }

    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const decoded = decodeHtmlEntities(options.input);
      const executionTime = performance.now() - startTime;

      setResult({
        output: decoded,
        originalSize: options.input.length,
        resultSize: decoded.length,
        executionTime,
      });
      setStats(calculateStats(options.input, decoded, 'decode'));
    } catch (error) {
      setResult({
        output: options.input,
        originalSize: options.input.length,
        resultSize: options.input.length,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Decoding failed',
      });
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options.input]);

  const updateInput = useCallback((value: string) => {
    setOptions(prev => ({ ...prev, input: value }));
  }, []);

  const reset = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setResult(null);
    setStats(null);
  }, []);

  const loadSample = useCallback((sample: string) => {
    setOptions(prev => ({ ...prev, input: sample }));
  }, []);

  return {
    options,
    result,
    stats,
    isProcessing,
    updateInput,
    encode,
    decode,
    reset,
    loadSample,
  };
}
