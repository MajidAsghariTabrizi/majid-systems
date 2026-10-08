'use client';
/**
 * THE CONVERGENCE — /journey experience orchestrator.
 * Server-rendered content (SEO-visible) + client interactions.
 * One persistent radial career graph gains layers as scenes activate.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import {
  ASK_ANSWERS,
  ASK_SUGGESTED,
  BRAIN_BOUNDARY,
  BRAIN_GOVERNED,
  BRAIN_LAYERS,
  BRAIN_LOOP,
  BRAIN_SPLIT,
  BRAIN_TECHNIQUES,
  CONVERGENCE_LINE,
  CONVERGENCE_TRACKS,
  DISCIPLINE_EARLY,
  DISCIPLINE_LATE,
  DISCIPLINE_LINE,
  DISCIPLINE_RULES,
  DSH_BLOCKS,
  DSH_EVOLUTION,
  EXPERIMENTS,
  JOURNEY_ESCAPE,
  JOURNEY_FINAL,
  JOURNEY_LAYERS,
  JOURNEY_LOOP,
  JOURNEY_OPEN,
  JOURNEY_SCENES,
  JOURNEY_SOUL,
  LAB_SURVIVAL,
  LEGACY_AUDIT,
  MODEL_QUESTIONS,
  ORG_NODES,
  PHOENIX_CLAIMS,
  PHOENIX_FLOW,
  PHOENIX_LESSONS,
  PHOENIX_LINE,
  PHOENIX_LIVE_NOTE,
  PHOENIX_NUMBERS,
  PHOENIX_POSTURE,
  PHOENIX_STACK,
  POOLING,
  QUANTIVIQ_STACK,
  ROUTER_FEATURES,
  ROUTER_LINE,
  ROUTER_PIPELINE,
  ROUTER_PROVIDERS,
  SENTINEL_ABSTAIN,
  SENTINEL_GENERATION,
  SENTINEL_OUTCOMES,
  SENTINEL_PIPELINE,
  TECH_FLOW,
  UEA_IDEAS,
  UEA_LIFECYCLE,
  UEA_LINE,
  VERDICTS_SHOWN,
  type GraphLayerKey,
} from '@/content/journey';
import {
  SLOT_BY_KEY,
  chainEdges,
  CONVERGENCE_POINT,
  LAYER_SLOTS,
  visibleLayers,
  orbitDots,
} from '@/lib/journey/graph';
import {
  AbstainMoment,
  AuditCounters,
  Badge,
  ChainRow,
  ClaimsLadder,
  ConvergenceStack,
  GateRun,
  GenerationScrubber,
  LedgerCard,
  LifecycleRing,
  MarketNetwork,
  MemoryLoop,
  OrgTopology,
  PoolingBars,
  RouteFailover,
  SplitBrain,
  TechFlow,
} from './widgets';

const ALL_LAYERS = Object.keys(JOURNEY_LAYERS) as GraphLayerKey[];

/* ------------------------------------------------------------------ */
/* Persistent career graph                                             */
/* ------------------------------------------------------------------ */

function ConvergenceGraph({ active }: { active: number }) {
  const scene = JOURNEY_SCENES[Math.min(active, JOURNEY_SCENES.length - 1)];
  const visible = visibleLayers(scene.layers, ALL_LAYERS);
  const edges = chainEdges(visible);
  const zoomed = scene.id === 'convergence' || active >= JOURNEY_SCENES.length - 1;
  return (
    <div className={`jv-graph ${zoomed ? 'zoom' : ''}`} data-era={scene.layers[scene.layers.length - 1]} aria-hidden="true">
      <svg viewBox="0 0 1000 620">
        <g className="jv-graph-zoom">
          {edges.map(({ from, to }) => {
            const a = SLOT_BY_KEY[from];
            const b = SLOT_BY_KEY[to];
            return (
              <path
                key={`${from}>${to}`}
                className="jv-g-edge"
                d={`M${a.x},${a.y} Q${(a.x + b.x) / 2 + (b.y - a.y) * 0.12},${(a.y + b.y) / 2 - (b.x - a.x) * 0.12} ${b.x},${b.y}`}
              />
            );
          })}
          {zoomed &&
            LAYER_SLOTS.map((s) => (
              <path key={`c>${s.key}`} className="jv-g-conv" d={`M${s.x},${s.y} L${CONVERGENCE_POINT.x},${CONVERGENCE_POINT.y}`} />
            ))}
          {LAYER_SLOTS.map((slot) => {
            const on = visible.includes(slot.key);
            const activeNow = scene.layers.includes(slot.key);
            return (
              <g key={slot.key} className={`jv-g-node ${on ? 'on' : ''} ${activeNow ? 'hot' : ''}`}>
                {orbitDots(slot, 4).map((d, i) => (
                  <circle key={i} className="jv-g-orbit" cx={d.x} cy={d.y} r="3" style={{ transitionDelay: `${i * 90}ms` }} />
                ))}
                <circle cx={slot.x} cy={slot.y} r={activeNow ? 30 : 22} className="jv-g-core" style={{ transitionDelay: '60ms' }} />
                <text x={slot.x} y={slot.y + (slot.y < 300 ? -44 : 52)} textAnchor="middle" className="jv-g-label">
                  {slot.label}
                </text>
              </g>
            );
          })}
          {zoomed && (
            <g className="jv-g-center on">
              <circle cx={CONVERGENCE_POINT.x} cy={CONVERGENCE_POINT.y} r="34" className="jv-g-core center" />
              <text x={CONVERGENCE_POINT.x} y={CONVERGENCE_POINT.y + 5} textAnchor="middle" className="jv-g-q">
                QV
              </text>
            </g>
          )}
        </g>
      </svg>
      <div className="jv-graph-era">{scene.kicker}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ASK THE SYSTEM — deterministic                                      */
/* ------------------------------------------------------------------ */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set([
  'what', 'your', 'you', 'the', 'does', 'did', 'how', 'why', 'from', 'for', 'with',
  'and', 'are', 'was', 'show', 'only', 'me', 'can', 'would', 'should', 'when', 'who',
]);
const TOKENS = (q: string) =>
  new Set(norm(q).split(' ').filter((t) => t.length > 2 && !STOP.has(t)));

function matchAnswer(input: string) {
  const q = TOKENS(input);
  if (q.size === 0) return null;
  let best: { score: number; id: string } | null = null;
  for (const a of ASK_ANSWERS) {
    const t = TOKENS(`${a.q} ${a.scenes.join(' ')}`);
    let score = 0;
    for (const w of q) if (t.has(w)) score += w.length;
    if (score >= 6 && (!best || score > best.score)) best = { score, id: a.id };
  }
  return best ? ASK_ANSWERS.find((a) => a.id === best!.id) ?? null : null;
}

function AskPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState<ReturnType<typeof matchAnswer>>(null);
  const [asked, setAsked] = useState('');
  const ask = (q: string) => {
    setInput(q);
    setAsked(q);
    setAnswer(matchAnswer(q));
  };
  return (
    <div className={`jv-ask ${open ? 'open' : ''}`} role="dialog" aria-label="Ask the system" aria-hidden={!open}>
      <div className="jv-ask-panel">
        <div className="jv-ask-head">
          <span>ASK THE SYSTEM</span>
          <button type="button" className="jv-ask-close" onClick={onClose} aria-label="Close ask panel">✕</button>
        </div>
        <p className="jv-ask-sub">Curated answers over the journey&apos;s own evidence. Deterministic — no language model, no improvisation.</p>
        <div className="jv-ask-chips">
          {ASK_SUGGESTED.slice(0, 6).map((s) => (
            <button key={s} type="button" className="jv-ask-chip" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
        <form
          className="jv-ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the career, a system, a failure…"
            aria-label="Your question"
          />
          <button type="submit" className="jv-run">
            ASK
          </button>
        </form>
        {asked && (
          <div className="jv-ask-out" aria-live="polite">
            {answer ? (
              <>
                <p className="jv-ask-q">“{asked}”</p>
                <p className="jv-ask-a">{answer.a}</p>
                <div className="jv-ask-badges">
                  {answer.badges.map((b) => (
                    <Badge key={b} kind={b} />
                  ))}
                </div>
                <div className="jv-ask-links">
                  {answer.links?.map((l) => (
                    <Link key={l.href} href={l.href} className="jv-ask-link">
                      {l.label} →
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <p className="jv-ask-a jv-ask-none">
                No curated answer for that yet — the system abstains rather than inventing. Try one of the suggested
                questions, or explore the scenes directly.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Explore map                                                         */
/* ------------------------------------------------------------------ */

const EXPLORE_GROUPS: { k: string; ids: string[] }[] = [
  { k: 'CAREER', ids: ['technology', 'product', 'organization', 'marketplace'] },
  { k: 'SYSTEMS', ids: ['decision-systems'] },
  { k: 'AI', ids: ['router', 'agents', 'harness', 'brain'] },
  { k: 'DESTINATION', ids: ['convergence'] },
];

function ExploreMap({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`jv-explore ${open ? 'open' : ''}`} role="dialog" aria-label="Explore map" aria-hidden={!open}>
      <div className="jv-explore-panel">
        <div className="jv-ask-head">
          <span>EXPLORE — JUMP ANYWHERE</span>
          <button type="button" className="jv-ask-close" onClick={onClose} aria-label="Close explore map">✕</button>
        </div>
        {EXPLORE_GROUPS.map((g) => (
          <div key={g.k} className="jv-explore-group">
            <span className="jv-explore-k">{g.k}</span>
            <div className="jv-explore-links">
              {g.ids.map((id) => {
                const s = JOURNEY_SCENES.find((x) => x.id === id);
                if (!s) return null;
                return (
                  <a
                    key={id}
                    href={`#jv-${id}`}
                    className="jv-explore-link"
                    onClick={onClose}
                  >
                    {s.theme}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
        <div className="jv-explore-escape">
          <Link href={JOURNEY_ESCAPE.profile.href}>{JOURNEY_ESCAPE.profile.label}</Link>
          <Link href={JOURNEY_ESCAPE.resume.href}>{JOURNEY_ESCAPE.resume.label}</Link>
          <a href={JOURNEY_ESCAPE.github.href} target="_blank" rel="noreferrer">
            {JOURNEY_ESCAPE.github.label}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene shell                                                         */
/* ------------------------------------------------------------------ */

function SceneSection({ id, idx, children }: { id: string; idx: number | string; children: React.ReactNode }) {
  return (
    <section id={`jv-${id}`} className="jv-scene" data-scene={id} data-idx={idx}>
      {children}
    </section>
  );
}

function SceneHead({ kicker, theme, headline }: { kicker: string; theme: string; headline: string }) {
  return (
    <header className="jv-scene-head">
      <span className="jv-kicker">{kicker}</span>
      <h2 className="jv-theme">{theme}</h2>
      <h3 className="jv-headline">{headline}</h3>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Main experience                                                     */
/* ------------------------------------------------------------------ */

export function JourneyExperience() {
  const [active, setActive] = useState(0); // 0 = cold open
  const [askOpen, setAskOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.jv-scene'));
    const io = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; r: number } | null = null;
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.idx ?? -1);
          if (idx < 0) continue;
          if (e.isIntersecting && e.intersectionRatio > 0.3 && (!best || e.intersectionRatio > best.r)) {
            best = { idx, r: e.intersectionRatio };
          }
        }
        if (best) setActive(best.idx + 1);
      },
      { threshold: [0.3, 0.6] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAskOpen(false);
        setExploreOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loopStageIdx = useMemo(() => {
    const s = JOURNEY_SCENES[Math.min(Math.max(active - 1, 0), JOURNEY_SCENES.length - 1)];
    return Math.max(0, JOURNEY_LOOP.indexOf(s.loopStage as (typeof JOURNEY_LOOP)[number]));
  }, [active]);

  const scrubExperiments = useMemo(
    () =>
      EXPERIMENTS.filter((x) =>
        ['x-legacy', 'x-pooling', 'x-sentinel', 'x-m16', 'x-m17', 'x-m19', 'x-lineages', 'x-worlds'].includes(x.id)
      ),
    []
  );

  return (
    <div className={`jv ${reduced ? 'reduced' : ''}`}>
      {/* chrome */}
      <header className="jv-top">
        <Link href="/" className="jv-logo">
          QUANTIVIQ<span> / JOURNEY</span>
        </Link>
        <nav className="jv-top-nav" aria-label="Journey utilities">
          <button type="button" className="jv-top-btn" onClick={() => setExploreOpen(true)}>
            EXPLORE
          </button>
          <Link href={JOURNEY_ESCAPE.profile.href} className="jv-top-btn">
            {JOURNEY_ESCAPE.profile.label}
          </Link>
          <Link href={JOURNEY_ESCAPE.resume.href} className="jv-top-btn">
            {JOURNEY_ESCAPE.resume.label}
          </Link>
        </nav>
        <div className="jv-loop" aria-hidden="true">
          {JOURNEY_LOOP.map((l, i) => (
            <span key={l} className={`jv-loop-step ${i === loopStageIdx ? 'on' : ''} ${i < loopStageIdx ? 'done' : ''}`}>
              {l}
            </span>
          ))}
        </div>
      </header>

      {/* graph rail (desktop) */}
      <aside className="jv-graph-rail" aria-hidden="true">
        <ConvergenceGraph active={active} />
      </aside>

      {/* scenes */}
      <main className="jv-main">
        {/* 00 cold open */}
        <section className="jv-open" data-scene="open">
          <p className="jv-open-l1">{JOURNEY_OPEN.line1}</p>
          <p className="jv-open-l2">{JOURNEY_OPEN.line2}</p>
          <div className="jv-open-node" aria-hidden="true">
            <span className="jv-open-core" />
            <span className="jv-open-label">{JOURNEY_OPEN.firstNode}</span>
          </div>
          <p className="jv-open-cue">{JOURNEY_OPEN.cue}</p>
        </section>

        <SceneSection idx="0" id="technology">
          <SceneHead kicker="SCENE 01 · TECHNOLOGY" theme="BUILDING THE MACHINE" headline="First, make software actually run." />
          <p className="jv-p">I started by building systems — APIs, databases, Linux, web systems, Git, CI/CD, deployment, production debugging, monitoring.</p>
          <p className="jv-p jv-strong">Before managing products, I learned what it means to make software actually run.</p>
          <TechFlow stages={TECH_FLOW} />
          <p className="jv-src">Era — Daapapp · Infinite8 · SportMob</p>
          <div className="jv-badges">
            <Badge kind="SHIPPED" />
            <Badge kind="PRODUCTION" />
          </div>
        </SceneSection>

        <SceneSection idx="1" id="product">
          <SceneHead kicker="SCENE 02 · PRODUCT" theme="BUILDING THE RIGHT MACHINE" headline="The technical system works. Then ask: but should it exist?" />
          <p className="jv-p jv-strong">
            From “Can we build it?” to “Should we build it, for whom, and what changes if we do?”
          </p>
          <p className="jv-p">
            Discovery · hypothesis · experimentation · analytics · metrics · marketplace design · growth · ranking ·
            monetization · vendor systems · operational products — learned as chapters, not as a skill cloud.
          </p>
          <p className="jv-p jv-quote">
            “A product without engineering discipline is a sketch; an engineering effort without product discipline is a
            hobby — the interesting work is at the boundary.”
          </p>
          <div className="jv-badges">
            <Badge kind="PRODUCT IMPACT" />
          </div>
        </SceneSection>

        <SceneSection idx="2" id="organization">
          <SceneHead kicker="SCENE 03 · AGILE & ORGANIZATION" theme="BUILDING THE SYSTEM THAT BUILDS THE PRODUCT" headline="Why do good people inside good companies still build slowly?" />
          <p className="jv-p jv-strong">
            The bottleneck was not always the code. Sometimes it was the organization around the code.
          </p>
          <OrgTopology nodes={ORG_NODES} />
          <p className="jv-p">
            Agile coaching · product transformation · team design · cross-functional execution · delivery systems ·
            ownership · operating models · feedback loops · PSM I.
          </p>
          <div className="jv-badges">
            <Badge kind="PRODUCT IMPACT" />
            <Badge kind="SHIPPED" />
          </div>
        </SceneSection>

        <SceneSection idx="3" id="marketplace">
          <SceneHead kicker="SCENE 04 · MARKETPLACE & Q-COMMERCE" theme="WHEN PRODUCTS BECOME SYSTEMS" headline="At marketplace scale, there is no isolated feature." />
          <p className="jv-p jv-strong">Every decision moves through a system.</p>
          <MarketNetwork
            domains={[
              'CATALOG', 'INVENTORY', 'VENDOR', 'SEARCH', 'DISCOVERY', 'PRICING',
              'PROMOTION', 'ORDER', 'INTEGRATION', 'MONETIZATION', 'OPERATIONS',
            ]}
          />
          <p className="jv-p">
            This is where product, engineering and operations began converging: end-to-end tracing, root-cause
            investigation, data-backed decisions, integration thinking, platform thinking, economic thinking.
          </p>
          <p className="jv-src">SnappMarket · Okala · Alibaba Travels — generalized domain map. No employer internals.</p>
          <div className="jv-badges">
            <Badge kind="PRODUCT IMPACT" />
          </div>
        </SceneSection>

        <SceneSection idx="4" id="decision-systems">
          <SceneHead kicker="SCENE 05 · THE PREDICTION LAB" theme="CAN A SYSTEM LEARN WHEN NOT TO ACT?" headline="Prediction is cheap. Trustworthy action is expensive." />

          <p className="jv-p jv-strong">
            A real research runtime on a small server — not notebooks. It had to survive:
          </p>
          <ul className="jv-list">
            {LAB_SURVIVAL.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h4 className="jv-sub">THE MICRO-SERVER DISCIPLINE</h4>
          <p className="jv-p">
            The machine got visibly more disciplined, not merely more complicated. The early lesson: historical
            complexity did not equal edge.
          </p>

          <h4 className="jv-sub">05A — THE LEGACY AUDIT</h4>
          <AuditCounters
            items={[
              { k: 'SOURCE', v: LEGACY_AUDIT.rawRows },
              { k: 'RECOVERED', v: LEGACY_AUDIT.candles },
              { k: 'AUDITED', v: LEGACY_AUDIT.trades },
              { k: 'OUTCOME', v: LEGACY_AUDIT.stopHit },
              { k: 'WIN RATE', v: LEGACY_AUDIT.winRate },
              { k: 'REALITY', v: LEGACY_AUDIT.pnl },
            ]}
          />
          <p className="jv-p jv-strong">{LEGACY_AUDIT.line}</p>
          <LedgerCard x={EXPERIMENTS.find((x) => x.id === 'x-legacy')!} />

          <h4 className="jv-sub">05B — MORE DATA ≠ MORE INTELLIGENCE</h4>
          <div className="jv-eq">
            <span className="jv-eq-bad">{POOLING.wrong}</span>
            <span className="jv-eq-arrow">→</span>
            <span className="jv-eq-good">{POOLING.right}</span>
          </div>
          <PoolingBars a={POOLING.currentOnly} b={POOLING.pooled} line={POOLING.line} />
          <LedgerCard x={EXPERIMENTS.find((x) => x.id === 'x-pooling')!} />

          <h4 className="jv-sub">05C — QUANTIVIQ SENTINEL</h4>
          <ChainRow items={SENTINEL_PIPELINE} tone="late" />
          <p className="jv-p mono">{SENTINEL_GENERATION}</p>
          <AbstainMoment />
          <p className="jv-p jv-strong">{SENTINEL_ABSTAIN.line}</p>
          <p className="jv-p mono">
            {SENTINEL_OUTCOMES.matured} · {SENTINEL_OUTCOMES.champion}
          </p>
          <LedgerCard x={EXPERIMENTS.find((x) => x.id === 'x-sentinel')!} />

          <h4 className="jv-sub">05D — THE SCIENTIFIC DISCIPLINE</h4>
          <p className="jv-chain-cap">EARLY</p>
          <ChainRow items={DISCIPLINE_EARLY} tone="early" />
          <p className="jv-chain-cap">LATER</p>
          <ChainRow items={DISCIPLINE_LATE} tone="late" />
          <ul className="jv-list cols">
            {DISCIPLINE_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="jv-p jv-strong">{DISCIPLINE_LINE}</p>
          <table className="jv-questions">
            <caption className="jv-chain-cap">MODELS EXISTED BECAUSE DIFFERENT QUESTIONS REQUIRED DIFFERENT ESTIMATORS</caption>
            <tbody>
              {MODEL_QUESTIONS.map((m) => (
                <tr key={m.model}>
                  <td className="mono">{m.model}</td>
                  <td>{m.question}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="jv-sub">05E — THE EXPERIMENT GENERATIONS</h4>
          <GenerationScrubber experiments={scrubExperiments} />
          <p className="jv-p jv-strong">The tests passed. The hypothesis did not.</p>

          <h4 className="jv-sub">05F — PHOENIX · AUTONOMY MEETS CONSEQUENCE</h4>
          <GateRun stages={PHOENIX_FLOW} />
          <p className="jv-p mono">{PHOENIX_STACK.join(' · ')}</p>
          <ul className="jv-list">
            {PHOENIX_POSTURE.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="jv-p">{PHOENIX_LIVE_NOTE}</p>
          <ClaimsLadder claims={PHOENIX_CLAIMS} />
          <div className="jv-numbers">
            {PHOENIX_NUMBERS.map((n) => (
              <span key={n} className="jv-number">
                {n}
              </span>
            ))}
          </div>
          <ol className="jv-lessons">
            {PHOENIX_LESSONS.map((l, i) => (
              <li key={l}>
                <span className="jv-lesson-n">{i + 1}</span>
                {l}
              </li>
            ))}
          </ol>
          <p className="jv-p jv-strong">{PHOENIX_LINE}</p>
          <div className="jv-badges">
            <Badge kind="PRODUCTION" />
            <Badge kind="REJECTED EXPERIMENT" />
            <Badge kind="UNPROVEN" />
            <Badge kind="NEGATIVE RESULT" />
          </div>
          <LedgerCard x={EXPERIMENTS.find((x) => x.id === 'x-phoenix')!} />
        </SceneSection>

        <SceneSection idx="5" id="router">
          <SceneHead kicker="SCENE 06 · AI INFRASTRUCTURE" theme="INTELLIGENCE BECAME INFRASTRUCTURE" headline="The model is not the product." />
          <ChainRow items={ROUTER_PIPELINE} tone="late" />
          <RouteFailover providers={ROUTER_PROVIDERS} />
          <ul className="jv-list cols">
            {ROUTER_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="jv-p jv-strong">{ROUTER_LINE}</p>
          <div className="jv-badges">
            <Badge kind="OPEN SOURCE" />
            <Badge kind="SHIPPED" />
          </div>
          <p className="jv-src">
            <a href="https://github.com/MajidAsghariTabrizi/free-best-router" target="_blank" rel="noreferrer">
              github.com/MajidAsghariTabrizi/free-best-router →
            </a>
          </p>
        </SceneSection>

        <SceneSection idx="6" id="agents">
          <SceneHead kicker="SCENE 07 · AGENT RUNTIME" theme="FROM MODEL TO WORKER" headline="A capable model is not yet a reliable worker." />
          <LifecycleRing stages={UEA_LIFECYCLE} />
          <ul className="jv-list cols">
            {UEA_IDEAS.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <p className="jv-p jv-strong">{UEA_LINE}</p>
          <div className="jv-badges">
            <Badge kind="OPEN SOURCE" />
          </div>
          <p className="jv-src">
            <a href="https://github.com/MajidAsghariTabrizi/universal-engineering-agent" target="_blank" rel="noreferrer">
              github.com/MajidAsghariTabrizi/universal-engineering-agent →
            </a>
          </p>
        </SceneSection>

        <SceneSection idx="7" id="harness">
          <SceneHead kicker="SCENE 08 · DSH / HARNESS" theme="LONG-RUNNING INTELLIGENCE" headline="From single prompts to missions that survive their own failures." />
          <ChainRow items={DSH_BLOCKS} tone="late" />
          <ul className="jv-list">
            {DSH_EVOLUTION.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="jv-src">Architecture level only — no private code, credentials or operational data.</p>
        </SceneSection>

        <SceneSection idx="8" id="brain">
          <SceneHead kicker="SCENE 09 · THE BRAIN" theme="WHAT IF THE SYSTEM DIDN’T START FROM ZERO EVERY TIME?" headline="A persistent learning layer — governed, not magical." />
          <MemoryLoop loop={BRAIN_LOOP} />
          <div className="jv-brain-layers">
            {BRAIN_LAYERS.map((l) => (
              <div key={l.k} className="jv-brain-layer">
                <span className="jv-bl-k">{l.k}</span>
                <span className="jv-bl-q">{l.q}</span>
              </div>
            ))}
          </div>
          <ul className="jv-list cols">
            {BRAIN_TECHNIQUES.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="jv-p jv-strong">{BRAIN_GOVERNED}</p>
          <h4 className="jv-sub">THE SPLIT-BRAIN MOMENT</h4>
          <SplitBrain left={BRAIN_SPLIT.left} right={BRAIN_SPLIT.right} resolve={BRAIN_SPLIT.resolve} />
          <p className="jv-p jv-strong">{BRAIN_SPLIT.line}</p>
          <p className="jv-p">{BRAIN_BOUNDARY}</p>
          <LedgerCard x={EXPERIMENTS.find((x) => x.id === 'x-brain')!} />
          <div className="jv-badges">
            <Badge kind="LEARNING SYSTEM" />
            <Badge kind="NEGATIVE RESULT" />
          </div>
        </SceneSection>

        <SceneSection idx="9" id="convergence">
          <SceneHead kicker="SCENE 10 · THE CONVERGENCE" theme="THE CAREER BECOMES THE ARCHITECTURE" headline="Zoom out." />
          <ConvergenceStack tracks={CONVERGENCE_TRACKS} stack={QUANTIVIQ_STACK} />
          <p className="jv-p jv-strong">{CONVERGENCE_LINE}</p>
        </SceneSection>

        <SceneSection idx="10" id="final">
          <p className="jv-final-h">{JOURNEY_FINAL.headline}</p>
          <div className="jv-final-lines">
            {JOURNEY_FINAL.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <p className="jv-soul">{JOURNEY_SOUL}</p>
          <div className="jv-final-ctas">
            <Link href={JOURNEY_FINAL.ctaPrimary.href} className="jv-cta primary">
              {JOURNEY_FINAL.ctaPrimary.label}
            </Link>
            <Link href={JOURNEY_FINAL.ctaSecondary.href} className="jv-cta">
              {JOURNEY_FINAL.ctaSecondary.label}
            </Link>
            <a href={JOURNEY_FINAL.ctaTertiary.href} target="_blank" rel="noreferrer" className="jv-cta">
              {JOURNEY_FINAL.ctaTertiary.label}
            </a>
          </div>
          <p className="jv-verdicts">
            VERDICTS ON THIS PAGE: {VERDICTS_SHOWN.join(' · ')} — an honest ledger, not a highlight reel.
          </p>
        </SceneSection>
      </main>

      {/* persistent controls */}
      <button type="button" className="jv-ask-fab" onClick={() => setAskOpen(true)}>
        ASK THE SYSTEM
      </button>

      <AskPanel open={askOpen} onClose={() => setAskOpen(false)} />
      <ExploreMap open={exploreOpen} onClose={() => setExploreOpen(false)} />
    </div>
  );
}
