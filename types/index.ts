export type Platform = 'ios' | 'android' | 'both';
export type TemplateId = 'hero' | 'feature' | 'minimal' | 'social-proof' | 'split' | 'centered' | 'pill' | 'awards' | 'review' | 'feature-cards' | 'habit-hero';
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
  /** 'title' | 'subtitle' for the built-in title, or 'element' for a text component. */
  field: LocalizationField | 'element';
  /** Target text-element id when field === 'element'. */
  elementId?: string;
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

export interface FeatureCard {
  id: string;
  /** Bold heading shown at the top of the dark card. */
  title: string;
  /**
   * Newline-separated rows. Supported syntax per line:
   *  - "Label | Value"  → key/value row (value right-aligned)
   *  - "*text"          → highlighted row (selected option)
   *  - "text ›"         → plain sub-row (trailing › shows a chevron)
   */
  body: string;
}

/** Config for the 'habit-hero' template — floating emoji tiles + device showcase. */
export interface HabitHeroConfig {
  /** Floating habit tiles (emoji per tile). */
  emojis: string[];
  /** Show the black check badge on each tile + app icon. */
  showChecks: boolean;
  /** App icon emoji shown inside the device. */
  appEmoji: string;
  appName: string;
  appTagline: string;
  /** Big number near the device bottom, e.g. "+38,420". */
  ratingValue: string;
  ratingLabel: string;
  showLaurel: boolean;
  showStars: boolean;
  /** When true the template renders only the device backdrop — the tiles/app
   *  card/rating have been "broken apart" into movable elements. */
  exploded?: boolean;
}

export type ElementKind = 'text' | 'emoji' | 'shape' | 'heatmap' | 'card' | 'icon' | 'stars' | 'laurel' | 'datestrip' | 'barchart' | 'linechart' | 'streak' | 'button' | 'blur' | 'phone' | 'habitrow' | 'notification' | 'widget';

/** One row in a 'today' widget (check + emoji + name + meta). */
export interface WidgetRow {
  emoji: string;
  name: string;
  meta: string;
  done: boolean;
}

/** One plotted line/area in a 'linechart' element. */
export interface ChartSeries {
  label: string;
  color: string;
  /** Y values per x-tick; null = no point yet (the line starts later). */
  values: (number | null)[];
}

/** A free-floating, movable component placed on a slide (on top of the template). */
export interface SlideElement {
  id: string;
  kind: ElementKind;
  /** Center position in baseline coordinates (390 × 844). */
  x: number;
  y: number;
  rotation: number;
  scale: number;
  // text
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: Alignment;
  fontFamily?: string;
  /** Text box width in baseline px (auto when omitted). */
  width?: number;
  /** Per-language text overrides (text elements only). */
  loc?: Partial<Record<Language, string>>;
  // emoji
  emoji?: string;
  /** Render the emoji on a white rounded tile. */
  tile?: boolean;
  /** Show the black check badge. */
  check?: boolean;
  /** Tile / emoji size in baseline px. */
  size?: number;

  // box-based components (shape / heatmap / card / stars / datestrip)
  /** Box size in baseline px. */
  w?: number;
  h?: number;
  /** Fill / background colour. */
  bg?: string;
  /** Optional gradient end colour (vertical) for shapes. */
  bg2?: string;
  /** Corner radius in baseline px. */
  radius?: number;
  /** Shape geometry (shape kind). Defaults to 'rect'. */
  shapeType?: 'rect' | 'circle' | 'pill' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'line';
  /** 0..1 element opacity (applies to any element kind). */
  opacity?: number;
  /** Drop-shadow strength in baseline px (0 / undefined = none). Applies to any element kind. */
  shadow?: number;

  // card (dark/light widget with title + big value + caption)
  cardTitle?: string;
  cardValue?: string;
  cardCaption?: string;
  /** Accent colour for the value/icon. */
  accent?: string;

  // streak card (two-stat: current + record, divider, footer)
  /** Second-column label, e.g. "Recorde". */
  cardTitle2?: string;
  /** Second-column big value, e.g. "24". */
  cardValue2?: string;
  /** Unit suffix shown after big values, e.g. "d". */
  unit?: string;
  /** Show the 🔥 flame next to the current-streak value. */
  showFire?: boolean;

  // heatmap grid
  cols?: number;
  rows?: number;
  /** 0..1 fraction of filled cells. */
  fill?: number;
  /** Active-cell colour (inactive derived). */
  cell?: string;

  /** Shared id linking elements into a group (selected/moved together). */
  groupId?: string;

  // icon (named svg) — optionally on a rounded/circular tile with a check badge
  icon?: string;

  // button (rounded pill with editable label)
  /** Show a trailing arrow → on the button. */
  showArrow?: boolean;

  // blur panel (frosted overlay placed over the device to obscure content)
  /** Blur radius in baseline px. */
  blur?: number;

  // phone (device frame)
  /** Show the dynamic-island pill near the top (phone). */
  island?: boolean;
  /** Phone visual: 'gradient' (decorative dark→grey) or 'frame' (realistic bezel + light screen + status bar). */
  phoneStyle?: 'gradient' | 'frame';

  // widget (lock-screen / home-screen Norte widgets)
  /** Widget layout: today list · done square · month heatmap square. */
  variant?: 'today' | 'done' | 'month';
  /** Rows for the 'today' widget. */
  items?: WidgetRow[];

  // datestrip / charts
  /** Comma-separated x/day labels, e.g. "Q,S,S,D,S,T" or "FEV,MAR,ABR,MAI,JUN". */
  days?: string;
  /** Comma-separated numbers, e.g. "28,29,30,31,1,2" (datestrip) or bar values "33,35,36,52,88". */
  dates?: string;
  /** Index (0-based) of the highlighted day / bar. */
  activeIndex?: number;

  // heatmap card-mode chrome
  /** When true the heatmap renders inside a card with header (cardTitle/cardValue) + footer (cardCaption). */
  framed?: boolean;

  // barchart / linechart toggle pill + chrome
  /** Left toggle label (inactive). */
  toggleLeft?: string;
  /** Right toggle label (active). */
  toggleRight?: string;

  // linechart
  /** Plotted series (linechart). */
  series?: ChartSeries[];
  /** Comma-separated y-axis tick labels bottom→top, e.g. "0,23,45". */
  yTicks?: string;
  /** Max y value used to scale the plot (defaults to the largest series value). */
  yMax?: number;
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
  /** Stacked dark feature-highlight cards (used by the 'feature-cards' template). */
  featureCards?: FeatureCard[];
  /** Show the "& more!" footer under the cards. */
  featureMore?: boolean;
  /** Config for the 'habit-hero' template. */
  habitHero?: HabitHeroConfig;
  /** Free-floating movable components on top of the template. */
  elements?: SlideElement[];
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
  /** Set a text component's value for a language (base language writes element.text). */
  setElementLocalizedText: (slideId: string, elementId: string, lang: Language, value: string) => void;
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

  /** Currently selected on-canvas thing: 'title' | 'device' | `el:<id>` | null. */
  selectedElementId: string | null;
  setSelectedElement: (sel: string | null) => void;
  /** Multi-selection of element ids (for group move/resize). Mirrors selectedElementId for single selection. */
  selectedIds?: string[];
  /** Add/remove an element id from the multi-selection (shift/⌘-click). */
  toggleSelectedId: (id: string) => void;
  /** Apply patches to many elements at once (group transforms). */
  applyElementPatches: (slideId: string, patches: Record<string, Partial<SlideElement>>) => void;
  /** Delete every element in the current multi-selection. */
  deleteSelectedElements: (slideId: string) => void;
  /** Replace the multi-selection with the given element ids. */
  setSelectedIds: (ids: string[]) => void;
  /** Change an element's z-order within its slide. */
  reorderElement: (slideId: string, elementId: string, where: 'front' | 'back' | 'forward' | 'backward') => void;
  /** Duplicate an element in place (offset + selected). */
  duplicateElement: (slideId: string, elementId: string) => void;
  /** Link the given elements into a group (selected & moved together). */
  groupElements: (slideId: string, ids: string[]) => void;
  /** Remove the given elements from their group. */
  ungroupElements: (slideId: string, ids: string[]) => void;
  clipboardElement: SlideElement | null;
  addElement: (slideId: string, element: SlideElement, opts?: { select?: boolean }) => void;
  updateElement: (slideId: string, elementId: string, patch: Partial<SlideElement>) => void;
  deleteElement: (slideId: string, elementId: string) => void;
  copyElement: (slideId: string, elementId: string) => void;
  /** Paste the clipboard element onto a slide (offset + reselected). */
  pasteElement: (slideId: string) => void;
  /** Move an element from one slide to another at the given baseline coords. */
  moveElementToSlide: (fromSlideId: string, toSlideId: string, elementId: string, x: number, y: number) => void;

  /** Undo history (snapshots of `slides`). Internal — not persisted. */
  _past?: Slide[][];
  _future?: Slide[][];
  /** Step backward / forward through edit history. */
  undo: () => void;
  redo: () => void;

  /** True while an element is being move-dragged (shows alignment guides on every screen). */
  isDraggingElement?: boolean;
  setDraggingElement: (v: boolean) => void;

  /** The user's custom "My Template" — a saved collection of slide designs. */
  savedSlides?: Slide[];
  /** Save a copy of a slide into My Template. */
  saveSlideToTemplate: (slideId: string) => void;
  /** Replace the whole deck with My Template's saved slides. */
  applySavedTemplate: () => void;
  /** Append one saved slide to the current deck. */
  addSavedSlideToDeck: (index: number) => void;
  /** Remove one saved slide from My Template. */
  removeSavedSlide: (index: number) => void;
  /** Clear My Template. */
  clearSavedTemplate: () => void;
}
