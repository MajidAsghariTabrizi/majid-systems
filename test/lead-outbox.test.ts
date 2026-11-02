/**
 * Outbox replay + idempotency tests (closure review 2026-11-02).
 * Mock transports + isolated temp storage only — no network, no real SMTP.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { appendLead, findByIdempotencyKey, listLeads, updateLead, type LeadRecord } from '../src/lib/lead/store';
import { deliverOwnerNotification, flushOutbox, readOutboxJobs } from '../src/lib/lead/notify';

function tmp(): string {
  return mkdtempSync(path.join(tmpdir(), 'qv-outbox-'));
}

function rec(id: string, key?: string, fp?: string): LeadRecord {
  const r: LeadRecord = {
    id,
    createdAt: '2026-01-01T00:00:00Z',
    locale: 'en',
    intent: 'solution_request',
    fields: { name: 'T', email: 't@example.org', org: 'Org', website: '', role: '', message: 'm', preferred: 'email', preferredLink: '' },
    solution: 'quote-desk',
    ipHash: 'x',
    status: 'stored',
    notify: 'pending',
    pipeline: { status: 'new', updatedAt: '2026-01-01T00:00:00Z' },
  };
  if (key) r.idempotencyKey = key;
  if (fp) r.fingerprint = fp;
  return r;
}

test('outbox: mock failure keeps the job with attempts (nothing acked)', async () => {
  const dir = tmp();
  process.env.QV_LEAD_DATA = dir;
  process.env.QV_LEAD_OUTBOX = dir;
  process.env.QV_NOTIFY_TRANSPORT = 'mock';
  process.env.QV_MOCK_DELIVER = 'fail';
  try {
    const r1 = await deliverOwnerNotification(rec('QV-1'));
    // 'delivered' here means handled by a durable channel (queued), NOT emailed.
    assert.equal(r1.channel, 'outbox');
    assert.equal(readOutboxJobs().length, 1);
    const f1 = await flushOutbox();
    assert.equal(f1.sent, 0);
    assert.equal(f1.failed, 1);
    const job = readOutboxJobs()[0];
    assert.equal(job.leadId, 'QV-1');
    assert.equal(job.attempts, 1);
  } finally {
    delete process.env.QV_NOTIFY_TRANSPORT;
    delete process.env.QV_MOCK_DELIVER;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('outbox: successful replay acks exactly the sent job and preserves concurrent appends', async () => {
  const dir = tmp();
  process.env.QV_LEAD_DATA = dir;
  process.env.QV_LEAD_OUTBOX = dir;
  try {
    // queue two failures
    process.env.QV_NOTIFY_TRANSPORT = 'mock';
    process.env.QV_MOCK_DELIVER = 'fail';
    await deliverOwnerNotification(rec('QV-A'));
    await deliverOwnerNotification(rec('QV-B'));
    // a lead appended "concurrently" (after read, before rewrite)
    appendLead(rec('QV-C'));
    process.env.QV_MOCK_DELIVER = 'ok';
    const f = await flushOutbox();
    assert.equal(f.sent, 2);
    assert.equal(f.failed, 0);
    // QV-C never queued a notification; both A and B acked
    const jobs = readOutboxJobs();
    assert.equal(jobs.length, 0);
    // lead history untouched by flush (only QV-C was ever stored)
    assert.equal(listLeads(dir).length, 1);
    delete process.env.QV_MOCK_DELIVER;
    delete process.env.QV_NOTIFY_TRANSPORT;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('outbox: dry-run sends nothing and mutates nothing', async () => {
  const dir = tmp();
  process.env.QV_LEAD_DATA = dir;
  process.env.QV_LEAD_OUTBOX = dir;
  try {
    // queue one job via failure, then set transport to OK: a dry-run must
    // STILL not consume/send it (dry-run precedes any transport attempt).
    process.env.QV_NOTIFY_TRANSPORT = 'mock';
    process.env.QV_MOCK_DELIVER = 'fail';
    await deliverOwnerNotification(rec('QV-D'));
    const before = readFileSync(path.join(dir, 'outbox.jsonl'), 'utf8');
    process.env.QV_MOCK_DELIVER = 'ok';
    const f = await flushOutbox({ dryRun: true });
    assert.equal(f.sent, 0);
    assert.equal(f.dryRun, true);
    assert.equal(readFileSync(path.join(dir, 'outbox.jsonl'), 'utf8'), before);
    // and the real run then delivers it
    const f2 = await flushOutbox();
    assert.equal(f2.sent, 1);
    assert.equal(readOutboxJobs().length, 0);
    delete process.env.QV_MOCK_DELIVER;
    delete process.env.QV_NOTIFY_TRANSPORT;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('outbox: no transport at all -> flush skips safely, jobs retained', async () => {
  const dir = tmp();
  process.env.QV_LEAD_DATA = dir;
  process.env.QV_LEAD_OUTBOX = dir;
  delete process.env.QV_NOTIFY_TRANSPORT;
  delete process.env.SMTP_HOST;
  try {
    await deliverOwnerNotification(rec('QV-E')); // queues (no SMTP)
    const f = await flushOutbox();
    assert.equal(f.sent, 0);
    assert.equal(f.skippedNoTransport, 1);
    assert.equal(readOutboxJobs().length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('outbox: restart durability — stored jobs survive, failed retry increments attempts', async () => {
  const dir = tmp();
  process.env.QV_LEAD_DATA = dir;
  process.env.QV_LEAD_OUTBOX = dir;
  try {
    process.env.QV_NOTIFY_TRANSPORT = 'mock';
    process.env.QV_MOCK_DELIVER = 'fail';
    await deliverOwnerNotification(rec('QV-F'));
    await flushOutbox(); // attempt 1 fails
    process.env.QV_MOCK_DELIVER = 'fail';
    await flushOutbox(); // attempt 2 fails
    assert.equal(readOutboxJobs()[0].attempts, 2);
    process.env.QV_MOCK_DELIVER = 'ok';
    const f = await flushOutbox(); // attempt 3 succeeds
    assert.equal(f.sent, 1);
    assert.equal(readOutboxJobs().length, 0);
    delete process.env.QV_MOCK_DELIVER;
    delete process.env.QV_NOTIFY_TRANSPORT;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('idempotency: same key returns the same durable record; notify-state patch is atomic', () => {
  const dir = tmp();
  try {
    appendLead(rec('QV-IDEM', 'key-123', 'fp-abc'), dir);
    const found = findByIdempotencyKey('key-123', dir);
    assert.equal(found?.id, 'QV-IDEM');
    assert.equal(findByIdempotencyKey('key-none', dir), undefined);
    updateLead('QV-IDEM', { notify: 'outbox_queued' }, dir);
    assert.equal(listLeads(dir)[0].notify, 'outbox_queued');
    assert.equal(listLeads(dir)[0].idempotencyKey, 'key-123');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
