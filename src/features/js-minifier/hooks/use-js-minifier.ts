import { useState, useCallback } from 'react';
import { JsMinifierOptions, JsMinifierResult, JsMinifierStats } from '../types';
import { minifyJs, beautifyJs, calculateStats } from '../lib/js-minifier-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useJsMinifier() {
  const [options, setOptions] = useState<JsMinifierOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<JsMinifierResult | null>(null);
  const [stats, setStats] = useState<JsMinifierStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const minify = useCallback(() => {
    if (!options.js.trim()) {
      setResult(null);
      setStats(null);
      return;
    }

    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const minified = minifyJs(options.js);
      const executionTime = performance.now() - startTime;

      setResult({
        output: minified,
        originalSize: options.js.length,
        resultSize: minified.length,
        executionTime,
      });
      setStats(calculateStats(options.js, minified));
    } catch (error) {
      setResult({
        output: options.js,
        originalSize: options.js.length,
        resultSize: options.js.length,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Minification failed',
      });
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options.js]);

  const beautify = useCallback(() => {
    if (!options.js.trim()) {
      setResult(null);
      setStats(null);
      return;
    }

    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const beautified = beautifyJs(options.js, options.indentSize);
      const executionTime = performance.now() - startTime;

      setResult({
        output: beautified,
        originalSize: options.js.length,
        resultSize: beautified.length,
        executionTime,
      });
      setStats(calculateStats(options.js, beautified));
    } catch (error) {
      setResult({
        output: options.js,
        originalSize: options.js.length,
        resultSize: options.js.length,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Beautification failed',
      });
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options.js, options.indentSize]);

  const updateOption = <K extends keyof JsMinifierOptions>(key: K, value: JsMinifierOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const reset = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setResult(null);
    setStats(null);
  }, []);

  const loadSample = useCallback((sample: string) => {
    setOptions(prev => ({ ...prev, js: sample }));
  }, []);

  return {
    options,
    result,
    stats,
    isProcessing,
    updateOption,
    minify,
    beautify,
    reset,
    loadSample,
  };
}
