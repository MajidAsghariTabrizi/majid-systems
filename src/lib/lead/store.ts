/**
 * Lead store — durable JSONL persistence with retention operations.
 * One JSON line per lead in QV_LEAD_DATA/leads.jsonl (default .data/).
 * Append-only for writes; deletion rewrites the file without the target
 * line (atomic tmp+rename); purge drops records older than the retention
 * window (privacy policy: 24 months).
 */
import fs from 'node:fs';
import path from 'node:path';

export type LeadPipelineStatus = 'new' | 'contacted' | 'discovery' | 'proposal_sent' | 'won' | 'lost';

export type LeadRecord = {
  id: string;
  createdAt: string;
  locale: string;
  intent: string;
  fields: {
    name: string;
    email: string;
    org: string;
    website: string;
    role: string;
    message: string;
    preferred: string;
    preferredLink: string;
  };
  /** Commercial layer (optional): catalog solution id, optional phone, attribution. */
  solution?: string;
  phone?: string;
  source?: string;
  ipHash: string;
  status: 'stored' | 'deleted';
  notify: string;
  pipeline?: { status: LeadPipelineStatus; updatedAt: string; actor?: string };
};

export function dataDir(base?: string): string {
  return base ?? process.env.QV_LEAD_DATA ?? path.join(process.cwd(), '.data');
}

function leadsPath(dir: string): string {
  return path.join(dir, 'leads.jsonl');
}

export function appendLead(record: LeadRecord, dir?: string): void {
  const d = dataDir(dir);
  fs.mkdirSync(d, { recursive: true });
  fs.appendFileSync(leadsPath(d), JSON.stringify(record) + '\n', 'utf8');
}

export function listLeads(dir?: string): LeadRecord[] {
  const p = leadsPath(dataDir(dir));
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, 'utf8')
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => JSON.parse(l) as LeadRecord);
}

export function getLead(id: string, dir?: string): LeadRecord | undefined {
  return listLeads(dir).find((r) => r.id === id);
}

/** Atomic in-place update of an existing record (rewrite tmp+rename). */
export function updateLead(id: string, patch: Partial<LeadRecord>, dir?: string): boolean {
  const d = dataDir(dir);
  const p = leadsPath(d);
  if (!fs.existsSync(p)) return false;
  const lines = fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim() !== '');
  let found = false;
  const next = lines.map((l) => {
    try {
      const r = JSON.parse(l) as LeadRecord;
      if (r.id !== id) return l;
      found = true;
      return JSON.stringify({ ...r, ...patch });
    } catch {
      return l;
    }
  });
  if (!found) return false;
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, next.join('\n') + '\n', 'utf8');
  fs.renameSync(tmp, p);
  return true;
}

/** Delete by reference id. Returns true when a record was removed. */
export function deleteLead(id: string, dir?: string): boolean {
  const d = dataDir(dir);
  const p = leadsPath(d);
  if (!fs.existsSync(p)) return false;
  const lines = fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim() !== '');
  const kept = lines.filter((l) => {
    try {
      return (JSON.parse(l) as LeadRecord).id !== id;
    } catch {
      return false; // drop corrupt lines
    }
  });
  if (kept.length === lines.length) return false;
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, kept.length ? kept.join('\n') + '\n' : '', 'utf8');
  fs.renameSync(tmp, p);
  return true;
}

/**
 * Retention purge: remove records older than `months` (default 24, matching
 * the published privacy policy). Returns number purged.
 */
export function purgeOlderThan(months = 24, dir?: string, now = new Date()): number {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  const all = listLeads(dir);
  const keep = all.filter((r) => new Date(r.createdAt) > cutoff);
  const purged = all.length - keep.length;
  if (purged === 0) return 0;
  const d = dataDir(dir);
  const p = leadsPath(d);
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, keep.length ? keep.map((r) => JSON.stringify(r)).join('\n') + '\n' : '', 'utf8');
  fs.renameSync(tmp, p);
  return purged;
}

/** Storage is healthy when the directory exists (or can be created) and is writable. */
export function storageHealth(dir?: string): 'writable' | 'error' {
  try {
    const d = dataDir(dir);
    fs.mkdirSync(d, { recursive: true });
    fs.accessSync(d, fs.constants.W_OK);
    return 'writable';
  } catch {
    return 'error';
  }
}
