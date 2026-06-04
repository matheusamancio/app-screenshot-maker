import type { Slide, Language, LocalizationCell } from '@/types';
import { ALL_LANGUAGE_CODES } from '@/lib/presets';
import { getLocalizableFields, fieldValue } from '@/lib/localizableFields';

/** RFC-4180 field encode: quote when the value has a comma, quote, or newline. */
function encodeField(value: string): string {
  const v = value ?? '';
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/**
 * Build a localization CSV — one row per localizable text field (title,
 * subtitle, and every text component), one column per locale. The trailing
 * FieldID column makes imports exact and reorder-safe. This doubles as the
 * "fields you need to edit" spreadsheet template.
 */
export function buildLocalizationCsv(slides: Slide[], locales: Language[]): string {
  const fields = getLocalizableFields(slides);
  const slideById = new Map(slides.map((s) => [s.id, s]));
  const header = ['Screen', 'Field', ...locales, 'FieldID'];
  const lines = [header.map(encodeField).join(',')];
  for (const f of fields) {
    const slide = slideById.get(f.slideId);
    if (!slide) continue;
    const cells = [
      `Slide ${f.slideIndex + 1}`,
      f.label,
      ...locales.map((l) => fieldValue(slide, f, l)),
      f.fieldId,
    ];
    lines.push(cells.map(encodeField).join(','));
  }
  return '﻿' + lines.join('\r\n');
}

/** RFC-4180 parser. Handles quoted fields, escaped quotes, and newlines in quotes. */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export interface CsvImportResult {
  cells: LocalizationCell[];
  localesSeen: Language[];
  stats: { fieldsMatched: number; rowsSkipped: number; unknownColumns: number };
}

function resolveCode(raw: string): Language | null {
  const lower = raw.trim().toLowerCase();
  return (ALL_LANGUAGE_CODES.find((c) => c.toLowerCase() === lower) as Language) || null;
}

function parseFieldId(fieldId: string): { slideId: string; field: 'title' | 'subtitle' | 'element'; elementId?: string; elementField?: string } | null {
  const parts = fieldId.split(':');
  if (parts.length < 2) return null;
  const slideId = parts[0];
  if (parts[1] === 'title') return { slideId, field: 'title' };
  if (parts[1] === 'subtitle') return { slideId, field: 'subtitle' };
  if (parts[1] === 'el' && parts[2]) return { slideId, field: 'element', elementId: parts[2], elementField: parts.slice(3).join(':') || 'text' };
  return null;
}

/** Map a parsed field-based CSV onto localization cells, matched by FieldID. */
export function csvToCells(rows: string[][]): CsvImportResult {
  const empty: CsvImportResult = { cells: [], localesSeen: [], stats: { fieldsMatched: 0, rowsSkipped: 0, unknownColumns: 0 } };
  if (rows.length < 2) return empty;

  const header = rows[0].map((h) => h.trim());
  const cols = header.map((h) => {
    const lower = h.toLowerCase();
    if (lower === 'fieldid') return { kind: 'fieldid' as const };
    if (lower === 'screen' || lower === 'field') return { kind: 'meta' as const };
    const code = resolveCode(h);
    if (code) return { kind: 'locale' as const, lang: code };
    return { kind: 'unknown' as const };
  });
  const fieldIdCol = cols.findIndex((c) => c.kind === 'fieldid');
  if (fieldIdCol < 0) return empty;

  const cells: LocalizationCell[] = [];
  const localesSeen = new Set<Language>();
  let fieldsMatched = 0;
  let rowsSkipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row.some((c) => (c || '').trim() !== '')) continue;
    const parsed = parseFieldId((row[fieldIdCol] || '').trim());
    if (!parsed) {
      rowsSkipped += 1;
      continue;
    }
    fieldsMatched += 1;
    cols.forEach((col, ci) => {
      if (col.kind !== 'locale') return;
      const v = row[ci];
      if (v == null || v.trim() === '') return;
      localesSeen.add(col.lang);
      cells.push({ slideId: parsed.slideId, lang: col.lang, field: parsed.field, elementId: parsed.elementId, elementField: parsed.elementField, value: v });
    });
  }

  return {
    cells,
    localesSeen: Array.from(localesSeen),
    stats: { fieldsMatched, rowsSkipped, unknownColumns: cols.filter((c) => c.kind === 'unknown').length },
  };
}
