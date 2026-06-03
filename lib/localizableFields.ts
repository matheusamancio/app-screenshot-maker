import type { Slide, Language } from '@/types';
import { BASE_LANGUAGE } from '@/types';

export interface LocField {
  /** Stable id: `${slideId}:title` | `:subtitle` | `:el:${elementId}`. */
  fieldId: string;
  slideId: string;
  slideIndex: number;
  kind: 'title' | 'subtitle' | 'element';
  elementId?: string;
  label: string;
}

/** Every localizable text field across all slides (title, subtitle, text components). */
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
    (s.elements || [])
      .filter((e) => e.kind === 'text')
      .forEach((e) => {
        fields.push({
          fieldId: `${s.id}:el:${e.id}`,
          slideId: s.id,
          slideIndex: i,
          kind: 'element',
          elementId: e.id,
          label: `Text · ${(e.text || '').replace(/\n/g, ' ').slice(0, 22) || 'text'}`,
        });
      });
  });
  return fields;
}

export function fieldBase(slide: Slide, f: LocField): string {
  if (f.kind === 'title') return slide.title.text;
  if (f.kind === 'subtitle') return slide.title.subtitle;
  return slide.elements?.find((e) => e.id === f.elementId)?.text || '';
}

export function fieldValue(slide: Slide, f: LocField, lang: Language): string {
  if (lang === BASE_LANGUAGE) return fieldBase(slide, f);
  if (f.kind === 'title') return slide.localizations?.[lang]?.title || '';
  if (f.kind === 'subtitle') return slide.localizations?.[lang]?.subtitle || '';
  return slide.elements?.find((e) => e.id === f.elementId)?.loc?.[lang] || '';
}
