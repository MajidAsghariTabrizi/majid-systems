'use client';

/**
 * Quantiviq Mind — visitor-initiated floating launcher.
 * No LLM call happens until the visitor opens the panel and asks.
 */
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { QuantiviqMindPanel } from './QuantiviqMindPanel';
import type { MindStrings } from './strings';

export function QuantiviqMindLauncher({ locale, s }: { locale: string; s: MindStrings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Conversion routes (solution request / finder / contact): the floating dock
  // must never cover the form or its submit action. Narrowly scoped behavior
  // adjustment — the assistant stays available everywhere else.
  const conversionRoute = /\/(solutions\/[^/]+\/request|solutions\/find|contact)$/.test(pathname ?? '');

  return (
    <>
      {open && <QuantiviqMindPanel locale={locale} s={s} onClose={() => setOpen(false)} />}
      {!open && !conversionRoute && (
        <div className="mind-dock">
          <button
            type="button"
            className="mind-fab"
            aria-label={s.openLabel}
            onClick={() => {
              setOpen(true);
            }}
          >
            <span className="mind-fab-glyph" aria-hidden>
              ✦
            </span>
            <span className="mind-fab-label">{s.fab}</span>
          </button>
        </div>
      )}
    </>
  );
}
