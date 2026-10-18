/**
 * leads-tool — retention & deletion operations for the lead store.
 *   node scripts/leads-tool.mjs list [--intent <key>] [--locale en|fa]
 *   node scripts/leads-tool.mjs get <QV-ID>
 *   node scripts/leads-tool.mjs delete <QV-ID>
 *   node scripts/leads-tool.mjs purge [--months 24] [--dry-run]
 *   node scripts/leads-tool.mjs outbox [--clear]
 *
 * Privacy policy: records are deleted on request (delete <id>) and purged
 * after 24 months (purge). Use --dry-run to preview.
 */
import { parseArgs } from 'node:util';

import { deleteLead, listLeads, purgeOlderThan } from '../src/lib/lead/store.ts';
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
      if (fs.existsSync(p)) fs.writeFileSync(p, '', 'utf8');
      console.log('outbox cleared');
      break;
    }
    if (!fs.existsSync(p)) { console.log('outbox empty'); break; }
    const lines = fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim() !== '');
    console.log(`${lines.length} queued notification(s)`);
    for (const l of lines) {
      const j = JSON.parse(l);
      console.log(`  ${j.queuedAt}  ${j.leadId}  ${j.subject}`);
    }
    break;
  }
  default:
    console.log('usage: node scripts/leads-tool.mjs <list|get|delete|purge|outbox> [options]');
    process.exit(cmd ? 1 : 0);
}
