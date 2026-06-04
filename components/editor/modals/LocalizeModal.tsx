'use client';

import React, { useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import Modal from '../../ui/Modal';
import { useProjectStore } from '@/store/projectStore';
import type { Language, LocalizationCell } from '@/types';
import { BASE_LANGUAGE } from '@/types';
import { LANGUAGES, ALL_LANGUAGE_CODES, isBaseLanguage } from '@/lib/presets';
import { getLocalizableFields, fieldValue, type LocField } from '@/lib/localizableFields';
import { parseClipboardGrid, isBlockPaste } from '@/lib/localizeGrid';
import { buildLocalizationCsv, parseCsv, csvToCells } from '@/lib/localizationCsv';
import { useToast } from '../../ui/Toast';
import TemplateRenderer from '../../templates/TemplateRenderer';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LocalizeModal({ open, onClose }: Props) {
  const slides = useProjectStore((s) => s.slides);
  const appName = useProjectStore((s) => s.appName);
  const enabledLanguages = useProjectStore((s) => s.enabledLanguages);
  const toggleLanguage = useProjectStore((s) => s.toggleLanguage);
  const setEnabledLanguages = useProjectStore((s) => s.setEnabledLanguages);
  const setLocalizedText = useProjectStore((s) => s.setLocalizedText);
  const setElementLocalizedText = useProjectStore((s) => s.setElementLocalizedText);
  const applyLocalizationCells = useProjectStore((s) => s.applyLocalizationCells);
  const { toast } = useToast();

  const [tab, setTab] = useState<'grid' | 'preview'>('grid');
  const [previewSlideId, setPreviewSlideId] = useState<string>(slides[0]?.id || '');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayLocales = useMemo(() => LANGUAGES.filter((l) => enabledLanguages.includes(l.code)), [enabledLanguages]);
  const localeCodes = useMemo(() => displayLocales.map((l) => l.code), [displayLocales]);
  const fields = useMemo(() => getLocalizableFields(slides), [slides]);
  const slideById = useMemo(() => new Map(slides.map((s) => [s.id, s])), [slides]);
  const previewSlide = slides.find((s) => s.id === previewSlideId) || slides[0];

  const setCell = (f: LocField, lang: Language, value: string) => {
    if (f.kind === 'element' && f.elementId) setElementLocalizedText(f.slideId, f.elementId, lang, value, f.elementField || 'text');
    else setLocalizedText(f.slideId, lang, f.kind as 'title' | 'subtitle', value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, rowIndex: number, colIndex: number) => {
    const grid = parseClipboardGrid(e.clipboardData.getData('text/plain'));
    if (!isBlockPaste(grid)) return;
    e.preventDefault();
    const cells: LocalizationCell[] = [];
    grid.forEach((cols, r) => {
      const f = fields[rowIndex + r];
      if (!f) return;
      cols.forEach((val, c) => {
        const lang = localeCodes[colIndex + c];
        if (!lang) return;
        cells.push({ slideId: f.slideId, lang, field: f.kind, elementId: f.elementId, elementField: f.elementField, value: val });
      });
    });
    if (cells.length) {
      applyLocalizationCells(cells);
      toast(`Pasted ${cells.length} cells`, 'success');
    }
  };

  const handleExportCsv = () => {
    const csv = buildLocalizationCsv(slides, localeCodes);
    const filename = `${(appName || 'screenforge').replace(/\s+/g, '-').toLowerCase()}-localization.csv`;
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
    toast(`Exported ${fields.length} text fields × ${localeCodes.length} languages`, 'success');
  };

  const importCsvText = (text: string) => {
    let rows: string[][];
    try {
      rows = parseCsv(text);
    } catch {
      toast('Could not read that file as CSV', 'error');
      return;
    }
    const { cells, localesSeen, stats } = csvToCells(rows);
    if (!cells.length) {
      toast('No FieldID / language columns found — export a template first', 'error');
      return;
    }
    applyLocalizationCells(cells);
    if (localesSeen.length) setEnabledLanguages(Array.from(new Set([...enabledLanguages, ...localesSeen])));
    toast(`Imported ${cells.length} cells · ${stats.fieldsMatched} fields · ${localesSeen.length} languages`, 'success');
  };

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      toast('Please choose a .csv file', 'error');
      return;
    }
    try {
      importCsvText(await file.text());
    } catch {
      toast('Failed to read the file', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Localize" description="Translate every text — titles, subtitles and components — per language" size="full">
      <div
        className="space-y-4 relative"
        onDragOver={(e) => {
          if (Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={(e) => {
          if (!Array.from(e.dataTransfer.types).includes('Files')) return;
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
        {dragging && (
          <div className="absolute inset-0 z-30 rounded-lg border-2 border-dashed border-norte-primary bg-norte-primary-light/80 flex items-center justify-center pointer-events-none">
            <div className="bg-surface rounded-md px-4 py-3 shadow-md text-sm font-sora font-semibold text-primary">Drop your CSV to import</div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex bg-overlay rounded-md p-1 border border-border-default">
            {(['grid', 'preview'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs rounded font-medium ${tab === t ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'}`}>
                {t === 'grid' ? 'Translate grid' : 'Preview all'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="h-8 px-3 rounded-md text-xs font-semibold bg-muted border border-border-default text-secondary hover:bg-overlay flex items-center gap-1.5"><span className="text-sm leading-none">⤒</span> Import CSV</button>
            <button onClick={handleExportCsv} className="h-8 px-3 rounded-md text-xs font-semibold bg-norte-primary-light border border-norte-primary/30 text-norte-primary hover:bg-norte-primary/10 flex items-center gap-1.5"><span className="text-sm leading-none">⤓</span> Export CSV template</button>
          </div>
        </div>

        {/* Locale manager */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-label">Locales ({displayLocales.length}/{ALL_LANGUAGE_CODES.length}) · {fields.length} text fields</div>
            <div className="flex gap-1.5">
              <button onClick={() => setEnabledLanguages([...ALL_LANGUAGE_CODES])} className="text-[11px] px-2 py-1 rounded bg-muted border border-border-default text-secondary hover:bg-overlay">Enable all</button>
              <button onClick={() => setEnabledLanguages([BASE_LANGUAGE])} className="text-[11px] px-2 py-1 rounded bg-muted border border-border-default text-secondary hover:bg-overlay">Base only</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((l) => {
              const enabled = enabledLanguages.includes(l.code);
              const base = isBaseLanguage(l.code);
              return (
                <button key={l.code} title={`${l.name} — ${l.countries}`} onClick={() => !base && toggleLanguage(l.code)} className={`px-2.5 py-1.5 rounded-md text-xs font-medium border ${enabled ? 'bg-norte-primary-light border-norte-primary text-norte-primary' : 'bg-muted border-border-default text-secondary hover:bg-overlay'} ${base ? 'cursor-default' : ''}`}>
                  {base ? '★ ' : enabled ? '✓ ' : '+ '}
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === 'grid' ? (
          <>
            <div className="text-[11px] text-text-muted">Every text field is a row. Paste a block from your spreadsheet into any cell — it fills down/across. Export the CSV template to send to translators, then import it back.</div>
            <div className="border border-border-default rounded-md overflow-auto max-h-[56vh]">
              <table className="border-collapse text-sm">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="sticky left-0 z-20 bg-muted border-b border-r border-border-default px-3 py-2 text-left text-[11px] font-semibold text-secondary min-w-[190px]">Field</th>
                    {displayLocales.map((l) => (
                      <th key={l.code} title={`${l.name} — ${l.countries}`} className={`border-b border-r border-border-default px-3 py-2 text-left text-[11px] font-semibold min-w-[180px] ${isBaseLanguage(l.code) ? 'bg-norte-primary-light text-norte-primary' : 'bg-muted text-secondary'}`}>{isBaseLanguage(l.code) ? '★ ' : ''}{l.label}{l.rtl ? ' (RTL)' : ''}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, rowIndex) => {
                    const slide = slideById.get(f.slideId);
                    const firstOfSlide = rowIndex === 0 || fields[rowIndex - 1].slideId !== f.slideId;
                    return (
                      <tr key={f.fieldId} className="even:bg-overlay/40">
                        <td className="sticky left-0 z-10 bg-surface border-b border-r border-border-default px-3 py-2 align-top min-w-[190px]">
                          {firstOfSlide && <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-0.5">Slide {f.slideIndex + 1}</div>}
                          <div className="text-xs font-medium text-secondary">{f.label}</div>
                        </td>
                        {displayLocales.map((l, colIndex) => (
                          <td key={l.code} className="border-b border-r border-border-default p-1 align-top">
                            <textarea
                              value={slide ? fieldValue(slide, f, l.code) : ''}
                              onChange={(e) => setCell(f, l.code, e.target.value)}
                              onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                              rows={2}
                              dir={l.rtl ? 'rtl' : 'ltr'}
                              placeholder={isBaseLanguage(l.code) ? 'text…' : 'translation…'}
                              className="w-full min-w-[170px] px-2 py-1.5 text-sm bg-surface border border-border-default rounded resize-y focus:border-norte-primary focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {fields.length === 0 && (
                    <tr><td className="px-3 py-6 text-center text-text-muted text-sm" colSpan={displayLocales.length + 1}>No text yet — add titles or text components to your screens.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="section-label">Screen</span>
              <select value={previewSlide?.id} onChange={(e) => setPreviewSlideId(e.target.value)} className="h-8 px-2 text-sm bg-surface border border-border-default rounded-md focus:border-norte-primary focus:outline-none">
                {slides.map((s, i) => (<option key={s.id} value={s.id}>Slide {i + 1}</option>))}
              </select>
              <span className="text-[11px] text-text-muted">{displayLocales.length} languages</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 max-h-[56vh] overflow-auto p-1">
              {previewSlide && displayLocales.map((l) => (
                <div key={l.code} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${isBaseLanguage(l.code) ? 'text-norte-primary' : 'text-secondary'}`}>{isBaseLanguage(l.code) ? '★ ' : ''}{l.label}</span>
                    {l.rtl && <span className="text-[9px] text-text-muted uppercase">RTL</span>}
                  </div>
                  <div className="rounded-md overflow-hidden border border-border-default shadow-sm" style={{ width: 170, height: 170 * (844 / 390) }}>
                    <TemplateRenderer slide={previewSlide} width={170} height={170 * (844 / 390)} language={l.code} />
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
