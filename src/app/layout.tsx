import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SITE } from '@/content/shared';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.canonicalUrl),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.githubUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  keywords: [
    'Majid Asghari',
    'Majid',
    'Asghari',
    'quantiviq',
    'Product Lead',
    'Product Engineer',
    'AI Engineer',
    'AI Systems',
    'Engineering Systems',
    'Blockchain Infrastructure',
    'Arbitrum',
    'AI Agents',
    'Model Routing',
    'Open Source',
    'Smart Trader',
    'Phoenix',
    'Free Best Router',
    'Universal Engineering Agent',
    'Aave V3',
    'Atlas',
    'DeepSeek Harness',
  ],
  alternates: {
    canonical: SITE.canonicalUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE.canonicalUrl,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#0a0b0d',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}