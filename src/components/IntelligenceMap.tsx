/**
 * IntelligenceMap — the site's signature visual (2026-10-29).
 * An art-directed organizational intelligence diagram: central shared-
 * knowledge hub, human decision authority above it, three bounded agent
 * nodes below, and a visible signal-to-learning path. Pure SVG, no JS,
 * reduced-motion safe (CSS animation only, disabled under prefers-
 * reduced-motion). Decorative — hidden from AT; meaning lives in copy.
 */
export function IntelligenceMap() {
  return (
    <svg
      className="intel-map"
      viewBox="0 0 560 480"
      role="img"
      aria-label="Organizational intelligence map: a signal enters, flows through shared knowledge, a human authority gate approves, bounded agents execute, and the measured result returns to the knowledge hub as learning."
    >
      <defs>
        <radialGradient id="im-hub" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor="#eef6ee" />
          <stop offset="100%" stopColor="#d8ecdd" />
        </radialGradient>
        <marker id="im-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#53645d" />
        </marker>
      </defs>

      {/* signal-to-learning path (the visible loop) */}
      <path
        className="im-loop"
        d="M60,300 C110,180 200,120 280,150"
        fill="none"
        stroke="#53645d"
        strokeWidth="1.6"
        strokeDasharray="5 6"
        markerEnd="url(#im-arrow)"
      />
      <path
        d="M300,330 C360,360 420,330 470,240 C440,320 360,380 300,345 Z"
        fill="none"
        stroke="#b65e37"
        strokeWidth="1.4"
        strokeDasharray="2 5"
        opacity="0.7"
      />

      {/* signal origin */}
      <g transform="translate(60,300)">
        <circle r="26" fill="#f7f6f0" stroke="#163f37" strokeWidth="1.4" />
        <path d="M-7,3 L0,-6 L7,3" fill="none" stroke="#163f37" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="0" cy="7" r="1.6" fill="#163f37" />
        <text y="44" textAnchor="middle" className="im-t">signal</text>
      </g>

      {/* human authority gate (top) */}
      <g transform="translate(280,96)">
        <rect x="-58" y="-26" width="116" height="52" rx="14" fill="#163f37" />
        <circle cx="-32" cy="0" r="9" fill="none" stroke="#bce7d2" strokeWidth="1.6" />
        <circle cx="-32" cy="-2.4" r="2.6" fill="#bce7d2" />
        <path d="M-39,5 a7,7 0 0 1 14,0" fill="none" stroke="#bce7d2" strokeWidth="1.6" />
        <text x="12" y="-3" textAnchor="middle" className="im-t2">human</text>
        <text x="12" y="13" textAnchor="middle" className="im-t2">authority</text>
      </g>

      {/* central knowledge hub */}
      <g transform="translate(280,250)">
        <circle r="74" fill="url(#im-hub)" stroke="#163f37" strokeWidth="1.6" />
        <circle r="52" fill="none" stroke="#bce7d2" strokeWidth="1.2" />
        <text y="-6" textAnchor="middle" className="im-h">shared</text>
        <text y="12" textAnchor="middle" className="im-h">knowledge</text>
        <text y="32" textAnchor="middle" className="im-t">decisions · evidence · state</text>
      </g>

      {/* bounded agents */}
      {[{ x: 120, l: 'agent A' }, { x: 280, l: 'agent B' }, { x: 440, l: 'agent C' }].map((a) => (
        <g key={a.l} transform={'translate(' + a.x + ',400)'}>
          <rect x="-46" y="-22" width="92" height="44" rx="12" fill="#ffffff" stroke="#53645d" strokeWidth="1.2" />
          <rect x="-38" y="-12" width="20" height="4" rx="2" fill="#bce7d2" />
          <rect x="-38" y="-2" width="34" height="4" rx="2" fill="#e4e8e1" />
          <rect x="-38" y="8" width="26" height="4" rx="2" fill="#e4e8e1" />
          <circle cx="32" cy="0" r="5" fill="none" stroke="#b65e37" strokeWidth="1.4" />
          <text y="-32" textAnchor="middle" className="im-t">{a.l}</text>
        </g>
      ))}

      {/* hub links */}
      <line x1="280" y1="124" x2="280" y2="174" stroke="#53645d" strokeWidth="1.4" />
      <line x1="238" y1="292" x2="166" y2="378" stroke="#53645d" strokeWidth="1.2" strokeDasharray="3 4" />
      <line x1="280" y1="326" x2="280" y2="376" stroke="#53645d" strokeWidth="1.2" />
      <line x1="322" y1="292" x2="394" y2="378" stroke="#53645d" strokeWidth="1.2" strokeDasharray="3 4" />

      {/* learning return */}
      <text x="470" y="286" textAnchor="middle" className="im-t" fill="#b65e37">learning</text>
    </svg>
  );
}
