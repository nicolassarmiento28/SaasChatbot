import type { ReactNode } from 'react';
import { useReveal } from './useReveal';

export function Reveal({
  children,
  className = '',
  delayMs,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`lp-reveal ${visible ? 'lp-reveal--visible' : ''} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
