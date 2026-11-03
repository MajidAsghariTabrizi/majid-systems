import type { Locale } from '@/content/i18n';

/** Date display only: preserve ISO values in metadata and <time dateTime>. */
export function formatInsightDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatInsightNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(value);
}
