import type { Metadata } from 'next';

import { SITE } from '@/content/shared';

const OG_LOCALE = { en: 'en_US', fa: 'fa_IR' } as const;

/**
 * Per-page social metadata. Every page must own its og identity: a page that
 * only sets title/description inherits the layout's og:url/title and shares
 * the HOME card instead of its own (audit P0 2026-10-23). Page-level
 * openGraph objects replace layout defaults wholesale, so this helper is the
 * one way every page gets a correct card: own title, own url, own image.
 */
export function socialMeta(opts: {
  title: string;
  description: string;
  /** Canonical path beginning with '/' — e.g. '/en/lab', '/resume'. */
  path: string;
  locale?: 'en' | 'fa';
  image?: string;
  imageAlt?: string;
  /** hreflang map when the page exists in both locales. */
  languages?: Record<string, string>;
  /** og:type — 'website' (default) or 'article' for case studies. */
  type?: 'website' | 'article';
}): Pick<Metadata, 'openGraph' | 'twitter' | 'alternates'> {
  const base = SITE.canonicalUrl;
  const image = opts.image ?? '/og/quantiviq-og.png';
  const alt = opts.imageAlt ?? 'Quantiviq — Rebuild the Company';
  return {
    alternates: {
      canonical: opts.path,
      ...(opts.languages ? { languages: opts.languages } : {}),
    },
    openGraph: {
      type: opts.type ?? 'website',
      locale: opts.locale ? OG_LOCALE[opts.locale] : 'en_US',
      url: `${base}${opts.path}`,
      siteName: 'Quantiviq',
      title: opts.title,
      description: opts.description,
      images: [{ url: image, width: 1200, height: 630, alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
