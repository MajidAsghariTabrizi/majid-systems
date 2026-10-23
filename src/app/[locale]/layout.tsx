import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { BRAND, SITE } from '@/content/shared';
import { dict, isLocale, LOCALES, type Locale } from '@/content/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QuantiviqJsonLd } from '@/components/JsonLd';

import '../globals.css';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', fa: 'fa_IR' };

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const l = params.locale;
  const base = SITE.canonicalUrl;
  return {
    metadataBase: new URL(base),
    title: { default: BRAND.title, template: '%s · Quantiviq' },
    description: BRAND.description,
    applicationName: 'Quantiviq',
    authors: [{ name: SITE.name, url: SITE.githubUrl }],
    creator: SITE.name,
    publisher: 'Quantiviq',
    alternates: {
      canonical: `${base}/${l}`,
      languages: {
        en: `${base}/en`,
        fa: `${base}/fa`,
        'x-default': `${base}/en`,
      },
    },
    // Site-level fallback ONLY. Every page must override with socialMeta()
    // so shared links render the page's own card, not this one (audit P0).
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[l],
      url: `${base}/${l}`,
      siteName: 'Quantiviq',
      title: BRAND.title,
      description: BRAND.description,
      images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: 'Quantiviq — Rebuild the Company' }],
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
    icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
    category: 'technology',
  };
}

export const viewport: Viewport = {
  themeColor: '#0a0b0d',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  return (
    <html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <QuantiviqJsonLd />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header locale={locale} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
