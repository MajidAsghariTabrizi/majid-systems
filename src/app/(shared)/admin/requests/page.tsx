'use client';

import { useCallback, useState } from 'react';

/**
 * /admin/requests — minimal operator console over /api/admin/requests.
 * INTERIM AUTH: token (QV_ADMIN_TOKEN) is entered by the operator, kept ONLY
 * in component state (never URL, localStorage, logs or the bundle) and sent
 * as the x-admin-token header. No lead data renders before authorization
 * succeeds. Google sign-in remains a separate, owner-credential-gated task.
 */
type Req = {
  id: string; createdAt: string; locale: string; intent: string;
  solution: string | null; source: string | null; name: string; email: string;
  phone: string | null; org: string; message: string; notify: string; pipeline: string;
};
type Summary = {
  total: number;
  byStatus: Record<string, number>;
  notify: { channel: string; outboxPending: number; pendingRecords: number; failed: number };
};
const STATUSES = ['new', 'contacted', 'discovery', 'proposal_sent', 'won', 'lost'] as const;

export default function AdminRequestsPage() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Req[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async (t: string) => {
    setError('');
    try {
      const res = await fetch('/api/admin/requests', { headers: { 'x-admin-token': t } });
      if (res.status === 401) { setAuthed(false); setRows(null); setError('Unauthorized — check the token.'); return; }
      const data = (await res.json()) as { ok: boolean; requests?: Req[]; summary?: Summary };
      if (!res.ok || !data.ok || !data.requests) { setError('Load failed.'); return; }
      setAuthed(true);
      setRows(data.requests);
      setSummary(data.summary ?? null);
    } catch {
      setError('Network error.');
    }
  }, []);

  async function setStatus(id: string, status: string) {
    if (!token) return;
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) { setError('Update rejected.'); return; }
      setRows((r) => (r ?? []).map((x) => (x.id === id ? { ...x, pipeline: status } : x)));
      setError('');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="sol-form-wrap" style={{ maxWidth: 1100 }}>
      <h1>Requests console</h1>
      {!authed ? (
        <form onSubmit={(e) => { e.preventDefault(); void load(token); }} className="sol-field" style={{ maxWidth: 420 }}>
          <label htmlFor="adm-token">Admin token</label>
          <input id="adm-token" type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" />
          {error ? <span className="err" role="alert">{error}</span> : null}
          <button className="sol-submit" type="submit">Unlock</button>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Token stays in memory for this tab only. API-only operation is also supported:
            curl -H &quot;x-admin-token: …&quot; /api/admin/requests. Google sign-in is pending owner credentials (documented, not fake).
          </p>
        </form>
      ) : (
        <div>
          <p style={{ fontSize: 14 }}>
            <strong>{rows?.length ?? 0}</strong> request(s)
            {summary ? <> · notify channel <strong>{summary.notify.channel}</strong> · outbox pending <strong>{summary.notify.outboxPending}</strong> · failed <strong>{summary.notify.failed}</strong></> : null}
          </p>
          {error ? <p className="err" role="alert">{error}</p> : null}
          <table className="sol-admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th align="left">Received</th><th align="left">Status</th><th align="left">Solution</th>
                <th align="left">Company</th><th align="left">Contact</th><th align="left">Notify</th><th align="left">Source</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #ddd' }}>
                  <td>{r.createdAt.slice(0, 16).replace('T', ' ')}</td>
                  <td>
                    <select value={r.pipeline} disabled={busyId === r.id} onChange={(e) => void setStatus(r.id, e.target.value)} aria-label={'Status for ' + r.id}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{r.solution ?? r.intent}</td>
                  <td>{r.org || '—'}</td>
                  <td>{r.name} · {r.email}{r.phone ? ' · ' + r.phone : ''}</td>
                  <td>{r.notify}</td>
                  <td>{r.source ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
