import type { Slide, SlideElement, Language } from '@/types';
import { BASE_LANGUAGE } from '@/types';

export interface LocField {
  /** Stable id: `${slideId}:title` | `:subtitle` | `${slideId}:el:${elementId}:${field}`. */
  fieldId: string;
  slideId: string;
  slideIndex: number;
  kind: 'title' | 'subtitle' | 'element';
  elementId?: string;
  /** For element fields: the path within the element (e.g. `cardTitle`, `items.0.name`). */
  elementField?: string;
  label: string;
}

// ── path get/set (supports nested arrays like `items.0.name`) ──
export function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}
/** Immutably set a nested path, returning a shallow-cloned root along the path. */
export function setByPath<T>(root: T, path: string, value: string): T {
  const keys = path.split('.');
  const clone: any = Array.isArray(root) ? [...(root as any)] : { ...(root as any) };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...next };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

const KIND_SHORT: Record<string, string> = {
  streak: 'Streak', notification: 'Notification', widget: 'Widget', barchart: 'Bar chart',
  linechart: 'Line chart', habitrow: 'Habit', heatmap: 'Heatmap', card: 'Card',
  datestrip: 'Dates', laurel: 'Laurel', button: 'Button', shape: 'Shape', icon: 'Icon', phone: 'Phone',
};

/** Top-level text fields per element kind: [path, friendly name]. */
const SIMPLE: Record<string, [string, string][]> = {
  button: [['text', 'label']],
  streak: [['cardTitle', 'current label'], ['cardValue', 'current value'], ['cardTitle2', 'best label'], ['cardValue2', 'best value'], ['unit', 'unit'], ['cardCaption', 'kept label'], ['text', 'check-in label']],
  notification: [['cardTitle', 'app'], ['cardValue', 'time'], ['text', 'title'], ['cardCaption', 'body']],
  widget: [['cardTitle', 'header'], ['cardValue', 'header value'], ['text', 'title'], ['cardCaption', 'caption'], ['cardValue2', 'sub-value']],
  barchart: [['toggleLeft', 'toggle L'], ['toggleRight', 'toggle R'], ['days', 'labels'], ['dates', 'numbers']],
  linechart: [['days', 'labels'], ['cardCaption', 'caption']],
  habitrow: [['text', 'name'], ['cardCaption', 'meta']],
  heatmap: [['cardTitle', 'title'], ['cardValue', 'value'], ['cardCaption', 'caption']],
  card: [['cardTitle', 'label'], ['cardValue', 'value'], ['cardCaption', 'caption']],
  datestrip: [['days', 'days'], ['dates', 'numbers']],
  laurel: [['cardValue', 'value'], ['cardCaption', 'caption']],
  shape: [['text', 'label']],
  icon: [['text', 'label']],
  phone: [['text', 'status time'], ['cardTitle', 'app name']],
};

/** Every translatable text path on one element, with a friendly label. */
export function elementFieldSpecs(el: SlideElement): { field: string; label: string }[] {
  if (el.kind === 'text') {
    return [{ field: 'text', label: `Text · ${(el.text || '').replace(/\n/g, ' ').slice(0, 22) || 'text'}` }];
  }
  const KL = KIND_SHORT[el.kind] || el.kind;
  const out: { field: string; label: string }[] = [];
  (SIMPLE[el.kind] || []).forEach(([field, fname]) => out.push({ field, label: `${KL} · ${fname}` }));
  if (el.kind === 'widget') {
    (el.items || []).forEach((it, i) => {
      out.push({ field: `items.${i}.name`, label: `${KL} row ${i + 1} · ${it.name || 'name'}` });
      out.push({ field: `items.${i}.meta`, label: `${KL} row ${i + 1} · meta` });
    });
  }
  if (el.kind === 'linechart') {
    (el.series || []).forEach((s, i) => out.push({ field: `series.${i}.label`, label: `${KL} series ${i + 1} · ${s.label || ''}` }));
  }
  return out;
}

/** Every localizable text field across all slides (title, subtitle, and every component text). */
export function getLocalizableFields(slides: Slide[]): LocField[] {
  const fields: LocField[] = [];
  slides.forEach((s, i) => {
    const titleVisible = s.title.layer?.visible !== false;
    if (titleVisible && (s.title.text || '').trim() !== '') {
      fields.push({ fieldId: `${s.id}:title`, slideId: s.id, slideIndex: i, kind: 'title', label: 'Title' });
      if (s.title.showSubtitle) {
        fields.push({ fieldId: `${s.id}:subtitle`, slideId: s.id, slideIndex: i, kind: 'subtitle', label: 'Subtitle' });
      }
    }
    (s.elements || []).forEach((e) => {
      elementFieldSpecs(e).forEach(({ field, label }) => {
        const base = getByPath(e, field);
        if (typeof base !== 'string' || base.trim() === '') return; // only fields with actual text
        fields.push({
          fieldId: `${s.id}:el:${e.id}:${field}`,
          slideId: s.id,
          slideIndex: i,
          kind: 'element',
          elementId: e.id,
          elementField: field,
          label,
        });
      });
    });
  });
  return fields;
}

export function fieldBase(slide: Slide, f: LocField): string {
  if (f.kind === 'title') return slide.title.text;
  if (f.kind === 'subtitle') return slide.title.subtitle;
  const el = slide.elements?.find((e) => e.id === f.elementId);
  if (!el) return '';
  const v = getByPath(el, f.elementField || 'text');
  return typeof v === 'string' ? v : '';
}

export function fieldValue(slide: Slide, f: LocField, lang: Language): string {
  if (lang === BASE_LANGUAGE) return fieldBase(slide, f);
  if (f.kind === 'title') return slide.localizations?.[lang]?.title || '';
  if (f.kind === 'subtitle') return slide.localizations?.[lang]?.subtitle || '';
  const el = slide.elements?.find((e) => e.id === f.elementId);
  return el?.loc?.[lang]?.[f.elementField || 'text'] || '';
}

/** Return the element with every field replaced by its translation for `lang` (render-time). */
export function resolveElementForLanguage(el: SlideElement, lang: Language | undefined): SlideElement {
  if (!lang || lang === BASE_LANGUAGE) return el;
  const tr = el.loc?.[lang];
  if (!tr) return el;
  let clone: SlideElement | null = null;
  for (const [path, val] of Object.entries(tr)) {
    if (typeof val !== 'string' || val.trim() === '') continue;
    clone = setByPath(clone || el, path, val);
  }
  return clone || el;
}
