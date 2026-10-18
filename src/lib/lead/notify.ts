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
  channel: 'smtp' | 'outbox' | 'test';
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
  const subject = `[quantiviq lead] ${f.name} — ${r.intent} (${r.locale})`;
  const text = [
    `Lead ${r.id}`,
    `Received: ${r.createdAt}`,
    `Locale: ${r.locale}`,
    `Intent: ${r.intent}`,
    ``,
    `Name:    ${f.name}`,
    `Email:   ${f.email}`,
    `Org:     ${f.org || '—'}`,
    `Website: ${f.website || '—'}`,
    `Role:    ${f.role || '—'}`,
    `Preferred contact: ${f.preferred}${f.preferredLink ? ` (${f.preferredLink})` : ''}`,
    ``,
    `Message:`,
    f.message,
    ``,
    `--`,
    `Delete this record: node scripts/leads-tool.mjs delete ${r.id}`,
  ].join('\n');
  return { subject, text };
}

export async function deliverOwnerNotification(r: LeadRecord): Promise<NotifyResult> {
  const msg = renderOwnerNotification(r);

  if (process.env.QV_NOTIFY_TRANSPORT === 'test') {
    return { channel: 'test', delivered: true };
  }

  if (smtpConfigured()) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
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
