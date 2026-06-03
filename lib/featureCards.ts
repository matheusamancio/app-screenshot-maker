import type { FeatureCard } from '@/types';
import { uid } from './utils';

export interface ParsedRow {
  label: string;
  value?: string;
  highlight: boolean;
  chevron: boolean;
}

/** Parse a card body into rows. See FeatureCard.body for the syntax. */
export function parseCardBody(body: string): ParsedRow[] {
  return (body || '')
    .split('\n')
    .map((raw): ParsedRow | null => {
      let line = raw.trim();
      if (!line) return null;
      let highlight = false;
      if (line.startsWith('*')) {
        highlight = true;
        line = line.slice(1).trim();
      }
      let chevron = false;
      if (line.endsWith('›') || line.endsWith('>')) {
        chevron = true;
        line = line.replace(/[›>]\s*$/, '').trim();
      }
      const pipe = line.indexOf('|');
      if (pipe >= 0) {
        return { label: line.slice(0, pipe).trim(), value: line.slice(pipe + 1).trim(), highlight, chevron };
      }
      return { label: line, highlight, chevron };
    })
    .filter((r): r is ParsedRow => r !== null);
}

/** A card with only valueless rows and at least one highlight renders as an option picker. */
export function cardMode(rows: ParsedRow[]): 'picker' | 'rows' {
  if (rows.length && rows.every((r) => r.value === undefined) && rows.some((r) => r.highlight)) return 'picker';
  return 'rows';
}

/** Placeholder cards rendered when a feature-cards slide has no cards yet (display only). */
export const SAMPLE_FEATURE_CARDS: { title: string; body: string }[] = [
  { title: 'Block Any App', body: 'Select Apps & Websites to Block ›\nInstagram · YouTube · TikTok | 3 apps' },
  { title: 'Schedule Any Time', body: 'Start at | 9:00 AM\nEnd at | 5:00 PM\nRepeat | Mon – Fri' },
  { title: 'Set App Limits', body: '10 minutes\n*15 minutes\n20 minutes' },
];

/** Real cards (with ids) used to seed the editor. */
export function defaultFeatureCards(): FeatureCard[] {
  return SAMPLE_FEATURE_CARDS.map((c) => ({ id: uid(), title: c.title, body: c.body }));
}

export function newFeatureCard(): FeatureCard {
  return { id: uid(), title: 'New feature', body: 'Detail one | Value\n*Highlighted detail' };
}
