/** Lifecycle indexes: need, match, introduction, conversation, agreement, result. */
export function lifecycleBase(phase: number): number {
  return phase >= 2 ? 1 : 0;
}

export function canAdvanceLifecycle(phase: number, consent: boolean, evidenceReady: boolean): boolean {
  return phase === 5 && consent && evidenceReady;
}

export function advanceLifecycle(life: number, phase: number, consent: boolean, evidenceReady: boolean): number {
  const base = lifecycleBase(phase);
  if (!canAdvanceLifecycle(phase, consent, evidenceReady)) return base;
  const current = Number.isFinite(life) ? Math.max(base, Math.floor(life)) : base;
  return Math.min(5, current + 1);
}

export const LIFECYCLE_ACTIONS = [
  'پذیرش فرضی معرفی',
  'پذیرش فرضی معرفی',
  'شبیه‌سازی گفت‌وگو',
  'شبیه‌سازی توافق',
  'ثبت همکاری آزمایشی',
  'نتیجه فرضی ثبت شد',
] as const;
