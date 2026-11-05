import Link from 'next/link';

import { SITE } from '@/content/shared';
import { dict, localePath, type Locale } from '@/content/i18n';
import styles from './Footer.module.css';

type FooterLink = { label: string; href: string; english?: boolean; external?: boolean };
type FooterGroup = { title: string; links: FooterLink[] };

export function Footer({ locale }: { locale?: Locale }) {
  const year = new Date().getUTCFullYear();
  const t = dict(locale ?? 'en');
  const fa = locale === 'fa';
  const lp = (path: string) => localePath(locale ?? 'en', path);
  const groups: FooterGroup[] = locale ? [
    {
      title: fa ? 'برای تیم شما' : 'For your team',
      links: [
        { href: lp('/solutions/find'), label: fa ? 'راهکار مناسب را پیدا کنید' : 'Find your solution' },
        { href: lp('/solutions'), label: fa ? 'همهٔ راهکارها' : 'All solutions' },
        { href: lp('/services'), label: t.nav.services },
        { href: lp('/method'), label: t.nav.method },
        { href: lp('/contact'), label: fa ? 'دربارهٔ مسئله‌تان صحبت کنیم' : 'Discuss your challenge' },
      ],
    },
    {
      title: fa ? 'ایده‌ها و شواهد' : 'Ideas & evidence',
      links: [
        { href: lp('/mind'), label: fa ? 'از دستیار هوش مصنوعی بپرسید' : 'Ask Quantiviq Mind' },
        { href: lp('/proof'), label: t.nav.proof },
        { href: lp('/system'), label: t.nav.system },
        { href: lp('/insights'), label: t.nav.insights },
        { href: lp('/insights/books'), label: t.nav2.library },
      ],
    },
    {
      title: fa ? 'مسیر و پروژه‌ها' : 'Background & projects',
      links: [
        { href: '/journey', label: t.nav.journey, english: true },
        { href: '/profile', label: t.nav.builder, english: true },
        { href: '/work', label: fa ? 'پروژه‌ها' : 'Work', english: true },
        { href: '/notes', label: fa ? 'یادداشت‌ها' : 'Notes', english: true },
      ],
    },
  ] : [
    {
      title: 'Explore Quantiviq',
      links: [
        { href: '/en', label: 'Quantiviq home' },
        { href: '/en/solutions', label: 'Solutions for your team' },
        { href: '/en/mind', label: 'Ask Quantiviq Mind' },
        { href: '/en/contact', label: 'Start a conversation' },
      ],
    },
    {
      title: 'Work & writing',
      links: [
        { href: '/profile', label: 'Builder profile' },
        { href: '/work', label: 'Work' },
        { href: '/notes', label: 'Notes' },
        { href: '/journey', label: 'The journey' },
      ],
    },
    {
      title: 'Elsewhere',
      links: [
        { href: SITE.githubUrl, label: 'GitHub', external: true },
        { href: SITE.linkedinUrl, label: 'LinkedIn', external: true },
      ],
    },
  ];

  return (
    <footer className={`site-footer ${styles.footer}`}>
      <div className={`site-footer-inner ${styles.inner}`}>
        <div className={styles.identity}>
          <Link className={styles.wordmark} href={locale ? localePath(locale) : '/en'}>QUANTIVIQ</Link>
          <p className={styles.tagline}>{locale ? t.footer.tagline : `${SITE.tagline} · ${SITE.location}`}</p>
          <div className="footer-founder">
            <span className="footer-founder-name">{SITE.fullName} <span aria-hidden="true">·</span> {SITE.fullNameFa}</span>
            <span className="footer-founder-title">{locale ? t.footer.founderTitle : SITE.founderTitle}</span>
            <a href={SITE.linkedinUrl} rel="me noopener" target="_blank">LinkedIn <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <nav className={styles.navigation} aria-label={fa ? 'مسیرهای پیشنهادی و منابع سایت' : 'Next steps and site resources'}>
          {groups.map((group) => (
            <div className={styles.group} key={group.title}>
              <h2 className={styles.heading}>{group.title}</h2>
              <ul className={styles.linkList}>
                {group.links.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="me noopener">{item.label} <span aria-hidden="true">↗</span></a>
                    ) : (
                      <Link href={item.href}>
                        {item.label}
                        {item.english && fa ? <span className={styles.english} lang="en" dir="ltr">EN</span> : null}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              {fa && group.links.some((item) => item.english) ? <p className={styles.note}>{t.footer.englishNote}</p> : null}
            </div>
          ))}
        </nav>
        <div className={styles.bottom}>
          <span>© {year} · {SITE.domain}</span>
          <Link href={lp('/privacy')}>{t.meta.privacy.title.split(' — ')[0]}</Link>
        </div>
      </div>
    </footer>
  );
}
