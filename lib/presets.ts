import type { GradientStop, Language } from '@/types';
import { BASE_LANGUAGE } from '@/types';

export interface GradientPreset {
  id: string;
  label: string;
  stops: GradientStop[];
  angle: number;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'norte-indigo', label: 'Norte', stops: [{ color: '#5B5FED', position: 0 }, { color: '#818CF8', position: 100 }], angle: 135 },
  { id: 'norte-amber', label: 'Amber', stops: [{ color: '#F59E0B', position: 0 }, { color: '#FDE68A', position: 100 }], angle: 135 },
  { id: 'midnight', label: 'Midnight', stops: [{ color: '#0F172A', position: 0 }, { color: '#1E293B', position: 100 }], angle: 160 },
  { id: 'ocean', label: 'Ocean', stops: [{ color: '#0EA5E9', position: 0 }, { color: '#38BDF8', position: 100 }], angle: 135 },
  { id: 'forest', label: 'Forest', stops: [{ color: '#059669', position: 0 }, { color: '#34D399', position: 100 }], angle: 135 },
  { id: 'rose', label: 'Rose', stops: [{ color: '#F43F5E', position: 0 }, { color: '#FB7185', position: 100 }], angle: 135 },
  { id: 'warm', label: 'Warm', stops: [{ color: '#FAFAF8', position: 0 }, { color: '#F5F0E8', position: 100 }], angle: 180 },
  { id: 'slate', label: 'Slate', stops: [{ color: '#475569', position: 0 }, { color: '#94A3B8', position: 100 }], angle: 135 },
];

export interface LocaleInfo {
  code: Language;
  /** Short label shown in chips/columns, e.g. "EN-US". */
  label: string;
  /** Human language + region (often native script), e.g. "日本語 (Japanese)". */
  name: string;
  /** Clean English display name, e.g. "Traditional Chinese" — for chips, folders, menus. */
  display: string;
  /** Countries / stores that use this locale (from the localization plan). */
  countries: string;
  rtl?: boolean;
}

/** All export locales, ordered as in the localization plan. en-US is the base. */
export const LANGUAGES: LocaleInfo[] = [
  { code: 'en-US', label: 'EN-US', name: 'English (US)', display: 'English (US)', countries: 'US + global fallback' },
  { code: 'ja', label: 'JA', name: '日本語 (Japanese)', display: 'Japanese', countries: 'Japan' },
  { code: 'nl', label: 'NL', name: 'Nederlands (Dutch)', display: 'Dutch', countries: 'Netherlands, Belgium (Flemish)' },
  { code: 'es-MX', label: 'ES-MX', name: 'Español (Mexico)', display: 'Spanish (Mexico)', countries: 'Mexico + all Hispanic Latin America' },
  { code: 'es-ES', label: 'ES-ES', name: 'Español (Spain)', display: 'Spanish (Spain)', countries: 'Spain' },
  { code: 'de', label: 'DE', name: 'Deutsch (German)', display: 'German', countries: 'Germany, Austria, Switzerland, Liechtenstein' },
  { code: 'pt-BR', label: 'PT-BR', name: 'Português (Brazil)', display: 'Portuguese (Brazil)', countries: 'Brazil' },
  { code: 'zh-Hant', label: 'ZH-HANT', name: '繁體中文 (Traditional Chinese)', display: 'Traditional Chinese', countries: 'Taiwan, Hong Kong, Macau' },
  { code: 'fr-FR', label: 'FR-FR', name: 'Français (French)', display: 'French', countries: 'France, Belgium, Switzerland, Monaco, Francophone Africa' },
  { code: 'en-CA', label: 'EN-CA', name: 'English (Canada)', display: 'English (Canada)', countries: 'Canada' },
  { code: 'ar', label: 'AR', name: 'العربية (Arabic MSA)', display: 'Arabic (MSA)', countries: 'Saudi, UAE, Gulf, Egypt, MENA', rtl: true },
  { code: 'ko', label: 'KO', name: '한국어 (Korean)', display: 'Korean', countries: 'South Korea' },
  { code: 'en-AU', label: 'EN-AU', name: 'English (Australia)', display: 'English (Australia)', countries: 'Australia, New Zealand' },
  { code: 'en-GB', label: 'EN-GB', name: 'English (UK)', display: 'English (UK)', countries: 'UK, Ireland, India/Gulf/SEA/Africa fallback' },
];

export const ALL_LANGUAGE_CODES: Language[] = LANGUAGES.map((l) => l.code);

export function getLocale(code: Language): LocaleInfo | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

export function isRtl(code: Language): boolean {
  return !!getLocale(code)?.rtl;
}

export const isBaseLanguage = (code: Language): boolean => code === BASE_LANGUAGE;
