import type { Language, LocalizationCell, LocalizationField } from '@/types';

/**
 * Parse clipboard text copied from a spreadsheet into a 2D grid.
 * Tabs separate columns, newlines separate rows. A trailing newline is ignored.
 */
export function parseClipboardGrid(text: string): string[][] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n+$/, '');
  if (normalized === '') return [['']];
  return normalized.split('\n').map((row) => row.split('\t'));
}

/** True when the pasted content spans more than one cell (block paste). */
export function isBlockPaste(grid: string[][]): boolean {
  return grid.length > 1 || grid.some((row) => row.length > 1);
}

/**
 * Map a parsed grid onto editor cells, anchored at (startRow, startCol).
 * Rows map to slides (in order), columns map to locales (in display order).
 * Out-of-range cells are clipped.
 */
export function buildCellUpdates(
  grid: string[][],
  startRow: number,
  startCol: number,
  slideIds: string[],
  localeCodes: Language[],
  field: LocalizationField,
): LocalizationCell[] {
  const updates: LocalizationCell[] = [];
  for (let r = 0; r < grid.length; r++) {
    const slideId = slideIds[startRow + r];
    if (!slideId) continue;
    const cols = grid[r];
    for (let c = 0; c < cols.length; c++) {
      const lang = localeCodes[startCol + c];
      if (!lang) continue;
      updates.push({ slideId, lang, field, value: cols[c] });
    }
  }
  return updates;
}
