import { en } from './en';
import { fa } from './fa';

export const LOCALES = ['en', 'fa'] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

export type Dict = typeof en;

/** Route helper: /{locale}{path} */
export function localePath(locale: Locale, path = ''): string {
  return `/${locale}${path}`;
}

export function dict(locale: Locale): Dict {
  return locale === 'fa' ? (fa as unknown as Dict) : en;
}

export const DEFAULT_LOCALE: Locale = 'en';
