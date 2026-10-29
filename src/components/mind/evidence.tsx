'use client';

/**
 * Shared evidence model for Quantiviq Mind surfaces (2026-10-29).
 * - normalizeSources: deterministic dedupe, no data discarded
 * - MindMarkdown: streaming-safe renderer (paragraphs, emphasis, lists,
 *   links, code fences kept readable while partial)
 * - MindSources: numbered, stable citations - Sources (N) + View all;
 *   full titles preserved and line-clamped, never string-sliced
 * - EvidenceInspector: dialog/sheet with focus return; shows ONLY
 *   metadata actually present (nothing invented)
 */
import { useEffect, useRef, useState } from 'react';
import type { Msg, Source } from './useMindChat';
import type { MindStrings } from './strings';

export type EvidenceSel = { msgId: string; srcId: string } | null;

/** dedupe exact repeats (same id, or identical url+title) while keeping
 *  distinct sections of the same document (different id/url). */
export function normalizeSources(raw: Source[] | undefined): Source[] {
  if (!raw) return [];
  const out: Source[] = [];
  const seen = new Set<string>();
  for (const s of raw) {
    const key = s.id || (s.url + '|' + s.title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

const TYPE_LABELS: Record<string, { en: string; fa: string }> = {
  book: { en: 'Book (library review)', fa: 'کتاب (مرور کتابخانه)' },
  insight: { en: 'Article / insight', fa: 'مقاله / بینش' },
  repo: { en: 'Repository / project', fa: 'مخزن / پروژه' },
  concept: { en: 'Architecture / concept', fa: 'معماری / مفهوم' },
  org_flow: { en: 'Workflow', fa: 'گردش کار' },
  evidence: { en: 'Professional evidence', fa: 'شاهد حرفه‌ای' },
  doc: { en: 'Documentation', fa: 'مستندات' },
};
export function typeLabel(t: string, locale: 'en' | 'fa'): string {
  const l = TYPE_LABELS[t];
  if (l) return locale === 'fa' ? l.fa : l.en;
  return t;
}

/** allowlist for links rendered from model text (same hosts as panel) */
function safeHref(url: string): string | null {
  if (!/^https:\/\/(quantiviq\.xyz|github\.com\/MajidAsghariTabrizi)\//.test(url)) return null;
  return url;
}

/** minimal safe inline rendering: **bold**, `code`, [label](url), bare URLs */
export function renderInline(text: string, keyBase = 'i') {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s<>")\]]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(<strong key={keyBase + k++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('`')) {
      parts.push(
        <code key={keyBase + k++} dir="ltr" className="mind-code">
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith('[')) {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      const href = mm ? safeHref(mm[2]) : null;
      if (mm && href) {
        parts.push(
          <a key={keyBase + k++} href={href} target="_blank" rel="noopener noreferrer">
            {mm[1]}
          </a>
        );
      } else {
        // not a safe link: show the label, drop the raw syntax
        parts.push(mm ? mm[1] : tok);
      }
    } else {
      const href = safeHref(tok);
      parts.push(
        href ? (
          <a key={keyBase + k++} href={href} target="_blank" rel="noopener noreferrer" dir="ltr">
            {tok.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48) + (tok.length > 60 ? '…' : '')}
          </a>
        ) : (
          <span key={keyBase + k++} dir="ltr">{tok}</span>
        )
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderProseBlock(block: string, keyBase: string) {
  const out: React.ReactNode[] = [];
  const lines = block.split('\n');
  let list: { ordered: boolean; items: string[] } | null = null;
  const flushList = (i: number) => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    out.push(
      <Tag key={keyBase + '-l' + i} className="mind-md-list">
        {list.items.map((it, j) => (
          <li key={j}>{renderInline(it, keyBase + '-li' + j)}</li>
        ))}
      </Tag>
    );
    list = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      const item = (ul ?? ol)![1];
      if (!list || list.ordered !== !!ol) {
        flushList(i);
        list = { ordered: !!ol, items: [] };
      }
      list.items.push(item);
      continue;
    }
    flushList(i);
    if (line.trim() === '') continue;
    const strong = line.startsWith('##') || line.startsWith('**');
    out.push(
      <p key={keyBase + '-p' + i} className={strong ? 'mind-p-strong' : undefined}>
        {renderInline(line.replace(/^#{1,3}\s*/, ''), keyBase + '-pi' + i)}
      </p>
    );
  }
  flushList(lines.length);
  return out;
}

/** streaming-safe markdown body: ``` fences split into prose + code
 *  segments. An incomplete trailing fence renders as code (readable)
 *  and stays code at completion - no renderer swap flash. */
export function MindMarkdown({ text }: { text: string }) {
  const segs = text.split('```');
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 0 ? (
          <div key={i}>{renderProseBlock(seg, 's' + i)}</div>
        ) : (
          <pre key={i} className="mind-pre" dir="ltr">
            <code>{seg.replace(/^[a-zA-Z0-9_-]*\n/, '')}</code>
          </pre>
        )
      )}
    </>
  );
}

/** numbered source controls. Compact preview + View all; ALL sources
 *  reachable; numbering stable (position in the normalized list). */
export function MindSources({
  m,
  label,
  viewAll,
  onOpen,
  expanded,
  onToggleExpand,
}: {
  m: Msg;
  label: string;
  viewAll: string;
  onOpen: (msgId: string, srcId: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const srcs = normalizeSources(m.sources);
  if (srcs.length === 0) return null;
  const PREVIEW = 4;
  const visible = expanded ? srcs : srcs.slice(0, PREVIEW);
  return (
    <div className="mind-sources" data-count={srcs.length}>
      <div className="mind-sources-row">
        <span className="mind-sources-label">
          {label} ({srcs.length})
        </span>
        {srcs.length > PREVIEW && (
          <button type="button" className="mind-sources-toggle" aria-expanded={expanded} onClick={onToggleExpand}>
            {viewAll} ({srcs.length})
          </button>
        )}
      </div>
      <ul className={expanded ? 'mind-sources-list is-open' : 'mind-sources-list'}>
        {visible.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="mind-cite"
              onClick={() => onOpen(m.id, s.id)}
              aria-label={s.title}
            >
              <span className="mind-cite-n" aria-hidden>{i + 1}</span>
              <span className="mind-cite-title" dir="auto">{s.title}</span>
              <span className="mind-cite-type" aria-hidden>{s.type}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** evidence inspector: fixed overlay drawer (desktop) / bottom sheet
 *  (mobile). Never resizes the answer column. Escape + focus return. */
export function EvidenceInspector({
  source,
  locale,
  s,
  onClose,
}: {
  source: Source | null;
  locale: 'en' | 'fa';
  s: MindStrings;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!source) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !boxRef.current) return;
      if (!boxRef.current.contains(document.activeElement)) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      (prev ?? document.body)?.focus?.();
    };
  }, [source, onClose]);
  if (!source) return null;
  return (
    <div className="mind-evidence-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={boxRef} className="mind-evidence" role="dialog" aria-modal="true" aria-label={s.evidenceTitle}>
        <div className="mind-evidence-head">
          <span className="eyebrow sig">{s.evidenceTitle}</span>
          <button ref={closeRef} type="button" className="mind-evidence-close" onClick={onClose} aria-label={s.close}>
            ✕
          </button>
        </div>
        <div className="mind-evidence-body">
          <h3 className="mind-evidence-title" dir="auto">{source.title}</h3>
          <p className="mind-evidence-type">{typeLabel(source.type, locale)}</p>
          {source.class && (
            <p className="mind-evidence-class">{source.class}</p>
          )}
          <a className="mind-evidence-open btn btn-primary" href={source.url} target="_blank" rel="noopener noreferrer">
            {s.openSource} <span aria-hidden>→</span>
          </a>
          <p className="mind-evidence-note">{s.evidenceNote}</p>
        </div>
      </div>
    </div>
  );
}

/** one shared message renderer for both surfaces */
export function MindMessage({
  m,
  label,
  viewAll,
  incompleteLabel,
  onOpen,
  expandedSet,
  onToggleExpand,
}: {
  m: Msg;
  label: string;
  viewAll: string;
  incompleteLabel?: string;
  onOpen: (msgId: string, srcId: string) => void;
  expandedSet: Set<string>;
  onToggleExpand: (msgId: string) => void;
}) {
  if (m.role === 'user') {
    return (
      <div className="mind-msg mind-msg-user" dir="auto">
        <div className="mind-bubble">{m.content}</div>
      </div>
    );
  }
  return (
    <div className="mind-msg mind-msg-ai" data-incomplete={m.incomplete ? 'true' : undefined}>
      <div className="mind-bubble" dir="auto">
        {m.content ? <MindMarkdown text={m.content} /> : null}
        {m.incomplete && incompleteLabel && (
          <p className="mind-incomplete" role="status">{incompleteLabel}</p>
        )}
      </div>
      <MindSources
        m={m}
        label={label}
        viewAll={viewAll}
        onOpen={onOpen}
        expanded={expandedSet.has(m.id)}
        onToggleExpand={() => onToggleExpand(m.id)}
      />
    </div>
  );
}