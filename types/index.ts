export type Platform = 'ios' | 'android' | 'both';
export type TemplateId = 'hero' | 'feature' | 'minimal' | 'social-proof' | 'split' | 'centered';
export type DeviceFrameType = 'iphone-15' | 'iphone-15-pro' | 'pixel-8' | 'ipad' | 'none';
export type DeviceFrameStyle = 'real-dark' | 'real-light' | 'clay-dark' | 'clay-light' | 'outline' | 'none';
export type TextPosition = 'top' | 'middle' | 'bottom';
export type Language =
  | 'en-US'
  | 'en-GB'
  | 'en-CA'
  | 'en-AU'
  | 'es-MX'
  | 'fr-FR'
  | 'de'
  | 'ja'
  | 'ar'
  | 'nl'
  | 'zh-Hant'
  | 'ko'
  | 'pt-BR';

/** The canonical/base locale. Its text lives on the slide itself (title.text). */
export const BASE_LANGUAGE: Language = 'en-US';

export type LocalizationField = 'title' | 'subtitle';

/** A single edited cell, used for batch grid/paste updates. */
export interface LocalizationCell {
  slideId: string;
  lang: Language;
  field: LocalizationField;
  value: string;
}
export type BackgroundType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image' | 'mesh' | 'none';
export type Alignment = 'left' | 'center' | 'right';

export interface GradientStop {
  color: string;
  position: number;
}

export interface BackgroundConfig {
  type: BackgroundType;
  solidColor?: string;
  gradientStops?: GradientStop[];
  gradientAngle?: number;
  imageBase64?: string;
  presetId?: string;
}

export interface LayerSettings {
  visible: boolean;
  opacity: number;
  locked: boolean;
}

export interface TitleConfig {
  text: string;
  subtitle: string;
  showSubtitle: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  subtitleColor: string;
  subtitleFontSize: number;
  alignment: Alignment;
  position: TextPosition;
  floatingPosition: 'top' | 'middle' | 'bottom';
  layer: LayerSettings;
}

export interface DeviceConfig {
  frameType: DeviceFrameType;
  frameStyle: DeviceFrameStyle;
  orientation: 'portrait' | 'landscape';
  scale: number;
  verticalPosition: 'top' | 'center' | 'bottom';
  layer: LayerSettings;
}

export interface OverlayImageConfig {
  imageBase64: string | null;
  fit: 'contain' | 'cover' | 'fill';
  opacity: number;
  verticalPosition: 'top' | 'center' | 'bottom';
  layer: LayerSettings;
}

export interface LocalizationEntry {
  title: string;
  subtitle: string;
}

export type SlideRole = 'hero' | 'use-case' | 'differentiator' | 'secondary' | 'proof' | 'cta';

export interface ElementTransform {
  /** Logical-px offset from the template's default position (baseline 390x844). */
  x: number;
  y: number;
  /** Degrees. */
  rotation: number;
  /** Multiplier on top of the template's natural size. 1 = template default. */
  scale: number;
}

export const IDENTITY_TRANSFORM: ElementTransform = { x: 0, y: 0, rotation: 0, scale: 1 };

export type TransformableElement = 'title' | 'device';

export interface Slide {
  id: string;
  screenshot: string | null;
  template: TemplateId;
  background: BackgroundConfig;
  title: TitleConfig;
  device: DeviceConfig;
  overlayImage: OverlayImageConfig;
  localizations: Partial<Record<Language, LocalizationEntry>>;
  linkedToGlobals: boolean;
  role?: SlideRole;
  titleTransform?: ElementTransform;
  deviceTransform?: ElementTransform;
}

export interface GlobalSettings {
  fontFamily: string;
  primaryColor: string;
  accentColor: string;
  background: BackgroundConfig;
  deviceFrameStyle: DeviceFrameStyle;
}

export interface SetupConfig {
  appName: string;
  defaultLanguage: Language;
}

export interface ProjectState {
  name: string;
  platform: Platform;
  appName: string;
  defaultLanguage: Language;
  slides: Slide[];
  activeSlideId: string;
  previewDeviceId: string;
  activeLanguage: Language;
  enabledLanguages: Language[];
  globals: GlobalSettings;
  setName: (name: string) => void;
  setPlatform: (p: Platform) => void;
  setAppName: (n: string) => void;
  setDefaultLanguage: (l: Language) => void;
  addSlide: () => void;
  updateSlide: (id: string, data: Partial<Slide>) => void;
  duplicateSlide: (id: string) => void;
  deleteSlide: (id: string) => void;
  reorderSlides: (oldIndex: number, newIndex: number) => void;
  setActiveSlide: (id: string) => void;
  setPreviewDevice: (deviceId: string) => void;
  setActiveLanguage: (lang: Language) => void;
  toggleLanguage: (lang: Language) => void;
  setEnabledLanguages: (langs: Language[]) => void;
  updateLocalization: (slideId: string, lang: Language, entry: LocalizationEntry) => void;
  /** Set a single localized field, routing the base language to the slide's own text. */
  setLocalizedText: (slideId: string, lang: Language, field: LocalizationField, value: string) => void;
  /** Apply many localized cells at once (used by grid block-paste). */
  applyLocalizationCells: (cells: LocalizationCell[]) => void;
  updateGlobals: (g: Partial<GlobalSettings>) => void;
  applyGlobalsToAll: () => void;
  copySlideSettings: (fromId: string, toIds: 'all' | string[]) => void;
  applyStarterKit: (kitId: string, options?: { keepScreenshots?: boolean }) => void;
  activeKitId: string | null;
  applyAIGeneration: (
    kitId: string,
    aiSlides: { role: SlideRole; title: string; subtitle: string; showSubtitle: boolean }[],
    screenshots: (string | null)[],
  ) => void;
  updateElementTransform: (
    slideId: string,
    element: TransformableElement,
    patch: Partial<ElementTransform>,
  ) => void;
  resetElementTransform: (slideId: string, element: TransformableElement) => void;
}
