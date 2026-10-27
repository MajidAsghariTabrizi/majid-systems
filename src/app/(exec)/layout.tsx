import type { ReactNode } from 'react';
import './exec.css';

/**
 * Executive Dialogue shell — deliberately separate from both public shells:
 * no Header, no Footer, no floating Mind panel, no public navigation.
 * Own type system (Inter for EN, Estedad for FA), own ivory/ink palette.
 */
export default function ExecLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
