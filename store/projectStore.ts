'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ProjectState,
  Slide,
  GlobalSettings,
  BackgroundConfig,
  TitleConfig,
  DeviceConfig,
  OverlayImageConfig,
  Language,
  LocalizationEntry,
  LocalizationField,
  LocalizationCell,
  ElementTransform,
  TransformableElement,
  SlideElement,
} from '@/types';
import { IDENTITY_TRANSFORM, BASE_LANGUAGE } from '@/types';
import { ALL_LANGUAGE_CODES, isBaseLanguage } from '@/lib/presets';
import { uid } from '@/lib/utils';
import { getKit } from '@/lib/starterKits';

const defaultBackground: BackgroundConfig = {
  type: 'linear-gradient',
  gradientStops: [
    { color: '#5B5FED', position: 0 },
    { color: '#818CF8', position: 100 },
  ],
  gradientAngle: 135,
  presetId: 'norte-indigo',
};

const defaultTitle: TitleConfig = {
  text: 'Build something\nbeautiful.',
  subtitle: 'A short tagline that explains what your app does.',
  showSubtitle: false,
  fontFamily: 'Sora',
  fontSize: 38,
  fontWeight: 700,
  color: '#FFFFFF',
  subtitleColor: '#FFFFFFCC',
  subtitleFontSize: 18,
  alignment: 'center',
  position: 'top',
  floatingPosition: 'top',
  layer: { visible: true, opacity: 1, locked: false },
};

const defaultDevice: DeviceConfig = {
  frameType: 'iphone-15',
  frameStyle: 'real-dark',
  orientation: 'portrait',
  scale: 90,
  verticalPosition: 'center',
  layer: { visible: true, opacity: 1, locked: false },
};

const defaultOverlay: OverlayImageConfig = {
  imageBase64: null,
  fit: 'contain',
  opacity: 1,
  verticalPosition: 'center',
  layer: { visible: true, opacity: 1, locked: false },
};

const defaultGlobals: GlobalSettings = {
  fontFamily: 'Sora',
  primaryColor: '#5B5FED',
  accentColor: '#F59E0B',
  background: { ...defaultBackground },
  deviceFrameStyle: 'real-dark',
};

function makeSlide(): Slide {
  return {
    id: uid(),
    screenshot: null,
    template: 'hero',
    background: { ...defaultBackground },
    title: { ...defaultTitle },
    device: { ...defaultDevice },
    overlayImage: { ...defaultOverlay },
    localizations: {},
    linkedToGlobals: true,
  };
}

const initialSlide = makeSlide();

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      name: 'My App Screenshots',
      platform: 'both',
      appName: 'My App',
      defaultLanguage: BASE_LANGUAGE,
      slides: [initialSlide],
      activeSlideId: initialSlide.id,
      previewDeviceId: 'iphone-69',
      activeLanguage: BASE_LANGUAGE,
      enabledLanguages: [...ALL_LANGUAGE_CODES],
      globals: defaultGlobals,
      activeKitId: null,
      _past: [],
      _future: [],
      isDraggingElement: false,
      setDraggingElement: (v) => set({ isDraggingElement: v }),

      savedSlides: [],
      saveSlideToTemplate: (slideId) =>
        set((state) => {
          const slide = state.slides.find((s) => s.id === slideId);
          if (!slide) return {};
          const copy: Slide = { ...JSON.parse(JSON.stringify(slide)), id: uid() };
          return { savedSlides: [...(state.savedSlides || []), copy] };
        }),
      applySavedTemplate: () =>
        set((state) => {
          const saved = state.savedSlides || [];
          if (!saved.length) return {};
          const slides = saved.map((s) => ({ ...JSON.parse(JSON.stringify(s)), id: uid() }));
          return { slides, activeSlideId: slides[0].id, selectedElementId: null };
        }),
      addSavedSlideToDeck: (index) =>
        set((state) => {
          const s = (state.savedSlides || [])[index];
          if (!s) return {};
          const copy: Slide = { ...JSON.parse(JSON.stringify(s)), id: uid() };
          return { slides: [...state.slides, copy], activeSlideId: copy.id, selectedElementId: null };
        }),
      removeSavedSlide: (index) =>
        set((state) => ({ savedSlides: (state.savedSlides || []).filter((_, i) => i !== index) })),
      clearSavedTemplate: () => set({ savedSlides: [] }),

      undo: () =>
        set((state) => {
          const past = state._past || [];
          if (!past.length) return {};
          _suppressHistory = true;
          return {
            slides: past[past.length - 1],
            _past: past.slice(0, -1),
            _future: [state.slides, ...(state._future || [])].slice(0, 60),
            selectedElementId: null,
          };
        }),
      redo: () =>
        set((state) => {
          const future = state._future || [];
          if (!future.length) return {};
          _suppressHistory = true;
          return {
            slides: future[0],
            _future: future.slice(1),
            _past: [...(state._past || []), state.slides].slice(-60),
            selectedElementId: null,
          };
        }),

      setName: (name) => set({ name }),
      setPlatform: (p) => set({ platform: p }),
      setAppName: (n) => set({ appName: n }),
      setDefaultLanguage: (l) => set({ defaultLanguage: l }),

      addSlide: () => {
        const s = makeSlide();
        const g = get().globals;
        s.background = { ...g.background };
        s.title = { ...defaultTitle, fontFamily: g.fontFamily, color: '#FFFFFF' };
        s.device = { ...defaultDevice, frameStyle: g.deviceFrameStyle };
        set((state) => ({ slides: [...state.slides, s], activeSlideId: s.id }));
      },

      updateSlide: (id, data) =>
        set((state) => ({
          slides: state.slides.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      duplicateSlide: (id) =>
        set((state) => {
          const idx = state.slides.findIndex((s) => s.id === id);
          if (idx < 0) return state;
          const copy: Slide = JSON.parse(JSON.stringify(state.slides[idx]));
          copy.id = uid();
          const next = [...state.slides];
          next.splice(idx + 1, 0, copy);
          return { slides: next, activeSlideId: copy.id };
        }),

      deleteSlide: (id) =>
        set((state) => {
          if (state.slides.length === 1) return state;
          const next = state.slides.filter((s) => s.id !== id);
          const wasActive = state.activeSlideId === id;
          return {
            slides: next,
            activeSlideId: wasActive ? next[0].id : state.activeSlideId,
          };
        }),

      reorderSlides: (oldIndex, newIndex) =>
        set((state) => {
          const next = [...state.slides];
          const [moved] = next.splice(oldIndex, 1);
          next.splice(newIndex, 0, moved);
          return { slides: next };
        }),

      setActiveSlide: (id) => set({ activeSlideId: id }),
      setPreviewDevice: (deviceId) => set({ previewDeviceId: deviceId }),
      setActiveLanguage: (lang) => set({ activeLanguage: lang }),

      toggleLanguage: (lang) =>
        set((state) => {
          const has = state.enabledLanguages.includes(lang);
          if (has && isBaseLanguage(lang)) return state;
          if (has) {
            return {
              enabledLanguages: state.enabledLanguages.filter((l) => l !== lang),
              activeLanguage: state.activeLanguage === lang ? BASE_LANGUAGE : state.activeLanguage,
            };
          }
          // Keep canonical LANGUAGES ordering for a stable grid layout.
          return {
            enabledLanguages: ALL_LANGUAGE_CODES.filter(
              (c) => c === lang || state.enabledLanguages.includes(c),
            ),
          };
        }),

      setEnabledLanguages: (langs) =>
        set((state) => {
          const next = ALL_LANGUAGE_CODES.filter((c) => isBaseLanguage(c) || langs.includes(c));
          return {
            enabledLanguages: next,
            activeLanguage: next.includes(state.activeLanguage) ? state.activeLanguage : BASE_LANGUAGE,
          };
        }),

      updateLocalization: (slideId, lang, entry) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId
              ? { ...s, localizations: { ...s.localizations, [lang]: entry } }
              : s,
          ),
        })),

      setLocalizedText: (slideId, lang, field, value) =>
        set((state) => ({
          slides: state.slides.map((s) => {
            if (s.id !== slideId) return s;
            if (isBaseLanguage(lang)) {
              const key = field === 'title' ? 'text' : 'subtitle';
              return { ...s, title: { ...s.title, [key]: value } };
            }
            const prev = s.localizations?.[lang] || { title: '', subtitle: '' };
            return { ...s, localizations: { ...s.localizations, [lang]: { ...prev, [field]: value } } };
          }),
        })),

      setElementLocalizedText: (slideId, elementId, lang, value) =>
        set((state) => ({
          slides: state.slides.map((s) => {
            if (s.id !== slideId) return s;
            return {
              ...s,
              elements: (s.elements || []).map((el) => {
                if (el.id !== elementId) return el;
                if (isBaseLanguage(lang)) return { ...el, text: value };
                return { ...el, loc: { ...(el.loc || {}), [lang]: value } };
              }),
            };
          }),
        })),

      applyLocalizationCells: (cells) =>
        set((state) => {
          if (!cells.length) return state;
          // Group cells by slide so each slide is rebuilt once.
          const bySlide = new Map<string, LocalizationCell[]>();
          for (const c of cells) {
            const arr = bySlide.get(c.slideId);
            if (arr) arr.push(c);
            else bySlide.set(c.slideId, [c]);
          }
          return {
            slides: state.slides.map((s) => {
              const updates = bySlide.get(s.id);
              if (!updates) return s;
              let title = { ...s.title };
              const localizations = { ...s.localizations };
              let elements = s.elements;
              for (const u of updates) {
                if (u.field === 'element' && u.elementId) {
                  elements = (elements || []).map((el) => {
                    if (el.id !== u.elementId) return el;
                    if (isBaseLanguage(u.lang)) return { ...el, text: u.value };
                    return { ...el, loc: { ...(el.loc || {}), [u.lang]: u.value } };
                  });
                } else if (isBaseLanguage(u.lang)) {
                  if (u.field === 'title') title = { ...title, text: u.value };
                  else if (u.field === 'subtitle') title = { ...title, subtitle: u.value };
                } else {
                  const prev = localizations[u.lang] || { title: '', subtitle: '' };
                  if (u.field === 'title' || u.field === 'subtitle') {
                    localizations[u.lang] = { ...prev, [u.field]: u.value };
                  }
                }
              }
              return { ...s, title, localizations, elements };
            }),
          };
        }),

      updateGlobals: (g) => set((state) => ({ globals: { ...state.globals, ...g } })),

      applyGlobalsToAll: () =>
        set((state) => ({
          slides: state.slides.map((s) => ({
            ...s,
            background: { ...state.globals.background },
            title: { ...s.title, fontFamily: state.globals.fontFamily },
            device: { ...s.device, frameStyle: state.globals.deviceFrameStyle },
            linkedToGlobals: true,
          })),
        })),

      applyStarterKit: (kitId, options = {}) =>
        set((state) => {
          const kit = getKit(kitId);
          if (!kit) return state;
          const existingScreenshots = state.slides.map((s) => s.screenshot);
          const newSlides: Slide[] = kit.slides.map((ks, i) => {
            const id = uid();
            const full = ks.fullImage;
            const hideTitle = !!full || !!ks.noTitle || !!ks.noChrome;
            const hideDevice = !!full || !!ks.noChrome;
            return {
              id,
              screenshot: options.keepScreenshots ? existingScreenshots[i] || null : null,
              template: ks.template,
              background: full
                ? { type: 'image', imageBase64: full }
                : JSON.parse(JSON.stringify(kit.background)),
              title: {
                ...defaultTitle,
                ...kit.title,
                text: ks.title,
                subtitle: ks.subtitle || '',
                showSubtitle: !!ks.showSubtitle,
                ...(ks.titleOverride || {}),
                layer: { visible: !hideTitle, opacity: 1, locked: false },
              },
              device: {
                ...defaultDevice,
                frameType: kit.device.frameType,
                frameStyle: kit.device.frameStyle,
                scale: kit.device.scale,
                layer: { visible: !hideDevice, opacity: 1, locked: false },
              },
              overlayImage: { ...defaultOverlay },
              localizations: {},
              featureCards: ks.featureCards ? ks.featureCards.map((c) => ({ id: uid(), title: c.title, body: c.body })) : undefined,
              featureMore: ks.featureMore,
              elements: ks.elements ? ks.elements.map((e) => ({ ...e, id: uid() })) : undefined,
              linkedToGlobals: true,
              role: ks.role,
            };
          });
          return {
            slides: newSlides,
            activeSlideId: newSlides[0].id,
            activeKitId: kit.id,
            globals: {
              ...state.globals,
              fontFamily: kit.title.fontFamily || state.globals.fontFamily,
              background: JSON.parse(JSON.stringify(kit.background)),
              deviceFrameStyle: kit.device.frameStyle,
            },
          };
        }),

      updateElementTransform: (slideId, element, patch) =>
        set((state) => ({
          slides: state.slides.map((s) => {
            if (s.id !== slideId) return s;
            const key = element === 'title' ? 'titleTransform' : 'deviceTransform';
            const current = (s[key] as ElementTransform | undefined) || IDENTITY_TRANSFORM;
            return { ...s, [key]: { ...current, ...patch } };
          }),
        })),

      resetElementTransform: (slideId, element) =>
        set((state) => ({
          slides: state.slides.map((s) => {
            if (s.id !== slideId) return s;
            const key = element === 'title' ? 'titleTransform' : 'deviceTransform';
            return { ...s, [key]: { ...IDENTITY_TRANSFORM } };
          }),
        })),

      selectedElementId: null,
      selectedIds: [],
      setSelectedElement: (sel) =>
        set({ selectedElementId: sel, selectedIds: sel && sel.startsWith('el:') ? [sel.slice(3)] : [] }),
      toggleSelectedId: (id) =>
        set((state) => {
          const cur = state.selectedIds || [];
          const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
          return { selectedIds: next, selectedElementId: next.length ? `el:${next[next.length - 1]}` : null };
        }),
      applyElementPatches: (slideId, patches) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId
              ? { ...s, elements: (s.elements || []).map((el) => (patches[el.id] ? { ...el, ...patches[el.id] } : el)) }
              : s,
          ),
        })),
      deleteSelectedElements: (slideId) =>
        set((state) => {
          const sel = state.selectedIds || [];
          if (!sel.length) return {};
          return {
            slides: state.slides.map((s) =>
              s.id === slideId ? { ...s, elements: (s.elements || []).filter((el) => !sel.includes(el.id)) } : s,
            ),
            selectedElementId: null,
            selectedIds: [],
          };
        }),
      setSelectedIds: (ids) => set({ selectedIds: ids, selectedElementId: ids.length ? `el:${ids[ids.length - 1]}` : null }),
      reorderElement: (slideId, elementId, where) =>
        set((state) => ({
          slides: state.slides.map((s) => {
            if (s.id !== slideId) return s;
            const els = [...(s.elements || [])];
            const i = els.findIndex((e) => e.id === elementId);
            if (i < 0) return s;
            const [el] = els.splice(i, 1);
            if (where === 'front') els.push(el);
            else if (where === 'back') els.unshift(el);
            else if (where === 'forward') els.splice(Math.min(els.length, i + 1), 0, el);
            else els.splice(Math.max(0, i - 1), 0, el);
            return { ...s, elements: els };
          }),
        })),
      duplicateElement: (slideId, elementId) =>
        set((state) => {
          const slide = state.slides.find((s) => s.id === slideId);
          const el = slide?.elements?.find((e) => e.id === elementId);
          if (!el) return {};
          const clone: SlideElement = { ...JSON.parse(JSON.stringify(el)), id: uid(), x: el.x + 16, y: el.y + 16, groupId: undefined };
          return {
            slides: state.slides.map((s) => (s.id === slideId ? { ...s, elements: [...(s.elements || []), clone] } : s)),
            selectedElementId: `el:${clone.id}`,
            selectedIds: [clone.id],
          };
        }),
      groupElements: (slideId, ids) =>
        set((state) => {
          if (ids.length < 2) return {};
          const gid = uid();
          return {
            slides: state.slides.map((s) =>
              s.id === slideId ? { ...s, elements: (s.elements || []).map((el) => (ids.includes(el.id) ? { ...el, groupId: gid } : el)) } : s,
            ),
          };
        }),
      ungroupElements: (slideId, ids) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId ? { ...s, elements: (s.elements || []).map((el) => (ids.includes(el.id) ? { ...el, groupId: undefined } : el)) } : s,
          ),
        })),
      clipboardElement: null,

      addElement: (slideId, element, opts) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId ? { ...s, elements: [...(s.elements || []), element] } : s,
          ),
          selectedElementId: opts?.select === false ? state.selectedElementId : `el:${element.id}`,
          selectedIds: opts?.select === false ? state.selectedIds : [element.id],
        })),

      updateElement: (slideId, elementId, patch) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId
              ? { ...s, elements: (s.elements || []).map((el) => (el.id === elementId ? { ...el, ...patch } : el)) }
              : s,
          ),
        })),

      deleteElement: (slideId, elementId) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId ? { ...s, elements: (s.elements || []).filter((el) => el.id !== elementId) } : s,
          ),
          selectedElementId: state.selectedElementId === `el:${elementId}` ? null : state.selectedElementId,
          selectedIds: (state.selectedIds || []).filter((x) => x !== elementId),
        })),

      copyElement: (slideId, elementId) =>
        set((state) => {
          const slide = state.slides.find((s) => s.id === slideId);
          const el = slide?.elements?.find((e) => e.id === elementId);
          return el ? { clipboardElement: JSON.parse(JSON.stringify(el)) } : {};
        }),

      pasteElement: (slideId) =>
        set((state) => {
          const src = state.clipboardElement;
          if (!src) return {};
          const clone: SlideElement = { ...JSON.parse(JSON.stringify(src)), id: uid(), x: src.x + 18, y: src.y + 18 };
          return {
            slides: state.slides.map((s) =>
              s.id === slideId ? { ...s, elements: [...(s.elements || []), clone] } : s,
            ),
            selectedElementId: `el:${clone.id}`,
          };
        }),

      moveElementToSlide: (fromSlideId, toSlideId, elementId, x, y) =>
        set((state) => {
          if (fromSlideId === toSlideId) {
            return {
              slides: state.slides.map((s) =>
                s.id === fromSlideId
                  ? { ...s, elements: (s.elements || []).map((el) => (el.id === elementId ? { ...el, x, y } : el)) }
                  : s,
              ),
            };
          }
          const from = state.slides.find((s) => s.id === fromSlideId);
          const el = from?.elements?.find((e) => e.id === elementId);
          if (!el) return {};
          const moved: SlideElement = { ...el, x, y };
          return {
            slides: state.slides.map((s) => {
              if (s.id === fromSlideId) return { ...s, elements: (s.elements || []).filter((e) => e.id !== elementId) };
              if (s.id === toSlideId) return { ...s, elements: [...(s.elements || []), moved] };
              return s;
            }),
            activeSlideId: toSlideId,
            selectedElementId: `el:${elementId}`,
          };
        }),

      applyAIGeneration: (kitId, aiSlides, screenshots) =>
        set((state) => {
          const kit = getKit(kitId);
          if (!kit) return state;
          const newSlides: Slide[] = kit.slides.map((ks, i) => {
            const ai = aiSlides[i];
            return {
              id: uid(),
              screenshot: screenshots[i] || null,
              template: ks.template,
              background: JSON.parse(JSON.stringify(kit.background)),
              title: {
                ...defaultTitle,
                ...kit.title,
                text: ai?.title || ks.title,
                subtitle: ai?.subtitle || ks.subtitle || '',
                showSubtitle: ai?.showSubtitle ?? !!ks.showSubtitle,
                layer: { visible: true, opacity: 1, locked: false },
              },
              device: {
                ...defaultDevice,
                frameType: kit.device.frameType,
                frameStyle: kit.device.frameStyle,
                scale: kit.device.scale,
              },
              overlayImage: { ...defaultOverlay },
              localizations: {},
              linkedToGlobals: true,
              role: ks.role,
            };
          });
          return {
            slides: newSlides,
            activeSlideId: newSlides[0].id,
            activeKitId: kit.id,
            globals: {
              ...state.globals,
              fontFamily: kit.title.fontFamily || state.globals.fontFamily,
              background: JSON.parse(JSON.stringify(kit.background)),
              deviceFrameStyle: kit.device.frameStyle,
            },
          };
        }),

      copySlideSettings: (fromId, toIds) =>
        set((state) => {
          const src = state.slides.find((s) => s.id === fromId);
          if (!src) return state;
          const targets = toIds === 'all' ? state.slides.map((s) => s.id).filter((id) => id !== fromId) : toIds;
          return {
            slides: state.slides.map((s) =>
              targets.includes(s.id)
                ? {
                    ...s,
                    template: src.template,
                    background: JSON.parse(JSON.stringify(src.background)),
                    title: { ...src.title, text: s.title.text, subtitle: s.title.subtitle },
                    device: JSON.parse(JSON.stringify(src.device)),
                    overlayImage: JSON.parse(JSON.stringify(src.overlayImage)),
                  }
                : s,
            ),
          };
        }),
    }),
    {
      name: 'screenforge-project-v1',
      version: 2,
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([k]) => k !== '_past' && k !== '_future' && k !== 'isDraggingElement')) as ProjectState,
      migrate: (persisted: any, version: number) => {
        if (!persisted || version >= 2) return persisted;
        // v1 used generic codes (en/es/fr/zh). Map them to the new App Store locales.
        const map: Record<string, Language> = {
          en: 'en-US',
          es: 'es-MX',
          fr: 'fr-FR',
          zh: 'zh-Hant',
        };
        const remap = (c: string): Language => (map[c] || c) as Language;

        persisted.activeLanguage = remap(persisted.activeLanguage || 'en');
        persisted.defaultLanguage = remap(persisted.defaultLanguage || 'en');
        // The localization feature is about shipping every store locale — enable them all.
        persisted.enabledLanguages = [...ALL_LANGUAGE_CODES];
        persisted.slides = (persisted.slides || []).map((s: any) => {
          const localizations: Record<string, LocalizationEntry> = {};
          Object.entries(s.localizations || {}).forEach(([k, v]) => {
            localizations[remap(k)] = v as LocalizationEntry;
          });
          return { ...s, localizations };
        });
        return persisted;
      },
    },
  ),
);

/**
 * Edit-history recorder. Watches `slides` changes and pushes the *previous*
 * snapshot onto the undo stack, coalescing rapid bursts (e.g. a drag) into a
 * single step. `_suppressHistory` skips recording during undo/redo.
 */
let _suppressHistory = false;
let _lastHistoryTs = 0;
useProjectStore.subscribe((state, prev) => {
  if (state.slides === prev.slides) return; // only slide content changes
  if (_suppressHistory) {
    _suppressHistory = false;
    return;
  }
  const now = Date.now();
  const coalesce = now - _lastHistoryTs < 600 && (state._past || []).length > 0;
  _lastHistoryTs = now;
  if (coalesce) return; // merge bursts into one undo step
  useProjectStore.setState((s) => ({ _past: [...(s._past || []), prev.slides].slice(-60), _future: [] }));
});

export function getActiveSlide(state: ProjectState): Slide {
  return state.slides.find((s) => s.id === state.activeSlideId) || state.slides[0];
}

export function getSlideText(slide: Slide, lang: Language): { title: string; subtitle: string } {
  const loc = slide.localizations?.[lang];
  if (loc && (loc.title || loc.subtitle)) {
    return {
      title: loc.title || slide.title.text,
      subtitle: loc.subtitle || slide.title.subtitle,
    };
  }
  return { title: slide.title.text, subtitle: slide.title.subtitle };
}
