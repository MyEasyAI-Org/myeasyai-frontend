/**
 * useMediaQuery Hook
 *
 * Reactive breakpoint detection for responsive layouts.
 * Returns current breakpoint and boolean helpers.
 */

import { useState, useEffect, useCallback } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface MediaQueryResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
}

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
}

export function useMediaQuery(): MediaQueryResult {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getBreakpoint(window.innerWidth);
  });

  const handleResize = useCallback(() => {
    const newBreakpoint = getBreakpoint(window.innerWidth);
    setBreakpoint((prev) => (prev !== newBreakpoint ? newBreakpoint : prev));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    handleResize();

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
  };
}
