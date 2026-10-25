import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { BRAND, SITE } from '@/content/shared';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import '../globals.css';

/**
 * Root layout for the shared deep-content tree (journey, profile, work,
 * notes, engineering, open-source, resume). These pages are locale-neutral
 * builder content in English; the locale switcher links back into /en / /fa.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE.canonicalUrl),
  title: { default: BRAND.title, template: '%s · Quantiviq' },
  description: BRAND.description,
  applicationName: 'Quantiviq',
  authors: [{ name: SITE.name, url: SITE.githubUrl }],
  creator: SITE.name,
  publisher: 'Quantiviq',
  alternates: { canonical: SITE.canonicalUrl },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0a0b0d',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Inter + JetBrains Mono are self-hosted variable fonts via
            @font-face in globals.css (public/fonts/). */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
