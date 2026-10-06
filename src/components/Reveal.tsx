'use client';

import type { ReactNode } from 'react';

import { useInView, usePrefersReducedMotion } from '@/lib/motion';

/**
 * Scroll-reveal wrapper: children fade/slide in once when they enter the
 * viewport. Under prefers-reduced-motion the children render immediately.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const shown = reduced || inView;
  const Component = Tag as 'div';
  return (
    <Component
      ref={ref}
      className={`reveal ${shown ? 'is-shown' : ''} ${className}`.trim()}
      style={delay && !reduced ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
