import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  appendLead,
  deleteLead,
  getLead,
  listLeads,
  purgeOlderThan,
  storageHealth,
  type LeadRecord,
} from '../src/lib/lead/store';
import { deliverOwnerNotification, outboxPending, renderOwnerNotification, smtpConfigured } from '../src/lib/lead/notify';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qv-leads-'));
}

function rec(id: string, createdAt: string, over: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id,
    createdAt,
    locale: 'en',
    intent: 'diagnostic',
    fields: {
      name: 'T',
      email: 't@example.com',
      org: '',
      website: '',
      role: '',
      message: 'm',
      preferred: 'email',
      preferredLink: '',
    },
    ipHash: 'x',
    status: 'stored',
    notify: 'pending',
    ...over,
  };
}

test('append + list + get round-trip', () => {
  const d = tmpDir();
  appendLead(rec('QV-1', '2026-01-01T00:00:00Z'), d);
  appendLead(rec('QV-2', '2026-01-02T00:00:00Z'), d);
  assert.equal(listLeads(d).length, 2);
  assert.equal(getLead('QV-1', d)?.id, 'QV-1');
  assert.equal(getLead('nope', d), undefined);
});

test('delete removes exactly the target record', () => {
  const d = tmpDir();
  appendLead(rec('QV-1', '2026-01-01T00:00:00Z'), d);
  appendLead(rec('QV-2', '2026-01-02T00:00:00Z'), d);
  assert.equal(deleteLead('QV-1', d), true);
  assert.equal(deleteLead('QV-1', d), false);
  const left = listLeads(d);
  assert.equal(left.length, 1);
  assert.equal(left[0].id, 'QV-2');
  // file is valid JSONL after rewrite
  const lines = fs.readFileSync(path.join(d, 'leads.jsonl'), 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
});

test('purge respects the retention window (24 months default)', () => {
  const d = tmpDir();
  appendLead(rec('QV-old', '2023-01-01T00:00:00Z'), d); // > 3y before 2026-10
  appendLead(rec('QV-recent', '2026-09-01T00:00:00Z'), d);
  const purged = purgeOlderThan(24, d, new Date('2026-10-18T00:00:00Z'));
  assert.equal(purged, 1);
  assert.equal(listLeads(d)[0].id, 'QV-recent');
});

test('storageHealth reports writable on a creatable dir', () => {
  assert.equal(storageHealth(tmpDir()), 'writable');
});

test('notify: TEST transport succeeds without disk/network', async () => {
  process.env.QV_NOTIFY_TRANSPORT = 'test';
  const r = await deliverOwnerNotification(rec('QV-t', '2026-01-01T00:00:00Z'));
  assert.deepEqual(r, { channel: 'test', delivered: true });
  delete process.env.QV_NOTIFY_TRANSPORT;
});

test('notify: renders an actionable owner message', () => {
  const r = rec('QV-render', '2026-01-01T00:00:00Z');
  const m = renderOwnerNotification(r);
  assert.ok(m.subject.includes('[quantiviq lead]'));
  assert.ok(m.subject.includes(r.fields.name));
  assert.ok(m.text.includes(r.id));
  assert.ok(m.text.includes('delete ' + r.id));
});

test('notify: SMTP unconfigured → smtpConfigured false, health falls back', () => {
  const hadHost = process.env.SMTP_HOST;
  const hadMail = process.env.LEAD_NOTIFY_EMAIL;
  delete process.env.SMTP_HOST;
  delete process.env.LEAD_NOTIFY_EMAIL;
  assert.equal(smtpConfigured(), false);
  if (hadHost) process.env.SMTP_HOST = hadHost;
  if (hadMail) process.env.LEAD_NOTIFY_EMAIL = hadMail;
});

test('outbox pending count reflects the outbox file', () => {
  const d = tmpDir();
  process.env.QV_LEAD_OUTBOX = d;
  assert.equal(outboxPending(), 0);
  fs.writeFileSync(path.join(d, 'outbox.jsonl'), '{"x":1}\n{"x":2}\n');
  assert.equal(outboxPending(), 2);
  delete process.env.QV_LEAD_OUTBOX;
});
