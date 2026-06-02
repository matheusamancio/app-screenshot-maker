'use client';

import React, { useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import Modal from '../../ui/Modal';
import { useProjectStore } from '@/store/projectStore';
import type { Language, LocalizationField, Slide } from '@/types';
import { BASE_LANGUAGE } from '@/types';
import { LANGUAGES, ALL_LANGUAGE_CODES, getLocale, isRtl, isBaseLanguage } from '@/lib/presets';
import { parseClipboardGrid, isBlockPaste, buildCellUpdates } from '@/lib/localizeGrid';
import { buildLocalizationCsv, parseCsv, csvToCells } from '@/lib/localizationCsv';
import { useToast } from '../../ui/Toast';
import TemplateRenderer from '../../templates/TemplateRenderer';

interface Props {
  open: boolean;
  onClose: () => void;
}

function cellValue(slide: Slide, lang: Language, field: LocalizationField): string {
  if (isBaseLanguage(lang)) {
    return field === 'title' ? slide.title.text : slide.title.subtitle;
  }
  const loc = slide.localizations?.[lang];
  return (field === 'title' ? loc?.title : loc?.subtitle) || '';
}

export default function LocalizeModal({ open, onClose }: Props) {
  const slides = useProjectStore((s) => s.slides);
  const appName = useProjectStore((s) => s.appName);
  const enabledLanguages = useProjectStore((s) => s.enabledLanguages);
  const toggleLanguage = useProjectStore((s) => s.toggleLanguage);
  const setEnabledLanguages = useProjectStore((s) => s.setEnabledLanguages);
  const setLocalizedText = useProjectStore((s) => s.setLocalizedText);
  const applyLocalizationCells = useProjectStore((s) => s.applyLocalizationCells);
  const { toast } = useToast();

  const [tab, setTab] = useState<'grid' | 'preview'>('grid');
  const [field, setField] = useState<LocalizationField>('title');
  const [previewSlideId, setPreviewSlideId] = useState<string>(slides[0]?.id || '');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayLocales = useMemo(
    () => LANGUAGES.filter((l) => enabledLanguages.includes(l.code)),
    [enabledLanguages],
  );
  const slideIds = useMemo(() => slides.map((s) => s.id), [slides]);
  const localeCodes = useMemo(() => displayLocales.map((l) => l.code), [displayLocales]);

  const previewSlide = slides.find((s) => s.id === previewSlideId) || slides[0];

  const handlePaste = (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    rowIndex: number,
    colIndex: number,
  ) => {
    const text = e.clipboardData.getData('text/plain');
    const grid = parseClipboardGrid(text);
    if (!isBlockPaste(grid)) return; // single value → let the browser paste normally
    e.preventDefault();
    const updates = buildCellUpdates(grid, rowIndex, colIndex, slideIds, localeCodes, field);
    if (!updates.length) return;
    applyLocalizationCells(updates);
    toast(`Pasted ${updates.length} cell${updates.length !== 1 ? 's' : ''} across languages`, 'success');
  };

  const handleExportCsv = () => {
    const csv = buildLocalizationCsv(slides, localeCodes);
    const filename = `${(appName || 'screenforge').replace(/\s+/g, '-').toLowerCase()}-localization.csv`;
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
    toast(`Exported ${slides.length} screens × ${localeCodes.length} languages to CSV`, 'success');
  };

  const importCsvText = (text: string) => {
    let rows: string[][];
    try {
      rows = parseCsv(text);
    } catch {
      toast('Could not read that file as CSV', 'error');
      return;
    }
    const { cells, localesSeen, stats } = csvToCells(rows, slides);
    if (!cells.length) {
      toast('No matching language columns found in that file', 'error');
      return;
    }
    applyLocalizationCells(cells);
    if (localesSeen.length) {
      setEnabledLanguages(Array.from(new Set([...enabledLanguages, ...localesSeen])));
    }
    const bits = [`Imported ${cells.length} cells across ${localesSeen.length} language${localesSeen.length !== 1 ? 's' : ''}`];
    bits.push(`${stats.screensMatched} screen${stats.screensMatched !== 1 ? 's' : ''} matched`);
    if (stats.rowsSkipped) bits.push(`${stats.rowsSkipped} row${stats.rowsSkipped !== 1 ? 's' : ''} skipped`);
    if (stats.unknownColumns) bits.push(`${stats.unknownColumns} column${stats.unknownColumns !== 1 ? 's' : ''} ignored`);
    toast(bits.join(' · '), 'success');
  };

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      toast('Please choose a .csv file', 'error');
      return;
    }
    try {
      const text = await file.text();
      importCsvText(text);
    } catch {
      toast('Failed to read the file', 'error');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes('Files')) return;
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes('Files')) return;
    e.preventDefault();
    setDragging(true);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Localize"
      description="Paste translations for every screen and language, then preview before export"
      size="full"
    >
      <div
        className="space-y-4 relative"
        onDragOver={onDragOver}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {/* Drag-and-drop overlay */}
        {dragging && (
          <div className="absolute inset-0 z-30 rounded-lg border-2 border-dashed border-norte-primary bg-norte-primary-light/80 flex items-center justify-center pointer-events-none">
            <div className="bg-surface rounded-md px-4 py-3 shadow-md text-center">
              <div className="text-sm font-sora font-semibold text-primary">Drop your CSV to import</div>
              <div className="text-xs text-text-muted">Translations will fill the grid</div>
            </div>
          </div>
        )}

        {/* Tabs + CSV toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex bg-overlay rounded-md p-1 border border-border-default">
            {(['grid', 'preview'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs rounded font-medium capitalize ${
                  tab === t ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
                }`}
              >
                {t === 'grid' ? 'Paste grid' : 'Preview all'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 rounded-md text-xs font-semibold bg-muted border border-border-default text-secondary hover:bg-overlay flex items-center gap-1.5"
            >
              <span className="text-sm leading-none">⤒</span> Import CSV
            </button>
            <button
              onClick={handleExportCsv}
              className="h-8 px-3 rounded-md text-xs font-semibold bg-norte-primary-light border border-norte-primary/30 text-norte-primary hover:bg-norte-primary/10 flex items-center gap-1.5"
            >
              <span className="text-sm leading-none">⤓</span> Export CSV
            </button>
            {tab === 'grid' && (
              <div className="flex bg-overlay rounded-md p-1 border border-border-default">
                {(['title', 'subtitle'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setField(f)}
                    className={`px-3 py-1.5 text-xs rounded font-medium capitalize ${
                      field === f ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
                    }`}
                  >
                    {f}s
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Locale manager */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-label">Locales ({displayLocales.length}/{ALL_LANGUAGE_CODES.length})</div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setEnabledLanguages([...ALL_LANGUAGE_CODES])}
                className="text-[11px] px-2 py-1 rounded bg-muted border border-border-default text-secondary hover:bg-overlay"
              >
                Enable all
              </button>
              <button
                onClick={() => setEnabledLanguages([BASE_LANGUAGE])}
                className="text-[11px] px-2 py-1 rounded bg-muted border border-border-default text-secondary hover:bg-overlay"
              >
                Base only
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((l) => {
              const enabled = enabledLanguages.includes(l.code);
              const base = isBaseLanguage(l.code);
              return (
                <button
                  key={l.code}
                  title={`${l.name} — ${l.countries}`}
                  onClick={() => !base && toggleLanguage(l.code)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium border ${
                    enabled
                      ? 'bg-norte-primary-light border-norte-primary text-norte-primary'
                      : 'bg-muted border-border-default text-secondary hover:bg-overlay'
                  } ${base ? 'cursor-default' : ''}`}
                >
                  {base ? '★ ' : enabled ? '✓ ' : '+ '}
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === 'grid' ? (
          <>
            <div className="text-[11px] text-text-muted">
              Tip: copy a block of cells from your spreadsheet and paste into any cell — it fills down and across
              automatically. The <span className="font-semibold text-secondary">★ base</span> column edits the on-canvas
              text; blank cells fall back to it on export.
            </div>
            <div className="border border-border-default rounded-md overflow-auto max-h-[58vh]">
              <table className="border-collapse text-sm">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="sticky left-0 z-20 bg-muted border-b border-r border-border-default px-3 py-2 text-left text-[11px] font-semibold text-secondary min-w-[160px]">
                      Screen
                    </th>
                    {displayLocales.map((l) => (
                      <th
                        key={l.code}
                        title={`${l.name} — ${l.countries}`}
                        className={`border-b border-r border-border-default px-3 py-2 text-left text-[11px] font-semibold min-w-[180px] ${
                          isBaseLanguage(l.code) ? 'bg-norte-primary-light text-norte-primary' : 'bg-muted text-secondary'
                        }`}
                      >
                        {isBaseLanguage(l.code) ? '★ ' : ''}
                        {l.label}
                        {l.rtl ? ' (RTL)' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slides.map((slide, rowIndex) => (
                    <tr key={slide.id} className="even:bg-overlay/40">
                      <td className="sticky left-0 z-10 bg-surface border-b border-r border-border-default px-3 py-2 align-top min-w-[160px]">
                        <div className="text-xs font-semibold text-secondary">Slide {rowIndex + 1}</div>
                        <div className="text-[10px] text-text-muted line-clamp-2 mt-0.5">
                          {slide.title.text.split('\n').join(' ') || '—'}
                        </div>
                      </td>
                      {displayLocales.map((l, colIndex) => (
                        <td key={l.code} className="border-b border-r border-border-default p-1 align-top">
                          <textarea
                            value={cellValue(slide, l.code, field)}
                            onChange={(e) => setLocalizedText(slide.id, l.code, field, e.target.value)}
                            onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                            rows={2}
                            dir={l.rtl ? 'rtl' : 'ltr'}
                            placeholder={isBaseLanguage(l.code) ? `${field}…` : 'translation…'}
                            className="w-full min-w-[170px] px-2 py-1.5 text-sm bg-surface border border-border-default rounded resize-y focus:border-norte-primary focus:outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="section-label">Screen</span>
              <select
                value={previewSlide?.id}
                onChange={(e) => setPreviewSlideId(e.target.value)}
                className="h-8 px-2 text-sm bg-surface border border-border-default rounded-md focus:border-norte-primary focus:outline-none"
              >
                {slides.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    Slide {i + 1} — {s.title.text.split('\n')[0] || 'Untitled'}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-text-muted">{displayLocales.length} languages</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 max-h-[58vh] overflow-auto p-1">
              {previewSlide &&
                displayLocales.map((l) => (
                  <div key={l.code} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold ${isBaseLanguage(l.code) ? 'text-norte-primary' : 'text-secondary'}`}>
                        {isBaseLanguage(l.code) ? '★ ' : ''}
                        {l.label}
                      </span>
                      {l.rtl && <span className="text-[9px] text-text-muted uppercase">RTL</span>}
                    </div>
                    <div
                      className="rounded-md overflow-hidden border border-border-default shadow-sm"
                      style={{ width: 180, height: 180 * (844 / 390) }}
                    >
                      <TemplateRenderer slide={previewSlide} width={180} height={180 * (844 / 390)} language={l.code} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
