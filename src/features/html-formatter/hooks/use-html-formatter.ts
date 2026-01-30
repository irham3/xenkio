import { useState, useEffect, useCallback, useRef } from 'react';
import { HtmlFormatterOptions, HtmlFormatterResult, FormatStats } from '../types';
import { formatHtml, minifyHtml, calculateStats, isValidHtml } from '../lib/html-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useHtmlFormatter() {
  const [options, setOptions] = useState<HtmlFormatterOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<HtmlFormatterResult | null>(null);
  const [stats, setStats] = useState<FormatStats | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Ref to track current request and prevent race conditions
  const currentReqId = useRef(0);

  const format = useCallback(() => {
    if (!options.html.trim()) {
      setResult(null);
      setStats(null);
      setValidationError(null);
      return;
    }

    const reqId = ++currentReqId.current;
    setIsFormatting(true);

    // Validate HTML first
    const validation = isValidHtml(options.html);
    if (!validation.valid) {
      setValidationError(validation.error ?? 'Invalid HTML');
    } else {
      setValidationError(null);
    }

    try {
      const res = formatHtml(options);

      if (reqId === currentReqId.current) {
        setResult(res);
        if (!res.error) {
          setStats(calculateStats(options.html, res.formatted));
        }
      }
    } catch (error) {
      console.error('HTML formatting failed', error);
      if (reqId === currentReqId.current) {
        setResult({
          formatted: options.html,
          originalSize: options.html.length,
          formattedSize: options.html.length,
          executionTime: 0,
          error: 'Formatting failed',
        });
        setStats(null);
      }
    } finally {
      if (reqId === currentReqId.current) {
        setIsFormatting(false);
      }
    }
  }, [options]);

  const updateOption = <K extends keyof HtmlFormatterOptions>(key: K, value: HtmlFormatterOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const minify = useCallback(() => {
    if (!options.html.trim()) return;

    const minified = minifyHtml(options.html);
    setResult({
      formatted: minified,
      originalSize: options.html.length,
      formattedSize: minified.length,
      executionTime: 0,
    });
    setStats(calculateStats(options.html, minified));
  }, [options.html]);

  const reset = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setResult(null);
    setStats(null);
    setValidationError(null);
  }, []);

  const loadSample = useCallback((sample: string) => {
    setOptions(prev => ({ ...prev, html: sample }));
  }, []);

  return {
    options,
    result,
    stats,
    isFormatting,
    validationError,
    updateOption,
    format,
    minify,
    reset,
    loadSample,
  };
}
