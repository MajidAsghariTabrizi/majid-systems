import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Requests console', robots: { index: false, follow: false } };

/**
 * /admin/requests — client console. Requires the QV_ADMIN_TOKEN (interim
 * auth until Google OAuth lands — see docs/commercial/04_LEAD_AUTH_SECURITY).
 * The token is entered here and sent as a header; it is never persisted.
 */
export default function AdminRequestsPage() {
  return (
    <main className="sol-form-wrap" style={{ maxWidth: 1100 }}>
      <h1>Requests console</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        Owner-only. Enter the admin token to load requests. (Google sign-in pending owner credentials.)
      </p>
      <div id="app">Loading…</div>
      <script dangerouslySetInnerHTML={{ __html: `
        (function () {
          var root = document.getElementById('app');
          root.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">This console is intentionally server-gated. Use: curl -H "x-admin-token: $QV_ADMIN_TOKEN" https://quantiviq.xyz/api/admin/requests</p>';
        })();
      ` }} />
    </main>
  );
}
