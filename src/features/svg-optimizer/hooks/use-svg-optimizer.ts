import { useState, useCallback, useEffect } from 'react';
import { SvgOptimizerOptions, SvgOptimizerResult, SvgOptimizerStats, SvgoPlugin } from '../types';
import { calculateStats } from '../lib/svg-optimizer-utils';
import { DEFAULT_OPTIONS, SVGO_CDN_URL } from '../constants';

declare global {
  interface Window {
    svgo?: {
      optimize: (
        svg: string,
        config: {
          multipass?: boolean;
          plugins?: (string | { name: string; params?: Record<string, unknown> })[];
        }
      ) => { data: string };
    };
  }
}

export function useSvgOptimizer() {
  const [options, setOptions] = useState<SvgOptimizerOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<SvgOptimizerResult | null>(null);
  const [stats, setStats] = useState<SvgOptimizerStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSvgoLoaded, setIsSvgoLoaded] = useState(false);
  const [isSvgoLoading, setIsSvgoLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.svgo) {
      setIsSvgoLoaded(true);
      return;
    }

    const existing = document.getElementById('svgo-cdn-script');
    if (existing) return;

    setIsSvgoLoading(true);
    const script = document.createElement('script');
    script.id = 'svgo-cdn-script';
    script.src = SVGO_CDN_URL;
    script.onload = () => {
      setIsSvgoLoaded(true);
      setIsSvgoLoading(false);
    };
    script.onerror = () => {
      setIsSvgoLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  const optimize = useCallback(() => {
    if (!options.svg.trim() || !window.svgo) return;

    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const enabledPlugins = options.plugins
        .filter((p) => p.enabled)
        .map((p) => p.name);

      const optimized = window.svgo.optimize(options.svg, {
        multipass: options.multipass,
        plugins: enabledPlugins,
      });

      const executionTime = performance.now() - startTime;

      setResult({
        output: optimized.data,
        originalSize: new Blob([options.svg]).size,
        resultSize: new Blob([optimized.data]).size,
        executionTime,
      });
      setStats(calculateStats(options.svg, optimized.data));
    } catch (error) {
      setResult({
        output: '',
        originalSize: new Blob([options.svg]).size,
        resultSize: 0,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Optimization failed',
      });
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const updateSvg = useCallback((svg: string) => {
    setOptions((prev) => ({ ...prev, svg }));
    setResult(null);
    setStats(null);
  }, []);

  const togglePlugin = useCallback((name: string) => {
    setOptions((prev) => ({
      ...prev,
      plugins: prev.plugins.map((p: SvgoPlugin) =>
        p.name === name ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  }, []);

  const enableAllPlugins = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      plugins: prev.plugins.map((p: SvgoPlugin) => ({ ...p, enabled: true })),
    }));
  }, []);

  const disableAllPlugins = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      plugins: prev.plugins.map((p: SvgoPlugin) => ({ ...p, enabled: false })),
    }));
  }, []);

  const toggleMultipass = useCallback(() => {
    setOptions((prev) => ({ ...prev, multipass: !prev.multipass }));
  }, []);

  const reset = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setResult(null);
    setStats(null);
  }, []);

  const loadSample = useCallback((sample: string) => {
    setOptions((prev) => ({ ...prev, svg: sample }));
    setResult(null);
    setStats(null);
  }, []);

  return {
    options,
    result,
    stats,
    isProcessing,
    isSvgoLoaded,
    isSvgoLoading,
    optimize,
    updateSvg,
    togglePlugin,
    enableAllPlugins,
    disableAllPlugins,
    toggleMultipass,
    reset,
    loadSample,
  };
}
