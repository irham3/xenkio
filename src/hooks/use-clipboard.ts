import { useState, useCallback } from 'react';

/**
 * Hook for copying text to clipboard with feedback
 */
export function useClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
      
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setIsCopied(false);
      return false;
    }
  }, [timeout]);

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  return { isCopied, copy, reset };
}
