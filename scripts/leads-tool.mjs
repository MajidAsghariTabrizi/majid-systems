/**
 * leads-tool — retention & deletion operations for the lead store.
 *   node scripts/leads-tool.mjs list [--intent <key>] [--locale en|fa]
 *   node scripts/leads-tool.mjs get <QV-ID>
 *   node scripts/leads-tool.mjs delete <QV-ID>
 *   node scripts/leads-tool.mjs purge [--months 24] [--dry-run]
 *   node scripts/leads-tool.mjs outbox [--clear]
 *   node scripts/leads-tool.mjs flush [--dry-run] [--max N]   ← replay queued owner notifications
 *
 * flush: successes are ACKED (removed); failures keep the job with attempts
 * and lastError. Requires SMTP_* + LEAD_NOTIFY_EMAIL (or QV_NOTIFY_TRANSPORT
 * for tests). Dry-run sends NOTHING and mutates NOTHING.
 *
 * Privacy policy: records are deleted on request (delete <id>) and purged
 * after 24 months (purge). Use --dry-run to preview.
 */
import { parseArgs } from 'node:util';

import { deleteLead, listLeads, purgeOlderThan } from '../src/lib/lead/store.ts';
import { flushOutbox, readOutboxJobs, smtpConfigured } from '../src/lib/lead/notify.ts';
import fs from 'node:fs';
import path from 'node:path';

const [cmd, ...rest] = process.argv.slice(2);

function outboxFile() {
  const dir = process.env.QV_LEAD_OUTBOX ?? process.env.QV_LEAD_DATA ?? path.join(process.cwd(), '.data');
  return path.join(dir, 'outbox.jsonl');
}

switch (cmd) {
  case 'list': {
    const { values } = parseArgs({ args: rest, options: { intent: { type: 'string' }, locale: { type: 'string' } } });
    let rows = listLeads();
    if (values.intent) rows = rows.filter((r) => r.intent === values.intent);
    if (values.locale) rows = rows.filter((r) => r.locale === values.locale);
    console.log(`${rows.length} lead(s)`);
    for (const r of rows) {
      console.log(`${r.createdAt}  ${r.id}  [${r.locale}] ${r.intent}  ${r.fields.email}  notify=${r.notify}`);
    }
    break;
  }
  case 'get': {
    const id = rest[0];
    const r = listLeads().find((x) => x.id === id);
    if (!r) { console.error('not found'); process.exit(1); }
    console.log(JSON.stringify(r, null, 2));
    break;
  }
  case 'delete': {
    const id = rest[0];
    if (!id) { console.error('usage: delete <QV-ID>'); process.exit(1); }
    console.log(deleteLead(id) ? `deleted ${id}` : `not found: ${id}`);
    break;
  }
  case 'purge': {
    const { values } = parseArgs({ args: rest, options: { months: { type: 'string', default: '24' }, 'dry-run': { type: 'boolean' } } });
    const months = Number(values.months);
    const all = listLeads();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const stale = all.filter((r) => new Date(r.createdAt) <= cutoff);
    console.log(`retention window: ${months} months; stale: ${stale.length}`);
    for (const r of stale) console.log(`  would delete ${r.id} (${r.createdAt})`);
    if (!values['dry-run']) {
      const purged = purgeOlderThan(months);
      console.log(`purged ${purged} record(s)`);
    } else {
      console.log('(dry run — nothing deleted)');
    }
    break;
  }
  case 'outbox': {
    const { values } = parseArgs({ args: rest, options: { clear: { type: 'boolean' } } });
    const p = outboxFile();
    if (values.clear) {
      // WARNING: clear drops queued notification jobs WITHOUT delivering them.
      // Use `flush` to deliver. Clear is reserved for operator-discarded test noise.
      if (fs.existsSync(p)) fs.writeFileSync(p, '', 'utf8');
      console.log('outbox cleared (jobs dropped without delivery — prefer flush)');
      break;
    }
    if (!fs.existsSync(p)) { console.log('outbox empty'); break; }
    const lines = fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim() !== '');
    console.log(`${lines.length} queued notification(s)`);
    for (const l of lines) {
      const j = JSON.parse(l);
      console.log(`  ${j.queuedAt}  ${j.leadId}${j.attempts ? `  attempts=${j.attempts}` : ''}  ${j.subject}`);
    }
    break;
  }
  case 'flush': {
    const { values } = parseArgs({ args: rest, options: { 'dry-run': { type: 'boolean' }, max: { type: 'string' } } });
    const dryRun = Boolean(values['dry-run']);
    if (!smtpConfigured() && !process.env.QV_NOTIFY_TRANSPORT) {
      console.log('NOT RUN: no SMTP transport configured (set SMTP_HOST/PORT/USER/PASS/FROM + LEAD_NOTIFY_EMAIL).');
      console.log(`pending jobs: ${readOutboxJobs().length} (nothing lost, nothing sent)`);
      process.exit(2);
    }
    const jobsBefore = readOutboxJobs().length;
    const r = await flushOutbox({ dryRun, max: values.max ? Number(values.max) : undefined });
    console.log(`flush ${dryRun ? 'DRY-RUN' : 'EXECUTE'}: considered=${r.considered} sent=${r.sent} failed=${r.failed} skipped=${r.perJob.filter((j) => j.outcome === 'skipped').length} remaining=${r.remaining} (was ${jobsBefore})`);
    for (const j of r.perJob) console.log(`  ${j.outcome.toUpperCase().padEnd(7)} ${j.leadId}`);
    process.exit(r.failed > 0 ? 1 : 0);
  }
  default:
    console.log('usage: node scripts/leads-tool.mjs <list|get|delete|purge|outbox> [options]');
    process.exit(cmd ? 1 : 0);
}
