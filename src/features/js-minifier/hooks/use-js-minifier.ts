import { useState, useCallback, useRef, useEffect } from 'react';
import { JsMinifierOptions, JsMinifierResult, JsMinifierStats } from '../types';
import { DEFAULT_OPTIONS } from '../constants';
import type { WorkerResponse } from '../workers/js-minifier.worker';

export function useJsMinifier() {
  const [options, setOptions] = useState<JsMinifierOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<JsMinifierResult | null>(null);
  const [stats, setStats] = useState<JsMinifierStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const terminateWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const runWorker = useCallback(
    (message: { type: 'minify'; js: string } | { type: 'beautify'; js: string; indentSize: number }) => {
      if (!message.js.trim()) {
        setResult(null);
        setStats(null);
        return;
      }

      terminateWorker();
      setIsProcessing(true);

      const worker = new Worker(
        new URL('../workers/js-minifier.worker.ts', import.meta.url)
      );
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const data = e.data;
        if (data.type === 'success') {
          setResult({
            output: data.output,
            originalSize: data.originalSize,
            resultSize: data.resultSize,
            executionTime: data.executionTime,
          });
          setStats(data.stats);
        } else {
          setResult({
            output: message.js,
            originalSize: data.originalSize,
            resultSize: data.resultSize,
            executionTime: 0,
            error: data.message,
          });
          setStats(null);
        }
        setIsProcessing(false);
        workerRef.current = null;
      };

      worker.onerror = (err) => {
        setResult({
          output: message.js,
          originalSize: message.js.length,
          resultSize: message.js.length,
          executionTime: 0,
          error: err.message ?? 'Worker error',
        });
        setStats(null);
        setIsProcessing(false);
        workerRef.current = null;
      };

      worker.postMessage(message);
    },
    []
  );

  const minify = useCallback(() => {
    runWorker({ type: 'minify', js: options.js });
  }, [options.js, runWorker]);

  const beautify = useCallback(() => {
    runWorker({ type: 'beautify', js: options.js, indentSize: options.indentSize });
  }, [options.js, options.indentSize, runWorker]);

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

  // Cleanup worker on unmount
  useEffect(() => {
    return () => terminateWorker();
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
