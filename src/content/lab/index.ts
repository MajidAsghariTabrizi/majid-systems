/**
 * Lab dictionary accessor — mirrors content/i18n.dict() for the lab module.
 * All lab copy lives in lab/en.ts + lab/fa.ts (key parity enforced by
 * test/i18n.test.ts through the attached `lab` key in both main dictionaries).
 */

import { labEn } from './en';
import { labFa } from './fa';

export type LabLocale = 'en' | 'fa';

export function labDict(locale: LabLocale) {
  return locale === 'fa' ? labFa : labEn;
}

export type LabDict = typeof labEn;
