import { useState, useCallback, useRef } from 'react';
import { HashOptions, HashResult } from '../types';
import { generateHash } from '../lib/hash-utils';
import { DEFAULT_OPTIONS } from '../constants';

export function useHashGenerator() {
  const [options, setOptions] = useState<HashOptions>({
    algorithm: 'SHA256',
    text: '',
    salt: '',
    cost: DEFAULT_OPTIONS.bcryptCost,
    memory: DEFAULT_OPTIONS.argonMemory,
    iterations: DEFAULT_OPTIONS.argonIterations,
    parallelism: DEFAULT_OPTIONS.argonParallelism,
    hashLength: DEFAULT_OPTIONS.argonHashLength,
  });

  const [result, setResult] = useState<HashResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Ref to track if the current generation request is still valid (avoid race conditions)
  const currentReqId = useRef(0);

  const generate = useCallback(async () => {
    if (!options.text) {
      setResult(null);
      return;
    }

    const reqId = ++currentReqId.current;
    setIsGenerating(true);

    try {
      const res = await generateHash(options);
      
      // Only update if this is the latest request
      if (reqId === currentReqId.current) {
        setResult(res);
      }
    } catch (error) {
      console.error('Hash generation failed', error);
      if (reqId === currentReqId.current) {
         setResult({
             hash: '',
             algorithm: options.algorithm,
             executionTime: 0,
             error: 'Generation failed'
         });
      }
    } finally {
      if (reqId === currentReqId.current) {
        setIsGenerating(false);
      }
    }
  }, [options]);

  const updateOption = <K extends keyof HashOptions>(key: K, value: HashOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return {
    options,
    result,
    isGenerating,
    updateOption,
    generate,
  };
}

