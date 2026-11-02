/** Editorial bridge: ONE restrained "apply this to your business" panel below
 *  eligible articles. Driven by the central solution↔article registry only. */
import Link from 'next/link';

import { SOLUTION_UI, solutionsForArticle } from '@/content/solutions';
import type { Locale } from '@/content/i18n';

export function ArticleSolutionBridge({ articleId, locale }: { articleId: string; locale: Locale }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const solutions = solutionsForArticle(articleId);
  if (solutions.length === 0) return null;
  const primary = solutions[0];
  return (
    <aside className="sol-bridge" aria-label={SOLUTION_UI.bridgeTitle[l]}>
      <h3>{SOLUTION_UI.bridgeTitle[l]}</h3>
      <p>{SOLUTION_UI.bridgeNote[l]}</p>
      <div className="links">
        <Link className="sol-cta-mini" href={`/${locale}/solutions/${primary.id}`}>
          {primary.title[l]}
        </Link>
        {solutions.length > 1 ? (
          <Link className="sol-link" href={`/${locale}/solutions/${solutions[1].id}`}>
            {solutions[1].title[l]}
          </Link>
        ) : null}
        <Link className="sol-link" href={`/${locale}/solutions`}>
          {l === 'fa' ? 'همه راهکارها' : 'All solutions'}
        </Link>
      </div>
    </aside>
  );
}
