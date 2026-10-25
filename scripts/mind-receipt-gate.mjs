/** Receipt gate: real GLM answer through the public HTTPS gateway. */
const r = await fetch('https://quantiviq.xyz/api/public-mind/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session: 'receipt-verify-98765432',
    locale: 'en',
    messages: [{ role: 'user', content: 'What is the Organization OS? One sentence.' }],
  }),
});
const t = await r.text();
const m = t.match(/event: done\ndata: (.*)/);
const d = m ? JSON.parse(m[1]) : {};
const ans = (t.match(/event: delta\ndata: (.*)/g) || []).length;
console.log(`http=${r.status} status=${d.status} deltas=${ans} tokens=${d.usage?.total_tokens}`);
process.exit(r.status === 200 && d.status === 'ok' && (d.usage?.total_tokens ?? 0) > 100 ? 0 : 1);
