import { useState, useEffect } from 'react';

/**
 * Hook for responsive media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Initial check
    if (media.matches !== matches) {
        setMatches(media.matches);
    }
    
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);


  return matches;
}

// Preset breakpoints matching Tailwind defaults
export function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const is2xl = useMediaQuery('(min-width: 1536px)');

  return { isSm, isMd, isLg, isXl, is2xl };
}
