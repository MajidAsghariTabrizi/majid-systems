'use client';

/**
 * Executive Dialogue — unlisted executive surface at /meet-majid.
 * Reuses the Public Mind backend exclusively (POST /api/public-mind/chat,
 * persona: 'executive'); no second intelligence, no local storage of
 * conversations beyond React state. Design: Boardroom Ivory (see
 * docs/quantiviq-executive-dialogue/EXECUTIVE_DESIGN_BENCHMARK.md).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Source = { id: string; title: string; url: string; type: string; class: string; language: string };
type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[] };

const EN = {
  eyebrow: 'Executive Dialogue · Unlisted',
  axes: 'Product Leadership',
  axes2: 'Systems Thinking',
  axes3: 'Applied AI',
  challenge: "Don't just read my résumé. Challenge how I think.",
  sub: 'Explore my work, question my decisions, and examine how I approach complex product, technology, and organizational problems.',
  disclosure: 'An AI-powered representation grounded in verified, approved professional material — not a live conversation with Majid.',
  unlisted: 'Unlisted link — anyone holding it can access this page. No confidential material is present or retrievable here.',
  paths: [
    { kicker: 'Path 01', title: 'Explore My Work', desc: 'Real projects, architectural decisions, contributions, constraints, evidence and lessons.' },
    { kicker: 'Path 02', title: 'Challenge My Thinking', desc: 'Hard executive scenarios — how Majid would likely approach them, documented experience separated from interpretation.' },
    { kicker: 'Path 03', title: 'Discuss AI Transformation', desc: 'Operating models, AI-native organizations, workflow redesign, economics, governance and measurable outcomes.' },
  ],
  starters: {
    work: ['What has Majid actually shipped, and what remains experimental?', 'Walk me through the Phoenix retirement decision — why shut down a working system?', 'What do the four documented projects prove about his engineering judgment?'],
    challenge: ['What would Majid do if an AI agent made an expensive but technically valid decision?', 'How would he prove an AI transformation created economic value rather than cutting headcount?', 'Why should I trust Majid with AI transformation leadership instead of a management consultant?'],
    transform: ['Where does an AI-native organization actually start — tools, structure or decision rights?', 'Which workflows should never be automated, and why?', 'How do you govern agents that act, not just answer?'],
  },
  evidenceTitle: 'Evidence',
  evidenceNote: 'Every answer is grounded in these published sources. Click through to verify.',
  evidenceEmpty: 'Citations for the selected answer appear here.',
  evidenceBtn: 'Evidence',
  composerPlaceholder: 'Ask a hard question…',
  send: 'Send',
  stop: 'Stop',
  retry: 'Retry',
  challengeThis: 'Challenge this answer',
  hintLeft: 'Grounded in verified public material · answers may be interpretation, clearly labeled by the model.',
  limit: (n: number) => n + ' of 24 questions this session',
  errorUnavailable: 'The service is briefly unavailable. Your question was not lost — retry when ready.',
  errorRate: 'Session limit reached. The conversation stays readable; start a new session to continue asking.',
  errorTimeout: 'The answer took too long to arrive. Try again, or rephrase more specifically.',
  errorGeneric: 'Something failed mid-answer. Retry restores your question.',
  back: '← Introduction',
  footLeft: 'Executive Dialogue — AI representation of Majid Asghari Tabrizi',
  footRight: 'Powered by the Quantiviq public mind · not indexed · noarchive',
};
const FA: typeof EN = {
  eyebrow: 'گفت‌وگوی راهبری · فهرست‌نشده',
  axes: 'رهبری محصول',
  axes2: 'تفکر سیستمی',
  axes3: 'هوش مصنوعی کاربردی',
  challenge: 'به رزومه‌ام بسنده نکنید؛ به شیوهٔ فکرکردنم چالش بگذارید.',
  sub: 'کارهایم را بررسی کنید، تصمیم‌هایم را نقد کنید و ببینید با مسائل پیچیدهٔ محصول، فناوری و سازمان چگونه برخورد می‌کنم.',
  disclosure: 'بازنمایی هوش مصنوعی، مبتنی بر مطالب عمومی تأییدشده — این گفت‌وگو با خودِ مجید نیست.',
  unlisted: 'پیوند فهرست‌نشده — هر کسی این پیوند را داشته باشد به صفحه دسترسی دارد. هیچ مادهٔ محرمانه‌ای اینجا وجود ندارد.',
  paths: [
    { kicker: 'مسیر ۰۱', title: 'کارهایم را ببینید', desc: 'پروژه‌های واقعی، تصمیم‌های معماری، محدودیت‌ها، شواهد و درس‌ها.' },
    { kicker: 'مسیر ۰۲', title: 'به تفکرم چالش بگذارید', desc: 'سناریوهای دشوار راهبری — نزدیک‌ترین رویکرد مجید، با تفکیک تجربهٔ مستند از تفسیر.' },
    { kicker: 'مسیر ۰۳', title: 'تحول با هوش مصنوعی', desc: 'مدل‌های عملیاتی، سازمان بومی-هوشمند، بازطراحی جریان کار، اقتصاد، حکمرانی و نتایج قابل‌سنجش.' },
  ],
  starters: {
    work: ['مجید واقعاً چه چیزهایی را به تولید رسانده و چه چیزی هنوز آزمایشی است؟', 'تصمیم بازنشستگی فینیکس را توضیح بده — چرا سیستم کارا را متوقف کرد؟', 'چهار پروژهٔ مستند دربارهٔ قضاوت مهندسی‌اش چه می‌گویند؟'],
    challenge: ['اگر یک عامل هوش مصنوعی تصمیم گران ولی از نظر فنی درستی بگیرد، مجید چه می‌کند؟', 'چگونه اثبات می‌کنید تحول AI ارزش اقتصادی آفریده، نه فقط کاهش نیرو؟', 'چرا به مجید برای رهبری تحول AI اعتماد کنم، نه یک مشاور مدیریتی باتجربه؟'],
    transform: ['سازمان بومی-هوشمند از کجا شروع می‌شود — ابزار، ساختار یا حقوق تصمیم؟', 'کدام جریان‌های کار هرگز نباید خودکار شوند و چرا؟', 'عامل‌هایی که عمل می‌کنند نه فقط پاسخ می‌دهند را چگونه حکمرانی می‌کنید؟'],
  },
  evidenceTitle: 'شواهد',
  evidenceNote: 'هر پاسخ به این منابع عمومی استوار است؛ برای راستی‌آزمایی روی پیوند بزنید.',
  evidenceEmpty: 'استنادهای پاسخ انتخاب‌شده اینجا نمایش داده می‌شود.',
  evidenceBtn: 'شواهد',
  composerPlaceholder: 'پرسش دشواری بپرسید…',
  send: 'ارسال',
  stop: 'توقف',
  retry: 'تلاش دوباره',
  challengeThis: 'به این پاسخ چالش بگذارید',
  hintLeft: 'مبتنی بر مطالب عمومی تأییدشده · پاسخ‌ها ممکن است تفسیر باشند که مدل صریحاً برچسب می‌زند.',
  limit: (n: number) => 'پرسش ' + n + ' از ۲۴ در این نشست',
  errorUnavailable: 'سرویس موقتاً در دسترس نیست. پرسش شما از دست نرفته — دوباره تلاش کنید.',
  errorRate: 'سقف نشست پر شده. گفت‌وگو قابل مطالعه می‌ماند؛ برای ادامهٔ پرسش نشست جدیدی بسازید.',
  errorTimeout: 'پاسخ بیش از حد طول کشید. دوباره تلاش کنید یا پرسش را دقیق‌تر بپرسید.',
  errorGeneric: 'در میانهٔ پاسخ خطایی رخ داد. تلاش دوباره پرسش شما را بازمی‌گرداند.',
  back: '← مقدمه',
  footLeft: 'گفت‌وگوی راهبری — بازنمایی هوش مصنوعی مجید اصغری تبریزی',
  footRight: 'مبتنی بر ذهن عمومی Quantiviq · فهرست‌نشده · بدون آرشیو',
};

const LIMIT = 24;
function sid(): string {
  if (typeof window === 'undefined') return 'server';
  let s = sessionStorage.getItem('exec-session');
  if (!s) {
    s = 'ex' + (crypto.randomUUID?.() ?? String(Date.now()) + String(Math.random())).replace(/-/g, '').slice(0, 32);
    sessionStorage.setItem('exec-session', s);
  }
  return s;
}

type Mode = 'work' | 'challenge' | 'transform';

export function ExecutiveDialogue() {
  const [locale, setLocale] = useState<'en' | 'fa'>('en');
  const t = locale === 'fa' ? FA : EN;
  const rtl = locale === 'fa';
  const [stage, setStage] = useState<'intro' | 'chat'>('intro');
  const [mode, setMode] = useState<Mode>('challenge');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(0);
  const [error, setError] = useState('');
  const [retryQ, setRetryQ] = useState('');
  const [evOpen, setEvOpen] = useState(false);
  const [evMsg, setEvMsg] = useState<number>(-1);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [locale, rtl]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const suggestions = useMemo(() => t.starters[mode], [t, mode]);

  const fail = useCallback((msg: string, q: string, retryable: boolean) => {
    setError(msg);
    setRetryQ(retryable ? q : '');
    setAsked((n) => Math.max(0, n - 1));
    setMessages((ms) => (ms.at(-1)?.role === 'assistant' && ms.at(-1)?.content === '' ? ms.slice(0, -1) : ms));
  }, []);

  const send = useCallback(async (text: string) => {
    const q = text.trim().slice(0, 2000);
    if (!q || busy) return;
    if (asked >= LIMIT) { setError(t.errorRate); setRetryQ(''); return; }
    setError(''); setRetryQ(''); setAsked((n) => n + 1); setEvMsg(-1);
    const history = [...messages, { role: 'user' as const, content: q }];
    setMessages([...history, { role: 'assistant', content: '', sources: [] }]);
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    let streamFailed = false;
    try {
      const res = await fetch('/api/public-mind/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sid(), locale, persona: 'executive', messages: history.map((m) => ({ role: m.role, content: m.content })) }),
        signal: ac.signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        fail(res.status === 429 ? t.errorRate : t.errorUnavailable, q, true);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) { fail(t.errorUnavailable, q, true); return; }
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          let evName = '', evData = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) evName = line.slice(7).trim();
            else if (line.startsWith('data: ')) evData += line.slice(6);
          }
          if (!evData) continue;
          let ev: any;
          try { ev = JSON.parse(evData); } catch { continue; }
          if (evName === 'sources') {
            const srcs = (ev.sources ?? []) as Source[];
            setMessages((ms) => { const c = [...ms]; c[c.length - 1] = { ...c[c.length - 1], sources: srcs }; return c; });
            setEvMsg(history.length); setEvOpen(true);
          } else if (evName === 'delta' && typeof ev.text === 'string') {
            setMessages((ms) => { const c = [...ms]; c[c.length - 1] = { ...c[c.length - 1], content: c[c.length - 1].content + ev.text }; return c; });
          } else if (evName === 'done') {
            if (ev.status !== 'ok' && ev.status !== 'mock') streamFailed = true;
          }
        }
      }
      if (streamFailed) fail(t.errorGeneric, q, true);
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setMessages((ms) => { const c = [...ms]; if (c.at(-1)?.role === 'assistant' && c.at(-1)?.content === '') return c.slice(0, -1); return c; });
        setAsked((n) => Math.max(0, n - 1));
      } else if (String(e?.message ?? '').includes('timeout') || String(e?.cause ?? '').includes('TIMEOUT')) {
        fail(t.errorTimeout, q, true);
      } else {
        fail(t.errorUnavailable, q, true);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [busy, messages, asked, locale, t, fail]);

  const enter = (m: Mode) => { setMode(m); setStage('chat'); setMessages([]); setAsked(0); setError(''); setRetryQ(''); setEvMsg(-1); };
  const back = () => { setStage('intro'); setMessages([]); setAsked(0); setError(''); setRetryQ(''); setEvOpen(false); };

  const evidence = evMsg >= 0 ? messages[evMsg]?.sources ?? [] : [];

  return (
    <div className={'ex-root' + (rtl ? ' ex-rtl' : '')}>
      <header className="ex-top">
        <div className="ex-brand">Executive <b>Dialogue</b></div>
        <div className="ex-locale-toggle" role="group" aria-label="Language">
          <button aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
          <button aria-pressed={locale === 'fa'} onClick={() => setLocale('fa')}>فا</button>
        </div>
      </header>

      {stage === 'intro' ? (
        <main className="ex-hero" id="main">
          <p className="ex-eyebrow">{t.eyebrow}</p>
          <h1 className="ex-name">MAJID ASGHARI TABRIZI</h1>
          <p className="ex-axes">{t.axes}<span className="ex-sep">×</span>{t.axes2}<span className="ex-sep">×</span>{t.axes3}</p>
          <h2 className="ex-challenge">“{t.challenge}”</h2>
          <p className="ex-sub">{t.sub}</p>
          <p className="ex-disclosure">{t.disclosure}<br /><span>{t.unlisted}</span></p>
          <ul className="ex-paths">
            {t.paths.map((p, i) => (
              <li key={p.title}>
                <button className="ex-path" onClick={() => enter((['work', 'challenge', 'transform'] as Mode[])[i])}>
                  <span className="ex-path-kicker">{p.kicker}</span>
                  <span className="ex-path-title">{p.title}</span>
                  <p className="ex-path-desc">{p.desc}</p>
                  <span className="ex-path-go">→<span className="ex-arrow" aria-hidden /></span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      ) : (
        <main className="ex-chat" id="main">
          <section className="ex-thread" ref={threadRef} aria-live="polite">
            <button className="ex-drawer-toggle ex-back-btn" onClick={back}>{t.back}</button>
            <div style={{ marginBottom: 18 }}>
              <span className="ex-eyebrow" style={{ margin: 0 }}>{t.paths[{ work: 0, challenge: 1, transform: 2 }[mode]].kicker} · {t.paths[{ work: 0, challenge: 1, transform: 2 }[mode]].title}</span>
            </div>
            {messages.length === 0 && (
              <div className="ex-suggestions">
                {suggestions.map((s) => (
                  <button key={s} className="ex-suggest" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div className={'ex-msg ' + (m.role === 'user' ? 'ex-q' : 'ex-a' + (busy && i === messages.length - 1 ? ' ex-streaming' : ''))} key={i}>
                {m.content || (busy && i === messages.length - 1 ? '' : '…')}
                {m.role === 'assistant' && m.content && (m.sources?.length ?? 0) > 0 && (
                  <div className="ex-cites">
                    {m.sources!.map((s, si) => (
                      <button key={s.id} className="ex-cite" onClick={() => { setEvMsg(i); setEvOpen(true); }} title={s.title}>[{si + 1}] {s.title}</button>
                    ))}
                    <button className="ex-cite" onClick={() => send(locale === 'fa' ? 'به این پاسخ چالش بگذار: نقطه‌ضعف‌های استدلال را نشان بده.' : 'Challenge this answer: expose the weakest links in the reasoning.')}>↯ {t.challengeThis}</button>
                  </div>
                )}
              </div>
            ))}
            {error && (
              <div className="ex-error" role="alert">
                <span>{error}</span>
                {retryQ && <button onClick={() => send(retryQ)}>{t.retry}</button>}
              </div>
            )}
            <div className="ex-compose">
              <div className="ex-compose-row">
                <textarea
                  ref={inputRef}
                  className="ex-input"
                  placeholder={t.composerPlaceholder}
                  rows={2}
                  maxLength={2000}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = inputRef.current?.value ?? ''; if (v.trim()) { inputRef.current!.value = ''; send(v); } } }}
                  aria-label={t.composerPlaceholder}
                />
                {busy ? <button className="ex-stop" onClick={() => abortRef.current?.abort()}>{t.stop}</button> : <button className="ex-send" onClick={() => { const v = inputRef.current?.value ?? ''; if (v.trim()) { inputRef.current!.value = ''; send(v); } }}>{t.send}</button>}
              </div>
              <div className="ex-hint"><span>{t.hintLeft}</span><span>{t.limit(asked)}</span></div>
            </div>
          </section>
          <aside className="ex-evidence" hidden={!evOpen} aria-label={t.evidenceTitle}>
            <button className="ex-drawer-toggle" onClick={() => setEvOpen(false)} aria-expanded={evOpen}>{t.evidenceBtn} {evOpen ? '×' : ''}</button>
            <h3>{t.evidenceTitle}</h3>
            <p className="ex-ev-note">{evidence.length ? t.evidenceNote : t.evidenceEmpty}</p>
            {evidence.map((s) => (
              <div className="ex-ev-item" key={s.id}>
                <span className="ex-ev-class">{s.class} · {s.type}</span>
                <p className="ex-ev-title">{s.title}</p>
                <a className="ex-ev-link" href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a>
              </div>
            ))}
          </aside>
        </main>
      )}

      <footer className="ex-foot">
        <span>{t.footLeft}</span>
        <span>{t.footRight}</span>
      </footer>
    </div>
  );
}