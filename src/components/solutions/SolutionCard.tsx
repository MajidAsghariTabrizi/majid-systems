/** Shared solution card — used by catalog grid and homepage carousel. */
import Link from 'next/link';

import { STATUS_LABEL, type SolutionEntry } from '@/content/solutions';
import type { Locale } from '@/content/i18n';
import { qEvent } from '@/lib/analytics';

export function SolutionCard({ s, locale }: { s: SolutionEntry; locale: Locale }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const st = STATUS_LABEL[s.status];
  const cat = s.category;
  const catLabel = { sales: { en: 'Sales', fa: 'فروش' }, finance: { en: 'Finance', fa: 'مالی' }, operations: { en: 'Operations', fa: 'عملیات' }, cx: { en: 'Customer Experience', fa: 'تجربه مشتری' }, enterprise: { en: 'Enterprise AI', fa: 'هوش مصنوعی سازمانی' }, commerce: { en: 'Commerce Intelligence', fa: 'هوش تجاری' } }[cat][l];
  return (
    <article className="sol-card">
      <span className="sol-cat">{catLabel}</span>
      <h3>
        <Link href={`/${locale}/solutions/${s.id}`} onClick={() => qEvent('solution_view', { solution: s.id, locale })}>{s.title[l]}</Link>
      </h3>
      <p className="sol-one">{s.oneLiner[l]}</p>
      <div className="sol-badges">
        <span className={`sol-badge ${s.status}`}>{st[l]}</span>
      </div>
      <div className="sol-card-actions">
        <Link className="sol-cta-mini" href={`/${locale}/solutions/${s.id}/request`}>
          {locale === 'fa' ? 'درخواست این راهکار' : 'Request This Solution'}
        </Link>
        <Link className="sol-link" href={`/${locale}/solutions/${s.id}`}>
          {locale === 'fa' ? 'جزئیات' : 'Details'}
        </Link>
      </div>
    </article>
  );
}
