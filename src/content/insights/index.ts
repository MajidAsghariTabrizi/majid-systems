import fs from 'node:fs';
import path from 'node:path';
import { marked, type Tokens, type Token } from 'marked';
import matter from 'gray-matter';

/* ============================================================================
 * Quantiviq Insights — file-based content layer
 * ----------------------------------------------------------------------------
 * Articles: content/insights/<id>-<slug>.md  (frontmatter + markdown + inline SVG)
 * Ledger:   content/insights/sources.json, authors.json
 *
 * Everything is read at module load (build-time under SSG; also fine at server
 * start since the repo checkout ships with the deployment). No CMS, no DB.
 * ========================================================================== */

export type ArticleStatus = 'published' | 'draft';

export interface ArticleFrontmatter {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  pillar: PillarId;
  tags: string[];
  author_id: string;
  published_at: string;
  updated_at: string;
  status: ArticleStatus;
  hero_image: string;
  hero_alt: string;
  hero_caption: string;
  seo_title: string;
  seo_description: string;
  primary_term: string;
  secondary_terms: string[];
  source_ids: string[];
  featured: boolean;
  discussion_questions: string[];
  related_article_ids: string[];
}

export interface PillarDef {
  id: PillarId;
  name: string;
  tagline: string;
  description: string;
  order: number;
}

export type PillarId =
  | 'transformation-strategy'
  | 'economics-value'
  | 'ai-native-operations'
  | 'trust-governance'
  | 'applied-industry';

export const PILLARS: PillarDef[] = [
  {
    id: 'transformation-strategy',
    name: 'AI Transformation & Strategy',
    tagline: 'Why tool rollouts are not transformation',
    description:
      'The strategic difference between adopting AI tools and redesigning how the organization creates value, makes decisions and works.',
    order: 1,
  },
  {
    id: 'economics-value',
    name: 'Economics & Business Value',
    tagline: 'From productivity proof to P&L proof',
    description:
      'Measurement, attribution and the real cost structure of enterprise AI — how value is created, tracked and defended.',
    order: 2,
  },
  {
    id: 'ai-native-operations',
    name: 'AI-Native Product & Operating Models',
    tagline: 'Operating models built for humans and agents',
    description:
      'Product delivery, team design, productionization and phased execution when agents are part of the workforce.',
    order: 3,
  },
  {
    id: 'trust-governance',
    name: 'Trust, Safety & Organizational Change',
    tagline: 'Autonomy with accountability',
    description:
      'Human oversight, evaluation, governance and the change management that determines whether adoption actually happens.',
    order: 4,
  },
  {
    id: 'applied-industry',
    name: 'Applied Transformation & Industry',
    tagline: 'Where value shows up first',
    description:
      'Applied analysis for commercial operations, supply chains and end-to-end transformation missions, with worked examples.',
    order: 5,
  },
];

export const PILLAR_BY_ID: Record<string, PillarDef> = Object.fromEntries(PILLARS.map((p) => [p.id, p]));

/* ------------------------------------------------------------------ sources */

export interface SourceRecord {
  source_id: string;
  title: string;
  publisher: string;
  author: string;
  publication_date: string;
  source_url: string;
  accessed_at: string;
  supported_claims: string[];
  methodology_notes: string;
  limitations: string;
  article_ids_using_source?: string[];
}

export interface AuthorRecord {
  author_id: string;
  name: string;
  role: string;
  bio: string;
  url: string;
  type: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'insights');

export const SOURCES: Record<string, SourceRecord> = (() => {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'sources.json'), 'utf8'));
    const map: Record<string, SourceRecord> = {};
    for (const s of raw.sources) map[s.source_id] = s;
    return map;
  } catch {
    return {};
  }
})();

export const AUTHORS: Record<string, AuthorRecord> = (() => {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'authors.json'), 'utf8'));
    const map: Record<string, AuthorRecord> = {};
    for (const a of raw.authors) map[a.author_id] = a;
    return map;
  } catch {
    return {};
  }
})();

/* ---------------------------------------------------------------- rendering */

/** slugify a heading into a stable anchor */
function headingId(text: string, seen: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 64);
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

export interface HeadingEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Render markdown to HTML. Headings get stable anchor ids; a TOC is extracted. */
export function renderMarkdown(md: string): { html: string; headings: HeadingEntry[] } {
  const seen = new Map<string, number>();
  const headings: HeadingEntry[] = [];
  marked.use({
    gfm: true,
    breaks: false,
    renderer: {
      heading(token: Tokens.Heading) {
        const text = inlineText(token.tokens);
        const id = headingId(text, seen);
        const depth = token.depth as 2 | 3;
        if (depth === 2 || depth === 3) headings.push({ id, text, depth });
        const p = (this as { parser?: { parseInline(t: Token[]): string } }).parser;
        const inner = p ? p.parseInline(token.tokens) : text;
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>`;
      },
      link(token: Tokens.Link) {
        const p = (this as { parser?: { parseInline(t: Token[]): string } }).parser;
        const text = p ? p.parseInline(token.tokens) : token.text;
        const title = token.title ? ` title="${token.title}"` : '';
        if (/^https?:\/\//.test(token.href)) {
          return `<a href="${token.href}"${title} target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
        return `<a href="${token.href}"${title}>${text}</a>`;
      },
    },
  });
  const html = marked.parse(md, { async: false }) as string;
  return { html, headings };
}

function inlineText(tokens: Token[] | undefined): string {
  if (!tokens) return '';
  return tokens
    .map((t) => {
      if ('text' in t && typeof t.text === 'string') {
        if (t.type === 'link' || t.type === 'em' || t.type === 'strong') return inlineText((t as Tokens.Link).tokens);
        return t.text;
      }
      if ('tokens' in t && Array.isArray((t as Tokens.Generic).tokens)) return inlineText((t as Tokens.Generic).tokens);
      return '';
    })
    .join('');
}

/** word count of the markdown body (approximate, source-visible words) */
function countWords(md: string): number {
  return md
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter((w) => /[a-zA-Z0-9]/.test(w)).length;
}

export function readingTimeMinutes(words: number): number {
  return Math.max(1, Math.round(words / 230));
}

/* ------------------------------------------------------------------ loader */

export interface Article extends ArticleFrontmatter {
  words: number;
  readingTime: number;
  /** rendered at module load; key = 'en' for now (single-language publication) */
  html: string;
  headings: HeadingEntry[];
}

function loadArticles(): Article[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const articles: Article[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const fm = data as Partial<ArticleFrontmatter>;
    // minimal hard requirements here; full schema validation runs in
    // scripts/insights-validate.mjs and fails CI loudly.
    if (!fm.id || !fm.slug || fm.status !== 'published') continue;
    const { html, headings } = renderMarkdown(content);
    const words = countWords(content);
    articles.push({
      ...(fm as ArticleFrontmatter),
      words,
      readingTime: readingTimeMinutes(words),
      html,
      headings,
    });
  }
  articles.sort((a, b) => (a.published_at < b.published_at ? 1 : a.published_at > b.published_at ? -1 : 0));
  return articles;
}

export const ARTICLES: Article[] = loadArticles();
export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
export const ARTICLE_BY_ID: Record<string, Article> = Object.fromEntries(ARTICLES.map((a) => [a.id, a]));

export function articlesByPillar(pillar: string): Article[] {
  return ARTICLES.filter((a) => a.pillar === pillar);
}

/** references for an article, in the order cited */
export function sourcesFor(article: Article): SourceRecord[] {
  return (article.source_ids ?? []).map((id) => SOURCES[id]).filter(Boolean);
}

export function articlePath(article: Article): string {
  return `/en/insights/${article.slug}`;
}

export function topicPath(pillar: string): string {
  return `/en/insights/topics/${pillar}`;
}

export const INSIGHTS_STATS = {
  articles: ARTICLES.length,
  pillars: PILLARS.length,
  sources: Object.keys(SOURCES).length,
  words: ARTICLES.reduce((n, a) => n + a.words, 0),
};
