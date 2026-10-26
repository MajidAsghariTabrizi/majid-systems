import booksFileJson from '../../../content/knowledge/books.json';
import ossFileJson from '../../../content/knowledge/oss.json';
import flowsFileJson from '../../../content/knowledge/flows.json';
import conceptsFileJson from '../../../content/knowledge/concepts.json';
import sourcesFileJson from '../../../content/knowledge/sources.json';
import coverReceiptsJson from '../../../content/knowledge/cover-receipts.json';

/* ============================================================================
 * Quantiviq knowledge layer — books, OSS stack atlas, org flows, concepts.
 * Git-versioned JSON under content/knowledge/ (mission §9: auditable page data
 * in MD/JSON; the mind corpus build reads the same files → one source of truth).
 * Static JSON imports keep this module client-safe (no node:fs).
 * ========================================================================== */

export type Locale = 'en' | 'fa';
type Bi = { en: string; fa: string };

/* ------------------------------------------------------------------ books */

export type BookDomain = 'strategy' | 'leadership' | 'economics' | 'human-collaboration' | 'engineering' | 'governance';

export interface Book {
  id: string;
  slug: string;
  num: string;
  isbn13: string;
  edition: string;
  year: number;
  publisher: string;
  authors: string[];
  officialSourceUrl: string;
  title: Bi;
  brief: Bi;
  takeaway: Bi;
  domains: BookDomain[];
  sourceStatus: 'catalog-only' | 'owner-synthesis' | 'full-text-authorized';
  skillStatus: { state: string; note: string };
  mindConcepts: string[];
  relatedFlow: string;
  relatedRepos: string[];
  questions: { en: string[]; fa: string[] };
}

interface BooksFile {
  books: Book[];
  coverPolicy: { primaryPattern: string; creditPattern: string; credit: Bi; fallback: string };
}

const booksFile = booksFileJson as unknown as BooksFile;

export const BOOKS: Book[] = booksFile.books;
export const BOOK_BY_SLUG: Record<string, Book> = Object.fromEntries(BOOKS.map((b) => [b.slug, b]));
export const COVER_POLICY = booksFile.coverPolicy;

export function coverUrl(isbn13: string, size: 'M' | 'L' = 'L'): string {
  return COVER_POLICY.primaryPattern.replace('{isbn13}', isbn13).replace('-L.jpg', `-${size}.jpg`);
}
export function coverCreditUrl(isbn13: string): string {
  return COVER_POLICY.creditPattern.replace('{isbn13}', isbn13);
}

/** Measured cover availability (scripts/sb-verify-books.mjs receipts).
 *  ISBNs with no Open Library cover render the designed text card directly —
 *  no 404 request is ever issued for them. Re-run the script to refresh. */
export const COVER_VERIFIED: Record<string, boolean> = Object.fromEntries(
  ((coverReceiptsJson as unknown as { receipts: { isbn13: string; cover: { status: number } }[] }).receipts ?? []).map(
    (r) => [r.isbn13, r.cover?.status === 200],
  ),
);

export const BOOK_DOMAIN_LABELS: Record<BookDomain, Bi> = {
  strategy: { en: 'Strategy', fa: 'استراتژی' },
  leadership: { en: 'Leadership', fa: 'رهبری' },
  economics: { en: 'Economics', fa: 'اقتصاد' },
  'human-collaboration': { en: 'Human Collaboration', fa: 'همکاری انسان و ماشین' },
  engineering: { en: 'Engineering', fa: 'مهندسی' },
  governance: { en: 'Governance', fa: 'حاکمیت' },
};

export const SOURCE_STATUS_LABELS: Record<Book['sourceStatus'], Bi> = {
  'catalog-only': { en: 'Catalog record — full text not ingested', fa: 'رکورد کتاب‌شناختی — متن کامل دریافت نشده است' },
  'owner-synthesis': { en: 'Owner synthesis', fa: 'تلفیق مالک' },
  'full-text-authorized': { en: 'Full text authorized', fa: 'متن کامل با مجوز' },
};

export function bookPath(b: Book, locale: Locale = 'en'): string {
  return `/${locale}/insights/books/${b.slug}`;
}

/* -------------------------------------------------------------------- oss */

export interface OssLayer {
  id: string;
  key: string;
  order: number;
  name: Bi;
  githubUrl: string;
  license: { label: string; note: string; boundaryUrl?: string; cncfUrl?: string };
  brief: Bi;
  inputs: Bi;
  outputs: Bi;
  guard: Bi;
  whenNot: Bi;
  mindConcepts: string[];
  relatedBooks: string[];
}

export interface OssFile {
  verifiedAt: string;
  status: string;
  intro: Bi;
  combinedStory: { question: Bi; steps: Bi[] };
  layers: OssLayer[];
}

export const OSS: OssFile = ossFileJson as unknown as OssFile;
export const OSS_BY_ID: Record<string, OssLayer> = Object.fromEntries(OSS.layers.map((l) => [l.id, l]));

/* ------------------------------------------------------------------ flows */

export type FlowDomain = 'business' | 'product' | 'technology' | 'data' | 'operations' | 'governance';

export interface OrgFlow {
  id: string;
  domain: FlowDomain;
  order: number;
  version: string;
  approvedStatus: string;
  publicSafe: boolean;
  name: Bi;
  inputTrigger: Bi;
  actors: Bi;
  accountableOwner: Bi;
  decisionRights: Bi;
  policies: Bi;
  prerequisites: Bi;
  evidenceSources: Bi;
  steps: Bi;
  dataAssets: Bi;
  tools: Bi;
  metrics: Bi;
  outcomes: Bi;
  humanGates: Bi;
  failureModes: Bi;
  rollback: Bi;
  observability: Bi;
  lessons: Bi;
  relatedBooks: string[];
  relatedRepos: string[];
}

export const FLOWS: OrgFlow[] = (flowsFileJson as unknown as { flows: OrgFlow[] }).flows;
export const FLOW_BY_ID: Record<string, OrgFlow> = Object.fromEntries(FLOWS.map((f) => [f.id, f]));

export const FLOW_DOMAIN_LABELS: Record<FlowDomain, Bi> = {
  business: { en: 'Business', fa: 'کسب‌وکار' },
  product: { en: 'Product', fa: 'محصول' },
  technology: { en: 'Technology', fa: 'فناوری' },
  data: { en: 'Data', fa: 'داده' },
  operations: { en: 'Operations', fa: 'عملیات' },
  governance: { en: 'Governance', fa: 'حاکمیت' },
};

/** The flow contract, in display order, for the atlas UI. */
export const FLOW_CONTRACT_FIELDS: { key: keyof OrgFlow; label: Bi }[] = [
  { key: 'inputTrigger', label: { en: 'Input trigger', fa: 'محرّک ورودی' } },
  { key: 'actors', label: { en: 'Actors', fa: 'بازیگران' } },
  { key: 'accountableOwner', label: { en: 'Accountable owner', fa: 'مالک پاسخگو' } },
  { key: 'decisionRights', label: { en: 'Decision rights', fa: 'حقوق تصمیم' } },
  { key: 'policies', label: { en: 'Applicable policies', fa: 'سیاست‌های مرتبط' } },
  { key: 'prerequisites', label: { en: 'Prerequisites', fa: 'پیش‌نیازها' } },
  { key: 'evidenceSources', label: { en: 'Evidence sources', fa: 'منابع شواهد' } },
  { key: 'steps', label: { en: 'Steps', fa: 'مراحل' } },
  { key: 'dataAssets', label: { en: 'Data assets', fa: 'دارایی‌های داده' } },
  { key: 'tools', label: { en: 'Tools', fa: 'ابزارها' } },
  { key: 'metrics', label: { en: 'Metric definitions', fa: 'تعریف متریک‌ها' } },
  { key: 'outcomes', label: { en: 'Expected outcomes', fa: 'پیامدهای مورد انتظار' } },
  { key: 'humanGates', label: { en: 'Human gates', fa: 'دروازه‌های انسانی' } },
  { key: 'failureModes', label: { en: 'Failure modes', fa: 'حالت‌های شکست' } },
  { key: 'rollback', label: { en: 'Rollback', fa: 'بازگشت' } },
  { key: 'observability', label: { en: 'Observability', fa: 'مشاهده‌پذیری' } },
  { key: 'lessons', label: { en: 'Lessons', fa: 'درس‌ها' } },
];

/* -------------------------------------------------------------- concepts */

export interface Concept {
  id: string;
  name: Bi;
  body: Bi;
  relatedBooks: string[];
  relatedRepos: string[];
}

export const CONCEPTS: Concept[] = (conceptsFileJson as unknown as { concepts: Concept[] }).concepts;
export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));

/* --------------------------------------------------------------- sources */

export interface KnowledgeSource {
  source_id: string;
  kind: string;
  title: string;
  url: string;
  supports: string[];
  note: string;
}

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = (sourcesFileJson as unknown as { sources: KnowledgeSource[] }).sources;

/* ---------------------------------------------------------------- helpers */

export function bi(v: Bi | undefined, locale: Locale): string {
  return v ? v[locale] || v.en : '';
}

/** Mind deep-link: ask a grounded question about an object. */
export function askMindLink(locale: Locale, q: string, book?: string): string {
  const params = new URLSearchParams({ q });
  if (book) params.set('book', book);
  return `/${locale}/mind?${params.toString()}`;
}
