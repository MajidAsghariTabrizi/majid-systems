'use client';

/**
 * Quantiviq Mind — floating launcher + invitation.
 * No LLM call happens until the visitor opens the panel and asks.
 * Dismissal is respected for the browser session.
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { QuantiviqMindPanel } from './QuantiviqMindPanel';
import type { MindStrings } from './strings';

export function QuantiviqMindLauncher({ locale, s }: { locale: string; s: MindStrings }) {
  const [open, setOpen] = useState(false);
  const [invited, setInvited] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const pathname = usePathname();
  // Conversion routes (solution request / finder / contact): the floating dock
  // must never cover the form or its submit action. Narrowly scoped behavior
  // adjustment — the assistant stays available everywhere else.
  const conversionRoute = /\/(solutions\/[^/]+\/request|solutions\/find|contact)$/.test(pathname ?? '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(sessionStorage.getItem('mind-dismissed') === '1');
    const t = setTimeout(() => {
      if (!sessionStorage.getItem('mind-dismissed')) {
        setInvited(true);
      }
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setInvited(false);
    setDismissed(true);
    sessionStorage.setItem('mind-dismissed', '1');
  };

  return (
    <>
      {open && <QuantiviqMindPanel locale={locale} s={s} onClose={() => setOpen(false)} />}
      {!open && !conversionRoute && (
        <div className={`mind-dock${dismissed && !invited ? '' : ' mind-dock-show'}`}>
          {invited && !dismissed && (
            <div className="mind-invite" role="status">
              <span>{s.invite}</span>
              <button type="button" className="mind-invite-x" aria-label={s.close} onClick={dismiss}>
                ×
              </button>
            </div>
          )}
          <button
            type="button"
            className="mind-fab"
            aria-label={s.openLabel}
            onClick={() => {
              setOpen(true);
              setInvited(false);
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
