import { useState, useCallback } from 'react';
import { CssMinifierOptions, CssMinifierResult, CssMinifierStats } from '../types';
import { minifyCss, beautifyCss, calculateStats } from '../lib/css-minifier-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useCssMinifier() {
  const [options, setOptions] = useState<CssMinifierOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<CssMinifierResult | null>(null);
  const [stats, setStats] = useState<CssMinifierStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const minify = useCallback(() => {
    if (!options.css.trim()) {
      setResult(null);
      setStats(null);
      return;
    }

    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const minified = minifyCss(options.css);
      const executionTime = performance.now() - startTime;

      setResult({
        output: minified,
        originalSize: options.css.length,
        resultSize: minified.length,
        executionTime,
      });
      setStats(calculateStats(options.css, minified));
    } catch (error) {
      setResult({
        output: options.css,
        originalSize: options.css.length,
        resultSize: options.css.length,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Minification failed',
      });
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options.css]);

  const beautify = useCallback(() => {
    if (!options.css.trim()) {
      setResult(null);
      setStats(null);
      return;
    }

    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const beautified = beautifyCss(options.css, options.indentSize);
      const executionTime = performance.now() - startTime;

      setResult({
        output: beautified,
        originalSize: options.css.length,
        resultSize: beautified.length,
        executionTime,
      });
      setStats(calculateStats(options.css, beautified));
    } catch (error) {
      setResult({
        output: options.css,
        originalSize: options.css.length,
        resultSize: options.css.length,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Beautification failed',
      });
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options.css, options.indentSize]);

  const updateOption = <K extends keyof CssMinifierOptions>(key: K, value: CssMinifierOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const reset = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setResult(null);
    setStats(null);
  }, []);

  const loadSample = useCallback((sample: string) => {
    setOptions(prev => ({ ...prev, css: sample }));
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
