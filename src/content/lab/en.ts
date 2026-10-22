/**
 * Lab dictionary — EN. fa.ts MUST mirror this shape exactly
 * (test/i18n.test.ts enforces key parity through the attached `lab` key).
 *
 * Tone: a serious AI research and engineering laboratory. Every claim is
 * worded to match what the sanitized snapshot actually measures — the lab
 * never claims profitability, live trading, or validated skill where the
 * evidence says otherwise.
 */

export const labEn = {
  meta: {
    title: 'AI Decision Intelligence Laboratory — Real System, Measured Honesty',
    description:
      'An interactive laboratory over a real paper-only decision system: nine experts, two frozen model heads, five policy gates, an evidence-gated learning loop — and the honest limits of what has been validated.',
  },
  hero: {
    eyebrow: 'QUANTIVIQ LAB · READ-ONLY OBSERVATORY OVER A REAL SYSTEM',
    h1: 'Watch a machine decide — and refuse.',
    sub: 'A frozen, paper-only decision system. Nine experts. Two statistical heads. Five gates that almost always say no.',
    lede: 'This laboratory shows a real AI decision architecture in operation: raw market perception, expert estimates, probability fusion, priced uncertainty, and an expected-value policy that abstains unless the evidence clears the cost of acting. Nothing here is a mock-up — and nothing here has proven profitable trading. That is exactly why it is worth studying.',
    ctaPrimary: 'Run the guided replay',
    ctaSecondary: 'Explore the topology',
    safetyLine: 'LIVE EXECUTION OFF · LIVE CAPITAL OFF · PAPER SHADOW ONLY · NO OPERATIONAL CONTROLS',
    stats: {
      decisions: 'decisions in window',
      outcomes: 'matured outcomes',
      noTrade: 'abstain rate',
      experiments: 'registered experiments',
      claims: 'brain claims',
      zero: 'real orders ever submitted',
    },
    zeroValue: '0',
  },
  modes: {
    label: 'LAB MODE',
    guided: {
      label: 'Guided Demo',
      hint: 'Deterministic · always available · approved snapshot data',
    },
    live: {
      label: 'Live Laboratory',
      hint: 'Adds real data-freshness stamps · no operational controls',
    },
    note: 'Both modes read the same sanitized, read-only snapshot artifact. Neither mode can send anything to the operating system — the lab has no write path, by construction.',
    snapshotAge: 'Snapshot age',
    generatedAt: 'Data generated',
    sanitizedAt: 'Sanitized',
    sourceHash: 'Source SHA-256',
    dataClass: 'Data class',
    fresh: 'fresh',
    stale: 'aging',
    staleHint: 'The private system refreshes this artifact on an operator schedule; an aging snapshot changes nothing on the page except its timestamps.',
    offlineTitle: 'Snapshot unavailable',
    offlineBody:
      'The sanitized snapshot artifact could not be loaded. The laboratory refuses to render substitute data — refresh the page or check back later.',
  },
  overview: {
    eyebrow: '01 · What this is',
    h2: 'One decision machine, fully instrumented.',
    lede: 'The system below runs for real on a private server: it perceives one market (BTCTMN), predicts two horizons (30 and 60 minutes), prices its own uncertainty, and writes every decision to immutable ledgers. It has authority over nothing — every order path is structurally disabled. What remains is the interesting part: disciplined decision-making under uncertainty, measured honestly.',
    cards: [
      {
        title: 'The problem it addresses',
        body: 'Most prediction systems answer “what will happen?”. A decision system must answer “is acting justified, after costs, given how uncertain I am?”. The gap between those two questions is where naive systems destroy value — trading on noise that looked like signal.',
      },
      {
        title: 'Why nine experts',
        body: 'Different questions need different estimators: micro-direction, return surface, magnitude, large-move probability, path shape, execution cost, global dislocation, order-book events, maker-fill risk. A router weighs them per market state — and the lab shows the measured truth that several are highly correlated today.',
      },
      {
        title: 'How predictions form',
        body: 'Two frozen multi-output model heads — one for direction (huber MultiOutput), one for maximum-favorable-excitation (MFE) — turn 25 standardized features into quantiles and probabilities. Fusion assembles P(up), P(move > break-even), and expected magnitude bps.',
      },
      {
        title: 'How the Brain contributes',
        body: 'A separate knowledge system (not the trading loop) turns matured outcomes into error attribution, episodes, and ranked hypotheses. 329 open hypotheses; promotion is owner-only and evidence-gated. The trading loop never reads the Brain at runtime — knowledge reaches policy only through the human owner.',
      },
      {
        title: 'How the harness measures',
        body: 'Pre-registered experiments: spec frozen before evaluation, mechanical verdict gates (log-loss, Brier, ECE, reliability), then hash-chained forward shadow tracking. Rejections are kept as first-class results.',
      },
      {
        title: 'How decisions are gated',
        body: 'Five independent gates — EV margin, uncertainty cap, quiet-market veto, liquidity-stress veto, magnitude-clears-cost. A BUY or SELL requires all five to pass simultaneously. Today, the uncertainty gate binds essentially every minute: the machine abstains by arithmetic, not by accident.',
      },
    ],
  },
  topology: {
    eyebrow: '02 · Architecture',
    h2: 'The system, as it actually connects.',
    lede: 'Every node below is a real component with a measured role. Edges are verified information flow, not decoration. Click any node for its internals; scroll to zoom, drag to pan.',
    legend: {
      class: 'Node color = component class',
      lineage: 'Outer ring = model lineage',
      activity: 'Core brightness = activity level',
      stale: 'Amber dot = input older than 30 min at snapshot time',
      flow: 'Animated edges carry live data at snapshot time',
    },
    hint: 'Click a node · scroll to zoom · drag to pan',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    reset: 'Reset view',
    lineageTitle: 'Model lineage',
    lineages: {
      huber: 'huber — direction head family (huber_multi_v1)',
      mfe: 'mfe — maximum-favorable-excitation head family (mfe_multi_v1)',
      spread: 'spread — online execution-cost estimator (no model artifact)',
      nomodel: 'no model — applicability-gated heuristics, honest N/A rows',
    },
    sectionLabels: {
      perception: 'PERCEPTION',
      decision: 'DECISION',
      learning: 'LEARNING LOOP — challenger promotion is evidence-gated, never automatic',
    },
    nodes: {
      'market-data': {
        label: 'MARKET DATA',
        detail: 'BTCTMN 1m/5m candles plus micro top-of-book rollups feed the pipeline; the snapshot carries thousands of 5-minute closes.',
      },
      features: {
        label: 'FEATURES ×25',
        detail: '25 standardized columns (8 local returns/volatilities + 17 micro rollups), standardized by training-set statistics. Registry-verified 25/25.',
      },
      state: {
        label: 'STATE ENGINE',
        detail: 'A rule cascade with frozen thresholds distills perception into one market state that conditions everything downstream.',
      },
      router: {
        label: 'ROUTER v1',
        detail: 'State-conditional expert weights. Measured decorative on the direction path (ablation: zero action flips); only the surface nudge ±0.10 is consumed.',
      },
      fusion: {
        label: 'FUSION',
        detail: 'Assembles the decision numbers: P(up), P(move > break-even), expected magnitude, quantiles, uncertainty.',
      },
      uncertainty: {
        label: 'UNCERTAINTY',
        detail: 'Aleatoric (irreducible) and epistemic (model) uncertainty priced alongside every prediction. Aleatoric is currently saturated at 1.0 — the honest statement that point predictions cannot clear the cost of acting.',
      },
      policy: {
        label: 'POLICY + 5 GATES',
        detail: 'Deterministic expected-value argmax with five simultaneous gates. Selected action and reason codes are written to the ledger with every decision.',
      },
      ledger: {
        label: 'DECISION LEDGER',
        detail: 'Append-only, immutable. Authority: NONE_PAPER_SHADOW — the decision layer has zero execution authority by design.',
      },
      outcomes: {
        label: 'OUTCOME LEDGER',
        detail: 'Realized results join at maturity (+30/+60 min) only. No hindsight leaks into historical views.',
      },
      attribution: {
        label: 'ERROR ATTRIBUTION',
        detail: 'Matured outcomes become a taxonomy of errors and regret, attributed to layers (experts, state, gates, fusion).',
      },
      learning: {
        label: 'BRAIN / LEARNING',
        detail: 'The knowledge system: episodes, 329 open hypotheses, ranked controller recommendations — all RECOMMENDATION_ONLY.',
      },
      experiments: {
        label: 'EXPERIMENT LADDER',
        detail: 'Pre-registered challenger experiments with mechanical verdict gates. EXP-004 is the only challenger currently beating control on all proper scores — it continues in shadow, promoted by nothing but evidence.',
      },
    },
    statusTitle: 'Component status at snapshot time',
    statusNote: 'Infrastructure health and predictive quality are different things — the lab keeps them visually and rhetorically separate.',
  },
  replay: {
    eyebrow: '03 · Guided decision replay',
    h2: 'One decision, end to end.',
    lede: 'A real, frozen decision from the live shadow ledger — replayed scene by scene with its actual numbers. The outcome is revealed only at its maturity step, exactly as the system itself was allowed to see it.',
    epochTag: 'EPOCH: LIVE-FORWARD SHADOW (REAL LEDGER ROW)',
    pick: 'Replay another decision',
    pickHint: 'Each entry is a real ledger row; red/green shows the matured outcome.',
    controls: {
      play: 'Play',
      pause: 'Pause',
      prev: 'Previous scene',
      next: 'Next scene',
      restart: 'Restart',
      scene: 'Scene',
      of: 'of',
    },
    scenes: {
      event: {
        title: 'Market event',
        body: 'The market emits its constant stream — trades, quotes, spread. At {time}, the perception cycle samples it and a decision cycle begins.',
      },
      data: {
        title: 'Data & freshness',
        body: 'Inputs are timestamped and freshness-checked before anything else happens. The 5-minute close grid and micro rollups feeding this decision were minutes old — the machine records what it knew, and when.',
      },
      state: {
        title: 'Perception — market state',
        body: 'The state engine collapses perception into one word. Here: {state}. That single state conditions which experts speak and how loudly.',
      },
      experts: {
        title: 'Nine experts speak',
        body: 'Each expert publishes its estimate for this state. Weights come from the router; the disagreement between them is itself recorded.',
      },
      fusion: {
        title: 'Router & fusion',
        body: 'Fusion assembles the decision numbers: P(up) = {pUp}, P(move > break-even) = {pBig}, expected magnitude {eAbs} bps against a break-even cost of {be} bps.',
      },
      uncertainty: {
        title: 'Uncertainty is priced',
        body: 'Aleatoric {aleatoric}, epistemic {epistemic}. With aleatoric saturated, the machine is stating: the remaining randomness is larger than any edge it can claim.',
      },
      gates: {
        title: 'The five gates vote',
        body: 'Every gate must pass for action. Here the binding gates are {bindingGates} — the arithmetic refuses to manufacture confidence.',
      },
      decision: {
        title: 'Decision',
        body: '{action}. Reason codes: {reasons}. The decision, its inputs, and its reasoning are written to the immutable ledger — authority: paper shadow only.',
      },
      outcome: {
        title: 'Outcome — at maturity only',
        body: 'Horizon reached. Realized move: {y} bps. The machine could not see this number when it decided — and neither could this replay, until now.',
      },
      evaluation: {
        title: 'Evaluation',
        body: 'The outcome joins the error ledger: taxonomy {taxonomy}. Attribution and regret feed the Brain as evidence — this is how a refusal becomes knowledge.',
      },
    },
    footerNote: 'Pause, step, and replay are yours; the numbers never change. This is a read-only artifact of a real decision.',
  },
  decisions: {
    eyebrow: '04 · Prediction & expert intelligence',
    h2: 'Real outputs, real limits.',
    lede: 'The 240 most recent decisions ship with full internals. Browse them: every field below is a measured value from the ledger — never an invented confidence score.',
    listTitle: 'Frozen decisions (latest 240, full internals)',
    pickHint: 'Select a row to open its anatomy.',
    fields: {
      freshness: 'Input freshness',
      participants: 'Participating experts',
      model: 'Model & version',
      prediction: 'Prediction',
      uncertainty: 'Uncertainty',
      disagreement: 'Expert disagreement',
      action: 'Decision',
      reasons: 'Reason codes',
      evidence: 'Supporting evidence',
      limits: 'Limitations',
      outcome: 'Matured outcome',
      cost: 'Execution cost',
      evLong: 'EV long',
      evSell: 'EV sell',
    },
    limitsBody:
      'Direction skill is currently NOT established: proper scores sit at or below a constant baseline. Opportunity ranking shows real separation. Confidence values are model outputs with saturated aleatoric uncertainty — treat them as calibrated guesses under a noise floor, not as tradeable signals.',
    evidenceBody:
      'Every value traces to the sanitized snapshot artifact generated from the immutable ledgers (see Evidence section for validity metrics and windows).',
    noOutcome: 'not yet matured at snapshot time',
  },
  brainSection: {
    eyebrow: '05 · Brain & knowledge',
    h2: 'A knowledge system that never touches the trade.',
    lede: 'The Brain is a separate loop: matured outcomes become episodes; episodes become error attribution; attribution becomes ranked hypotheses. It has no runtime link into the decision path — its only route into policy is through the owner, on evidence.',
    statsTitle: 'The knowledge loop, in numbers',
    episodesTitle: 'Learning activity — episodes by day',
    episodesNote: 'Activity is not improvement. Episodes show the loop is alive; only pre-registered experiments with forward evidence show it learning.',
    attributionTitle: 'Regret attribution by layer (14-day window)',
    attributionNote: 'Where the machine assigns blame for its misses — experts, state, gates, fusion, or missing information.',
    queueTitle: 'Open hypotheses',
    queueNote: 'Internal hypothesis texts are withheld from this public artifact; counts, statuses, and the promotion discipline remain visible.',
    recommendationsTitle: 'Controller recommendations (advisory only)',
    recommendationsNote: 'Every recommendation carries authority: RECOMMENDATION_ONLY — it requires owner approval plus the frozen challenger ladder before anything changes.',
    twoLoopsTitle: 'Two loops, strictly separated',
    twoLoopsBody:
      'The decision loop (market → features → heads → fusion → policy → ledger) never reads or writes the Brain at runtime — verified at the code level. The learning loop (outcomes → episodes → attribution → hypotheses → experiments) feeds back only through the owner. This separation is why the lab can be public: observation cannot perturb what it observes.',
  },
  models: {
    eyebrow: '06 · Models & evaluation',
    h2: 'The registry, the audits, the honest scores.',
    lede: 'Historical training is not live inference, and neither is validation. This section separates the three: what artifacts exist, what the frozen audits measured, and what the experiment ladder has and has not established.',
    registryTitle: 'Model registry (versions frozen at decision time)',
    registryNote: 'Heads are immutable artifacts, hash-pinned in every ledger row. Live inference uses these exact bytes; nothing retrains from public traffic.',
    auditTitle: 'Frozen audits',
    audits: {
      forwardValidity: {
        title: 'Forward validity (2026-10-09)',
        body: 'Measured on matured outcomes joined at horizon: direction AUC, opportunity AUC/Brier with calibration deciles, magnitude rank correlation, uncertainty-vs-error correlation, cost versus break-even.',
      },
      uncertainty: {
        title: 'Uncertainty audit (2026-10-08)',
        body: 'Aleatoric saturation: the fraction of rows pinned at 1.0, interval widths versus 2× break-even, epistemic by state, gate-fail rates, top reason codes.',
      },
      expertCorrelation: {
        title: 'Expert duplication (2026-10-08)',
        body: 'Top |ρ| pairs among expert outputs. Pairs at ρ = 1.0 publish the same estimate under two names — effective expert count is materially below nine.',
      },
      routerAblation: {
        title: 'Router ablation (2026-10-08)',
        body: 'Exact replay with the router removed, the surface nudge removed, magnitude blended, and micro weight doubled — zero action flips in any variant. The router is currently decorative on the action path.',
      },
      fusionInvariants: {
        title: 'Fusion invariants (2026-10-08)',
        body: 'Mechanical checks that fusion outputs stay within their defined domains; violations counted, not assumed.',
      },
    },
    matrixTitle: 'What is — and is not — established',
    matrixNote: 'Every row cites its window and n. Verdicts use the system’s own vocabulary: REJECT means a challenger lost to control; DATA_LIMITED means the window cannot support a verdict; STRUCTURAL means the behavior is forced by construction, not by the market.',
    matrixRows: [
      { claim: 'Direction probabilities beat a constant 0.5 baseline on proper scores', verdict: 'NOT_ESTABLISHED' },
      { claim: 'Opportunity probabilities (P of a break-even-clearing move) discriminate big moves', verdict: 'PARTIAL' },
      { claim: 'Opportunity probabilities are calibrated (control fusion)', verdict: 'NOT_ESTABLISHED' },
      { claim: 'EXP-004 base-rate challenger beats control on all four proper-score gates (forward shadow)', verdict: 'VALIDATED' },
      { claim: 'Expected magnitude ranks realized magnitude', verdict: 'NOT_ESTABLISHED' },
      { claim: 'Uncertainty correlates with realized error', verdict: 'STRUCTURAL' },
      { claim: 'The near-100% abstention rate is market-driven', verdict: 'STRUCTURAL' },
      { claim: 'The nine experts carry materially distinct information', verdict: 'NOT_ESTABLISHED' },
      { claim: 'The router changes outcomes on the action path', verdict: 'REJECTED' },
      { claim: 'Net trading profitability has been demonstrated', verdict: 'NOT_ESTABLISHED' },
      { claim: 'The closed learning loop runs end-to-end (observe → … → verdict)', verdict: 'VALIDATED' },
    ],
    verdicts: {
      VALIDATED: 'validated',
      PARTIAL: 'partial',
      DATA_LIMITED: 'data-limited',
      NOT_ESTABLISHED: 'not established',
      STRUCTURAL: 'structural',
      REJECTED: 'rejected',
    },
    calibrationTitle: 'Calibration — predicted vs observed (deciles)',
    calibrationNote: 'On the diagonal = honest probabilities. Systematic distance from the diagonal is a defect, wherever it points.',
    qualityTitle: 'What model quality means here',
    qualityBody:
      'Proper scores (log-loss, Brier) are compared against a constant 0.5 predictor — the floor you get by always saying “coin flip”. Beating that floor on direction has NOT been established. Beating it on opportunity (big-move) ranking has, in the EXP-004 challenger. Seven-day windows are DATA_LIMITED: they prove the machine measures itself honestly, not that it has an edge.',
    trainVsLiveTitle: 'Historical training vs live inference',
    trainVsLiveBody:
      'The heads were trained once, on a frozen feature set, and hash-pinned. Since then they run inference only; no public request, no lab view, no experiment retrains or mutates them. The experiment ladder tests challengers in shadow — control stays control until a challenger earns promotion on forward evidence, and only the owner can promote.',
  },
  experimentsSection: {
    eyebrow: '07 · The experiment ladder',
    h2: 'Pre-registered. Mechanical. Frequently negative.',
    lede: 'Every experiment is registered with a frozen spec before evaluation, judged by fixed gates, then forward-tracked in a hash-chained ledger. Four of five to date were rejected — and are retained as knowledge. That is the discipline working.',
    verdictLabels: {
      REJECT: 'rejected',
      CONTINUE_SHADOW: 'continue in shadow',
      COLLECTING: 'collecting',
      PENDING: 'pending',
    },
    oneChange: 'The one change',
    gatesPassed: 'verdict gates',
    forwardRows: 'forward rows',
    specSha: 'spec SHA-256',
    timeline: 'Evidence timeline',
    negativeNote: 'Negative results are first-class evidence. The ladder exists to kill ideas cheaply, before they cost anything.',
  },
  safety: {
    eyebrow: '08 · Modes & safety',
    h2: 'What this lab can never do.',
    lede: 'The laboratory is a read-only projection of a system whose execution paths are structurally disabled. The constraints below are not policies that could be relaxed — they are properties of how the thing is built.',
    invariantsTitle: 'Standing invariants',
    invariants: [
      'Live execution OFF — REAL_EXECUTION=false, structurally, on the private system.',
      'Paper shadow only — every decision is recorded with authority NONE_PAPER_SHADOW; zero real orders have ever been submitted.',
      'No operational controls — the lab exposes observation only; there is no button anywhere that reaches the operating system.',
      'No retraining from public traffic — model heads are hash-pinned frozen artifacts; experiments run in shadow on the private system only.',
      'No secrets, no private data — the public artifact is sanitized at build time and machine-checked for internal identifiers, paths, and credentials.',
      'No live trading claims — no profitability has been established; the lab words its results to match the evidence exactly.',
    ],
    modesTitle: 'Two modes, one artifact',
    modesBody:
      'Guided Demo is deterministic and always available. Live Laboratory adds real freshness stamps and component status from the same snapshot — when the private system is unreachable, nothing breaks; the timestamps simply age, visibly.',
    disclosureTitle: 'Honesty disclosure',
    disclosureBody:
      'Previous prediction results did not establish reliable net trading profitability. The demonstration this lab makes is intelligent decision-making with disciplined evidence and abstention — a machine that knows when it does not know.',
  },
  dataNote: {
    title: 'Data provenance',
    body: 'All values come from one sanitized snapshot artifact, built read-only from the private system’s immutable ledgers and committed with this page. Internal identifiers are renamed; internal research texts are withheld; a machine check refuses to publish the artifact if any internal path, host, or credential-shaped string survives.',
    artifactHash: 'Artifact SHA-256',
    windowNote: 'Decision window: {days} days · horizons 30/60 min · market BTCTMN',
    fetchedFailed: 'status endpoint unavailable',
  },
  labels: {
    gates: {
      ev_margin: 'EV margin',
      uncertainty: 'Uncertainty cap',
      quiet_veto: 'Quiet veto',
      not_stressed: 'Not stressed',
      magnitude_clears: 'Magnitude clears cost',
    },
    states: {
      QUIET: 'Quiet',
      NORMAL: 'Normal',
      TRENDING: 'Trending',
      VOLATILE: 'Volatile',
      LIQUIDITY_STRESSED: 'Liquidity stress',
      MICRO_EVENT: 'Micro event',
    },
    actions: {
      NO_TRADE: 'NO-TRADE (abstain)',
      BUY: 'BUY',
      SELL: 'SELL',
      SELL_EXISTING_INVENTORY: 'SELL INVENTORY',
    },
    units: {
      'decision-engine': 'Decision engine',
      'market-data': 'Market data',
      'micro-events': 'Micro events',
      'brain-mind-cycle': 'Brain mind-cycle',
      'brain-api': 'Brain API',
      'readout-timer': 'Readout timer',
    },
    experts: {
      micro_direction: { name: 'Micro Direction', role: 'Short-horizon direction probability from micro rollups.' },
      return_surface: { name: 'Return Surface', role: 'Conditional return surface; supplies the ±0.10 fusion nudge.' },
      magnitude: { name: 'Magnitude', role: 'Expected absolute move size (bps) per horizon.' },
      large_move: { name: 'Large Move', role: 'Probability of moves clearing break-even (MFE head).' },
      path: { name: 'Path', role: 'Path-shape plausibility between quantiles.' },
      execution: { name: 'Execution', role: 'Round-trip cost estimate from live spread; gates EV arithmetic.' },
      global_dislocation: { name: 'Global Dislocation', role: 'Cross-market dislocation applicability check.' },
      event_l2: { name: 'Event L2', role: 'Order-book event detector (applicability-gated).' },
      maker_fill: { name: 'Maker Fill', role: 'Maker-fill risk on resting orders (applicability-gated).' },
    },
    lineageNames: {
      huber: 'huber',
      mfe: 'mfe',
      spread: 'spread',
      nomodel: 'no model',
    },
    active: 'active',
    inactive: 'inactive',
    restarts: 'restarts',
    systemLoad: 'system load',
    binding: 'binding',
    passing: 'passing',
    blocked: 'blocked',
  },
} as const;
