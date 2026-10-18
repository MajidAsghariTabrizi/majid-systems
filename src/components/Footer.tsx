import Link from 'next/link';

import { SITE } from '@/content/shared';
import { dict, localePath, type Locale } from '@/content/i18n';

export function Footer({ locale }: { locale?: Locale }) {
  const year = new Date().getUTCFullYear();
  const t = dict(locale ?? 'en');

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <div style={{ color: 'var(--fg)', fontWeight: 500 }}>QUANTIVIQ</div>
          <div style={{ marginTop: '0.3rem' }}>
            {locale ? t.footer.tagline : `${SITE.tagline} · ${SITE.location}`}
          </div>
        </div>
        {locale ? (
          <ul>
            <li><Link href={localePath(locale, '/services')}>{t.nav.services}</Link></li>
            <li><Link href={localePath(locale, '/system')}>{t.nav.system}</Link></li>
            <li><Link href={localePath(locale, '/method')}>{t.nav.method}</Link></li>
            <li><Link href={localePath(locale, '/proof')}>{t.nav.proof}</Link></li>
            <li><Link href={localePath(locale, '/privacy')}>{t.meta.privacy.title.split(' — ')[0]}</Link></li>
            <li><Link href="/journey">{t.nav.journey} · EN</Link></li>
            <li><Link href="/profile">{t.nav.builder} · EN</Link></li>
          </ul>
        ) : (
          <ul>
            <li><Link href="/en">Quantiviq</Link></li>
            <li><Link href="/profile">Builder Profile</Link></li>
            <li><Link href="/work">Work</Link></li>
            <li><Link href="/notes">Notes</Link></li>
            <li><a href={SITE.githubUrl} rel="me noopener" target="_blank">GitHub</a></li>
            <li><a href={SITE.linkedinUrl} rel="me noopener" target="_blank">LinkedIn</a></li>
          </ul>
        )}
        <div>© {year} · {SITE.domain}</div>
      </div>
    </footer>
  );
}
