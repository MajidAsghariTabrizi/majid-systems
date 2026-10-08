export const SITE = {
  name: 'Majid Asghari',
  shortName: 'Majid',
  tagline: 'Product strategist. Systems builder. AI engineer.',
  description:
    'Personal engineering portfolio of Majid Asghari — production-grade systems, decision infrastructure, and AI engineering.',
  domain: 'quantiviq.xyz',
  canonicalUrl: 'https://quantiviq.xyz',
  email: 'majid@quantiviq.xyz',
  githubUser: 'MajidAsghariTabrizi',
  githubUrl: 'https://github.com/MajidAsghariTabrizi',
  linkedinUrl: 'https://www.linkedin.com/in/majid-asghari',
  twitterHandle: '',
  location: 'Iran',
  establishedYear: 2020,
  lastUpdated: '2026-10-06',
  ogImage: '/og-image.svg',
} as const;

export const BRAND = {
  wordmark: 'QUANTIVIQ',
  title: 'Quantiviq — Rebuild the Company for the Agentic Era',
  description:
    'AI-native organization design: structure, workflows, agents, decision systems and a persistent company brain engineered as one operating model.',
  ogImage: '/og-quantiviq.svg',
} as const;

/** Commercial navigation — shown on the root page (anchors into the page). */
export const ROOT_NAV = [
  { label: 'Operating Model', href: '#operating-model' },
  { label: 'Company Brain', href: '#company-brain' },
  { label: 'Method', href: '#method' },
  { label: 'Proof', href: '#proof' },
  { label: 'Journey', href: '/journey' },
  { label: 'About', href: '/about' },
] as const;

export const ROOT_NAV_CTA = { label: 'Rebuild a Function →', href: '#method' } as const;

/** Builder navigation — shown on /profile and deep routes. */
export const NAV = [
  { label: 'Work', href: '/work' },
  { label: 'Engineering', href: '/engineering' },
  { label: 'Notes', href: '/notes' },
  { label: 'Open Source', href: '/open-source' },
  { label: 'Journey', href: '/journey' },
  { label: 'About', href: '/about' },
] as const;

export const BUILDER_LINK = { label: 'Builder Profile', href: '/profile' } as const;
