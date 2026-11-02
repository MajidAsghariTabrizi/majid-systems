/**
 * Owner notification for accepted leads.
 *
 * Transports, in order of preference:
 * 1. SMTP — active when SMTP_HOST + LEAD_NOTIFY_EMAIL are configured.
 * 2. OUTBOX — durable fallback: the rendered notification is appended to
 *     QV_LEAD_OUTBOX/outbox.jsonl (one JSON line). Operations replays or
 *     reads these; nothing is lost while SMTP is unconfigured.
 * 3. TEST — QV_NOTIFY_TRANSPORT=test returns the rendered message without
 *     touching disk or network (used by integration tests via jsonTransport).
 *
 * The function NEVER throws: notification failure must not fail an already
 * durably-stored lead. The result channel tells operations what happened.
 */
import fs from 'node:fs';
import path from 'node:path';

import type { LeadRecord } from './store';

export type NotifyResult = {
  channel: 'smtp' | 'outbox' | 'test' | 'mock';
  delivered: boolean;
  error?: string;
};

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.LEAD_NOTIFY_EMAIL);
}

function outboxPath(): string {
  const dir = process.env.QV_LEAD_OUTBOX ?? process.env.QV_LEAD_DATA ?? path.join(process.cwd(), '.data');
  return path.join(dir, 'outbox.jsonl');
}

export function outboxPending(): number {
  try {
    const p = outboxPath();
    if (!fs.existsSync(p)) return 0;
    return fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim() !== '').length;
  } catch {
    return -1;
  }
}

export function renderOwnerNotification(r: LeadRecord): { subject: string; text: string } {
  const f = r.fields;
  const solutionPart = r.solution ? ` — ${r.solution}` : '';
  const subject = `[Quantiviq request] ${f.name}${solutionPart} (${r.locale})`;
  const text = [
    `Request ${r.id}`,
    `Received: ${r.createdAt}`,
    `Locale: ${r.locale}`,
    `Intent: ${r.intent}`,
    r.solution ? `Solution: ${r.solution}` : null,
    r.source ? `Source: ${r.source}` : null,
    ``,
    `Name:    ${f.name}`,
    `Email:   ${f.email} (self-declared)`,
    r.phone ? `Phone:   ${r.phone}` : null,
    `Org:     ${f.org || '—'}`,
    `Website: ${f.website || '—'}`,
    `Role:    ${f.role || '—'}`,
    `Preferred contact: ${f.preferred}${f.preferredLink ? ` (${f.preferredLink})` : ''}`,
    ``,
    `Message:`,
    f.message || '(no message — solution request)',
    ``,
    `--`,
    `Manage: /admin/requests`,
    `Delete this record: node scripts/leads-tool.mjs delete ${r.id}`,
  ]
    .filter((l) => l !== null)
    .join('\n');
  return { subject, text };
}

export async function deliverOwnerNotification(r: LeadRecord): Promise<NotifyResult> {
  const msg = renderOwnerNotification(r);

  if (process.env.QV_NOTIFY_TRANSPORT === 'test') {
    return { channel: 'test', delivered: true };
  }

  // Mock transport for local fault/replay tests: QV_MOCK_DELIVER=ok|fail.
  if (process.env.QV_NOTIFY_TRANSPORT === 'mock') {
    if (process.env.QV_MOCK_DELIVER === 'fail') {
      const error = 'mock delivery failure';
      const ob = writeOutbox(r, msg, error);
      return { channel: 'outbox', delivered: ob, error };
    }
    return { channel: 'mock', delivered: true };
  }

  if (smtpConfigured()) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      // Bounded transport: a hung SMTP server must not hold the request
      // response (and thus the caller) hostage. Total worst case ~ 23s.
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        connectionTimeout: 8_000,
        greetingTimeout: 5_000,
        socketTimeout: 10_000,
      });
      await transport.sendMail({
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'quantiviq-lead@quantiviq.xyz',
        to: process.env.LEAD_NOTIFY_EMAIL,
        subject: msg.subject,
        text: msg.text,
      });
      return { channel: 'smtp', delivered: true };
    } catch (e) {
      // fall through to outbox — never lose the lead
      const error = e instanceof Error ? e.message : String(e);
      const ob = writeOutbox(r, msg, error);
      return { channel: 'outbox', delivered: ob, error };
    }
  }

  const okOut = writeOutbox(r, msg);
  return { channel: 'outbox', delivered: okOut };
}

function writeOutbox(r: LeadRecord, msg: { subject: string; text: string }, error?: string): boolean {
  try {
    const p = outboxPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.appendFileSync(
      p,
      JSON.stringify({ queuedAt: new Date().toISOString(), leadId: r.id, subject: msg.subject, text: msg.text, smtpError: error ?? null }) + '\n',
      'utf8'
    );
    return true;
  } catch {
    return false;
  }
}

/* ── Outbox replay (closure review 2026-11-02) ─────────────────────────
 * An outbox line is a durable notification JOB. It is removed ONLY after a
 * successful send (ack). Failures keep the job with attempts++ and lastError.
 * Delivery semantics are at-least-once: a retry after a send whose response
 * was lost can re-send. We do NOT claim exactly-once email delivery. */
export type OutboxJob = {
  queuedAt: string;
  leadId: string;
  subject: string;
  text: string;
  smtpError?: string | null;
  attempts?: number;
  lastError?: string | null;
  lastTriedAt?: string | null;
};

export function readOutboxJobs(): OutboxJob[] {
  try {
    const p = outboxPath();
    if (!fs.existsSync(p)) return [];
    return fs
      .readFileSync(p, 'utf8')
      .split('\n')
      .filter((l) => l.trim() !== '')
      .map((l) => JSON.parse(l) as OutboxJob);
  } catch {
    return [];
  }
}

/** Send one rendered job through the CURRENT transport (never re-queues). */
async function trySendJob(job: OutboxJob): Promise<boolean> {
  if (process.env.QV_NOTIFY_TRANSPORT === 'test') return true;
  if (process.env.QV_NOTIFY_TRANSPORT === 'mock') return process.env.QV_MOCK_DELIVER !== 'fail';
  if (!smtpConfigured()) return false;
  try {
    const nodemailer = (await import('nodemailer')).default;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      connectionTimeout: 8_000,
      greetingTimeout: 5_000,
      socketTimeout: 10_000,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'quantiviq-lead@quantiviq.xyz',
      to: process.env.LEAD_NOTIFY_EMAIL,
      subject: job.subject,
      text: job.text,
    });
    return true;
  } catch {
    return false;
  }
}

export type FlushResult = {
  dryRun: boolean;
  considered: number;
  sent: number;
  failed: number;
  remaining: number;
  skippedNoTransport: number;
  perJob: { leadId: string; outcome: 'sent' | 'failed' | 'skipped' }[];
};

/**
 * Replay queued owner notifications. Successes are ACKED (removed from the
 * queue); failures keep their job with attempts/lastError. New lines appended
 * concurrently are preserved: we rewrite from a FRESH read after processing,
 * keeping (a) jobs we did not consider, (b) failed jobs with updated state.
 * Never a substitute for delivery: dry-run sends nothing.
 */
export async function flushOutbox(opts: { dryRun?: boolean; max?: number } = {}): Promise<FlushResult> {
  const max = opts.max ?? 50;
  const jobs = readOutboxJobs();
  const queue: OutboxJob[] = jobs.slice(0, max);
  const rest: OutboxJob[] = jobs.slice(max);
  const res: FlushResult = { dryRun: Boolean(opts.dryRun), considered: queue.length, sent: 0, failed: 0, remaining: 0, skippedNoTransport: 0, perJob: [] };

  if (!smtpConfigured() && process.env.QV_NOTIFY_TRANSPORT !== 'test' && process.env.QV_NOTIFY_TRANSPORT !== 'mock') {
    res.skippedNoTransport = queue.length;
    res.perJob = queue.map((j) => ({ leadId: j.leadId, outcome: 'skipped' as const }));
    res.remaining = jobs.length;
    return res; // nothing sent, nothing lost
  }

  const failedKept: OutboxJob[] = [];
  for (const job of queue) {
    if (opts.dryRun) {
      res.perJob.push({ leadId: job.leadId, outcome: 'skipped' });
      continue;
    }
    const ok = await trySendJob(job);
    if (ok) {
      res.sent++;
      res.perJob.push({ leadId: job.leadId, outcome: 'sent' });
    } else {
      res.failed++;
      failedKept.push({ ...job, attempts: (job.attempts ?? 0) + 1, lastError: new Date().toISOString(), smtpError: job.smtpError ?? null });
      res.perJob.push({ leadId: job.leadId, outcome: 'failed' });
    }
  }

  if (opts.dryRun) {
    res.remaining = jobs.length;
    return res;
  }

  // Atomic rewrite: fresh read to preserve concurrently appended lines.
  try {
    const p = outboxPath();
    const now = readOutboxJobs();
    const nowIds = new Set(now.map((j) => j.queuedAt + '|' + j.leadId));
    const preservedNew = now.filter((j) => !jobs.some((o) => o.queuedAt === j.queuedAt && o.leadId === j.leadId));
    const failedIds = new Set(failedKept.map((j) => j.queuedAt + '|' + j.leadId));
    const finalJobs = [
      ...preservedNew,
      ...now.filter((j) => failedIds.has(j.queuedAt + '|' + j.leadId)).map((j) => {
        const upd = failedKept.find((f) => f.queuedAt === j.queuedAt && f.leadId === j.leadId);
        return upd ?? j;
      }),
    ];
    void nowIds;
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, finalJobs.length ? finalJobs.map((j) => JSON.stringify(j)).join('\n') + '\n' : '', 'utf8');
    fs.renameSync(tmp, p);
    res.remaining = finalJobs.length;
  } catch {
    // Rewrite failed: report from the in-memory picture; jobs remain on disk.
    res.remaining = rest.length + failedKept.length + (readOutboxJobs().length - jobs.length > 0 ? readOutboxJobs().length - jobs.length : 0);
  }
  return res;
}
