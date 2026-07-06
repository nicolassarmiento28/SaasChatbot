import { useEffect, useState } from 'react';

const STEP_MS = 35;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTypewriter(text: string): string {
  const [length, setLength] = useState(prefersReducedMotion() ? text.length : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setLength(text.length);
      return;
    }
    setLength(0);
    const interval = setInterval(() => {
      setLength((current) => {
        if (current >= text.length) {
          clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, STEP_MS);
    return () => clearInterval(interval);
  }, [text]);

  return text.slice(0, length);
}
