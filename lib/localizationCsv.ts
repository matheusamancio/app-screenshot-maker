import type { Slide, Language, LocalizationField, LocalizationCell } from '@/types';
import { ALL_LANGUAGE_CODES, isBaseLanguage } from '@/lib/presets';

const TITLE = 'Title';
const SUBTITLE = 'Subtitle';

function cellValue(slide: Slide, lang: Language, field: LocalizationField): string {
  if (isBaseLanguage(lang)) {
    return field === 'title' ? slide.title.text : slide.title.subtitle;
  }
  const loc = slide.localizations?.[lang];
  return (field === 'title' ? loc?.title : loc?.subtitle) || '';
}

/** RFC-4180 field encode: quote when the value has a comma, quote, or newline. */
function encodeField(value: string): string {
  const v = value ?? '';
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/**
 * Build a localization CSV. One row per screen. For each locale a Title and a
 * Subtitle column, pre-filled with current text. A trailing `ID` column carries
 * the stable slide id so imports survive row reordering.
 */
export function buildLocalizationCsv(slides: Slide[], locales: Language[]): string {
  const header = [
    'Screen',
    ...locales.flatMap((l) => [`${l} ${TITLE}`, `${l} ${SUBTITLE}`]),
    'ID',
  ];
  const lines = [header.map(encodeField).join(',')];
  slides.forEach((slide, i) => {
    const cells = [
      `Slide ${i + 1}`,
      ...locales.flatMap((l) => [cellValue(slide, l, 'title'), cellValue(slide, l, 'subtitle')]),
      slide.id,
    ];
    lines.push(cells.map(encodeField).join(','));
  });
  // Prepend a UTF-8 BOM so Excel reads ja/ko/zh/ar correctly.
  return '﻿' + lines.join('\r\n');
}

/** RFC-4180 parser. Handles quoted fields, escaped quotes, and newlines in quotes. */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, ''); // strip BOM
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
      // consume \r\n as a single break
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
  stats: {
    screensMatched: number;
    matchedById: number;
    matchedByOrder: number;
    rowsSkipped: number;
    unknownColumns: number;
  };
}

type ColumnSpec =
  | { kind: 'id' }
  | { kind: 'screen' }
  | { kind: 'cell'; lang: Language; field: LocalizationField }
  | { kind: 'unknown' };

function resolveCode(raw: string): Language | null {
  const lower = raw.trim().toLowerCase();
  return (ALL_LANGUAGE_CODES.find((c) => c.toLowerCase() === lower) as Language) || null;
}

function classifyHeader(h: string): ColumnSpec {
  const head = h.trim();
  const lower = head.toLowerCase();
  if (lower === 'id') return { kind: 'id' };
  if (lower === 'screen') return { kind: 'screen' };
  const m = head.match(/^(.*\S)\s+(title|subtitle)$/i);
  if (m) {
    const code = resolveCode(m[1]);
    if (code) return { kind: 'cell', lang: code, field: m[2].toLowerCase() as LocalizationField };
  }
  return { kind: 'unknown' };
}

/**
 * Map parsed CSV rows onto localization cells. Rows match a slide by `ID` first
 * (reorder-safe), falling back to row order. Only non-empty cells are emitted so
 * imports never blank out existing text.
 */
export function csvToCells(rows: string[][], slides: Slide[]): CsvImportResult {
  const empty: CsvImportResult = {
    cells: [],
    localesSeen: [],
    stats: { screensMatched: 0, matchedById: 0, matchedByOrder: 0, rowsSkipped: 0, unknownColumns: 0 },
  };
  if (!rows.length) return empty;

  const cols = rows[0].map(classifyHeader);
  const idCol = cols.findIndex((c) => c.kind === 'id');
  const hasCellCols = cols.some((c) => c.kind === 'cell');
  if (!hasCellCols) return empty;

  const byId = new Map(slides.map((s) => [s.id, s]));
  const dataRows = rows.slice(1).filter((r) => r.some((c) => (c || '').trim() !== ''));

  const cells: LocalizationCell[] = [];
  const localesSeen = new Set<Language>();
  let matchedById = 0;
  let matchedByOrder = 0;
  let rowsSkipped = 0;

  dataRows.forEach((r, rowIndex) => {
    const id = idCol >= 0 ? (r[idCol] || '').trim() : '';
    let slide: Slide | undefined;
    if (id && byId.has(id)) {
      slide = byId.get(id);
      matchedById += 1;
    } else {
      slide = slides[rowIndex];
      if (slide) matchedByOrder += 1;
    }
    if (!slide) {
      rowsSkipped += 1;
      return;
    }
    cols.forEach((col, ci) => {
      if (col.kind !== 'cell') return;
      const v = r[ci];
      if (v == null || v.trim() === '') return;
      localesSeen.add(col.lang);
      cells.push({ slideId: slide!.id, lang: col.lang, field: col.field, value: v });
    });
  });

  return {
    cells,
    localesSeen: Array.from(localesSeen),
    stats: {
      screensMatched: matchedById + matchedByOrder,
      matchedById,
      matchedByOrder,
      rowsSkipped,
      unknownColumns: cols.filter((c) => c.kind === 'unknown').length,
    },
  };
}
