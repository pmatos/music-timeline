import { useState, useEffect } from 'react';

export type Orientation = 'landscape' | 'portrait';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === 'undefined') return 'landscape';
    return window.matchMedia('(min-aspect-ratio: 1/1)').matches
      ? 'landscape'
      : 'portrait';
  });

  useEffect(() => {
    const mql = window.matchMedia('(min-aspect-ratio: 1/1)');
    const handler = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'landscape' : 'portrait');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return orientation;
}
