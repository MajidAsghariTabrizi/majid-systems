import type { ReactNode } from 'react';

export const ARCHITECTURE: Record<string, ReactNode> = {
  phoenix: (
    <pre className="diagram">
{`External Inputs              Data & State Layer           Decision / Economic Engine          Operations
─────────────────             ──────────────────           ──────────────────────────           ───────────
Arbitrum Nitro Feed    ──▶    nitro-feed-relay      ──▶    prefilter                    ──▶    recorder
Atlas Auction Stream   ──▶    feed-ingestor         ──▶    exact-state validation       ──▶    shadow-dispatcher
Aave V3 State          ──▶    atlas-observer        ──▶    dual-provider agreement      ──▶    prometheus
Primary RPC            ──▶    aave-liquidation-hunter──▶   conservative economic gate  ──▶    dashboard
Secondary RPC          ──▶    rpc-gateway           ──▶    candidate emission          ──▶    release-controller
                                NATS JetStream             route & revenue-lane controls           GitHub Actions
                                PostgreSQL                 global submission lock                  Docker Compose`}
    </pre>
  ),
  'smart-trader': (
    <pre className="diagram">
{`Market providers        Ingestion           Decision              Execution          Presentation
───────────────         ─────────           ────────              ─────────          ───────────
Wallex        ──┐                         ┌─▶ trend_channel       ┌─▶ sizing          ┌─▶ FastAPI
CoinGecko     ──┼──▶ MarketDataProvider──▶├─▶ momentum_channel  ──┼─▶ risk gates    ──┼─▶ /api/*
CoinCap       ──┘    (normalized candles) ├─▶ meanrev_channel    ──┤  └─▶ position     └─▶ static/*
                        regime detection   ├─▶ breakout_channel   ──┤
                        ATR / ADX / VR     ├─▶ behavior_intel   ───┘
                                            └─▶ aggregate + reasons

                            SQLite ◀── decision logs / trade events / account snapshots
                            nginx ◀── /api/* → :8000 │ static/* │ /dashboard`}
    </pre>
  ),
  'free-best-router': (
    <pre className="diagram">
{`Your App
   │
   ▼
POST /v1/chat/completions   (OpenAI-compatible)
   │
   ▼
Free Best Router
   │
   ├──▶ catalog discovery         (startup + /_refresh)
   ├──▶ warm-up probe             (boot)
   ├──▶ runtime scoring           (capability × reliability × latency × ctx)
   ├──▶ Wilson lower bound        (success rate, time-decayed)
   ├──▶ exploration gate          (5% non-incumbent probes)
   ├──▶ bounded failover          (≤4 attempts, 180s wall time)
   └──▶ per-failure cooldowns     (429=8m, 404=1h, exponential)

        │   │
   ┌────┘   └────────────┐
   ▼                    ▼
OpenRouter          OpenCode / Zen
Groq                Cerebras
Mistral             DeepSeek
Local Ollama        Local LM Studio`}
    </pre>
  ),
  'universal-engineering-agent': (
    <pre className="diagram">
{`MissionSpec ─▶ uh_mission ─┐
                            ├─▶ uh_context_build ─▶ uh_verify
Checkpoint   ─▶ uh_checkpoint│     │                   │
Profile      ─▶ uh_profile   │     ▼                   ▼
Memory       ─▶ uh_memory    │   uh_graph          classify
                            │   filesystem         recover
                            │   documentation      generalize
                            │   runtime            hygiene
                            ▼
                    9-stage kernel:
                    inspect ▸ plan ▸ implement
                      ▸ verify ▸ classify ▸ recover
                      ▸ test ▸ generalize ▸ hygiene

External: profile.yml, checkpoints.jsonl, .uea-test/`}
    </pre>
  ),
};

export const PIPELINES: Record<string, ReactNode> = {
  phoenix: (
    <pre className="diagram">
{`1. Ingest event / borrower / auction / route
   ↓
2. Normalize identity, dedupe, reject malformed
   ↓
3. Low-cost prefilter (chain, freshness, debt, route policy)
   ↓
4. Bind opportunity to exact finalized block
   ↓
5. Two independent RPC providers — block, account, prices
   ↓
6. Require exact agreement on chain / block / state
   ↓
7. Estimate full economic outcome (gross − every cost)
   ↓
8. Reject unless conservative_net_pnl > retained_floor
   ↓
9. Revalidate route / lane / signer / contract / nonce / lock
   ↓
10. Materialize one typed execution request
   ↓
11. Submit at most one revenue transaction at a time
   ↓
12. Reconcile receipt / events / balances / fees / nonce
   ↓
13. Record realized net PnL (only after reconciliation)`}
    </pre>
  ),
};

export const SAFETY: Record<string, ReactNode> = {
  phoenix: (
    <ul className="invariants">
      <li>Two independent providers required for exact authority.</li>
      <li>Provider disagreement closes execution authority until fresh agreement returns.</li>
      <li>One global submission lock prevents conflicting revenue transactions.</li>
      <li>One transaction at a time across all lanes.</li>
      <li>Signer material is file-mounted and never stored in CI.</li>
      <li>Each lane has independent armed state and kill switch.</li>
      <li>Unknown submission state blocks new authority.</li>
      <li>On-chain executor includes minimum-profit protection.</li>
      <li>No-alpha is not an error; it never forces a bad trade.</li>
      <li>Release failures roll back through protected, version-matched workflows.</li>
      <li>Realized PnL is recorded only after receipt and balance reconciliation.</li>
    </ul>
  ),
};

export function getArchitecture(slug: string): ReactNode | undefined {
  return ARCHITECTURE[slug];
}

export function getPipeline(slug: string): ReactNode | undefined {
  return PIPELINES[slug];
}

export function getSafety(slug: string): ReactNode | undefined {
  return SAFETY[slug];
}