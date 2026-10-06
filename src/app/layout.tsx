import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { BRAND, SITE } from '@/content/shared';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.canonicalUrl),
  title: {
    default: BRAND.title,
    template: '%s · Quantiviq',
  },
  description: BRAND.description,
  applicationName: 'Quantiviq',
  authors: [{ name: SITE.name, url: SITE.githubUrl }],
  creator: SITE.name,
  publisher: 'Quantiviq',
  keywords: [
    'Quantiviq',
    'AI-native organization',
    'organization transformation',
    'company brain',
    'agent runtime',
    'model routing',
    'operating model',
    'AI agents',
    'workflow design',
    'decision systems',
    'Majid Asghari',
    'Phoenix',
    'Free Best Router',
    'Universal Engineering Agent',
    'DeepSeek Harness',
  ],
  alternates: {
    canonical: SITE.canonicalUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE.canonicalUrl,
    siteName: 'Quantiviq',
    title: BRAND.title,
    description: BRAND.description,
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: 'Quantiviq — Rebuild the Company',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.title,
    description: BRAND.description,
    images: [BRAND.ogImage],
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
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