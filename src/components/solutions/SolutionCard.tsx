/** Shared solution card — used by catalog grid and homepage carousel. */
import Link from 'next/link';

import { CATEGORIES, STATUS_LABEL, type SolutionEntry } from '@/content/solutions';
import type { Locale } from '@/content/i18n';
import { qEvent } from '@/lib/analytics';
import { SolutionVisual } from './SolutionVisual';

export function SolutionCard({ s, locale }: { s: SolutionEntry; locale: Locale }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const st = STATUS_LABEL[s.status];
  const cat = s.category;
  const catLabel = CATEGORIES.find((c) => c.key === cat)!.label[l];
  return (
    <article className="sol-card" data-category={cat}>
      <div className="sol-card-top"><span className="sol-cat">{catLabel}</span><SolutionVisual category={cat} locale={locale} variant="card" /></div>
      <h3>
        <Link href={`/${locale}/solutions/${s.id}`} onClick={() => qEvent('solution_view', { solution: s.id, locale })}>{s.title[l]}</Link>
      </h3>
      <p className="sol-one">{s.oneLiner[l]}</p>
      <div className="sol-badges">
        <span className={`sol-badge ${s.status}`}>{st[l]}</span>
      </div>
      <div className="sol-card-actions">
        <Link className="sol-cta-mini" href={`/${locale}/solutions/${s.id}/request`}>
          {locale === 'fa' ? 'ثبت درخواست' : 'Request'}
        </Link>
        <Link className="sol-link" href={`/${locale}/solutions/${s.id}`}>
          {locale === 'fa' ? 'بررسی جزئیات' : 'Explore details'} <span aria-hidden="true">{locale === 'fa' ? '←' : '→'}</span>
        </Link>
      </div>
    </article>
  );
}
