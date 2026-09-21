import type {
  BackgroundConfig,
  TitleConfig,
  DeviceConfig,
  TemplateId,
  DeviceFrameType,
  DeviceFrameStyle,
  SlideElement,
} from '@/types';
import { NORTE_SCREENS, NORTE_SCREEN_TITLES } from './norteScreensData';

export type RecipeRole = 'hero' | 'use-case' | 'differentiator' | 'secondary' | 'proof' | 'cta';

export interface StarterKitSlide {
  template: TemplateId;
  title: string;
  subtitle?: string;
  showSubtitle?: boolean;
  role?: RecipeRole;
  titleOverride?: Partial<TitleConfig>;
  featureCards?: { title: string; body: string }[];
  featureMore?: boolean;
  /** Free movable components seeded onto the slide (ids assigned on apply). */
  elements?: Omit<SlideElement, 'id'>[];
  /** A finished full-bleed screenshot (public URL). Hides title + device. */
  fullImage?: string;
  /** Hide the built-in title (the slide is composed entirely of components). */
  noTitle?: boolean;
  /** Hide title AND device — the whole screen is built from components. */
  noChrome?: boolean;
}

export const RECIPE_ROLES: { id: RecipeRole; label: string; hint: string }[] = [
  { id: 'hero', label: 'Hero', hint: 'Headline + product hero. Must work as a thumbnail.' },
  { id: 'use-case', label: 'Use case', hint: 'The main thing your app does.' },
  { id: 'differentiator', label: 'Differentiator', hint: 'Why your app is different.' },
  { id: 'secondary', label: 'Feature', hint: 'A secondary feature worth showing.' },
  { id: 'proof', label: 'Social proof', hint: 'Awards, ratings, user count.' },
  { id: 'cta', label: 'CTA', hint: 'Closing nudge to download.' },
];

export interface StarterKit {
  id: string;
  name: string;
  tagline: string;
  background: BackgroundConfig;
  title: Pick<TitleConfig, 'fontFamily' | 'fontSize' | 'fontWeight' | 'color' | 'subtitleColor' | 'subtitleFontSize' | 'alignment'>;
  device: { frameType: DeviceFrameType; frameStyle: DeviceFrameStyle; scale: number };
  slides: StarterKitSlide[];
  // Color used in the gallery card preview
  swatch: string;
}

const NORTE_EMOJI = (x: number, y: number, emoji: string, rotation: number): Omit<SlideElement, 'id'> => ({
  kind: 'emoji',
  x,
  y,
  rotation,
  scale: 1,
  emoji,
  tile: true,
  check: true,
  size: 56,
});

const HEADLINE = (text: string): Omit<SlideElement, 'id'> => ({
  kind: 'text',
  x: 195,
  y: 96,
  rotation: 0,
  scale: 1,
  text,
  fontSize: 38,
  fontWeight: 800,
  color: '#111111',
  align: 'center',
  width: 340,
});
const SUBHEAD = (text: string): Omit<SlideElement, 'id'> => ({
  kind: 'text',
  x: 195,
  y: 168,
  rotation: 0,
  scale: 1,
  text,
  fontSize: 17,
  fontWeight: 500,
  color: '#6B6B6B',
  align: 'center',
  width: 320,
});

/** Roles of the seven extracted screens — the cover (NORTE_COVER) is the hero, so the old hero becomes a use-case screen. */
const NORTE_ROLES: RecipeRole[] = ['use-case', 'use-case', 'differentiator', 'secondary', 'secondary', 'secondary', 'cta'];

/** Clean single-line pill headlines (the source splits the pill word into its own node). */
const NORTE_HEADLINES = [
  '[Track] Every Habit,\nEvery Day',
  'One Tap.\n[One Square.]',
  'Build Daily [Streaks]\nThat Stick',
  'Gentle Nudges,\n[Real Habits]',
  '[Private] by Design\nNo Account',
  'See Your Whole [Year]\nat a Glance',
  'Start [Today]\nBuild Better Habits',
];

/**
 * The HTML extraction captures the headline as separate absolutely-positioned
 * nodes (a black line + a white "pill word" on its own dark pill shape). Rendered
 * as independent centered text boxes those overlap, so for the headline ONLY we
 * collapse those split parts (+ the pill background) into one tidy pill-markup
 * headline. Every other captured component (device, tiles, cards, charts,
 * heatmaps, body text) is kept exactly as extracted — faithful to the source.
 */
function cleanNorteScreen(els: Omit<SlideElement, 'id'>[], i: number): Omit<SlideElement, 'id'>[] {
  const kept = els.filter((e) => {
    // drop the split headline text parts (large text in the top band)
    if (e.kind === 'text' && (e.fontSize || 0) >= 22 && (e.y || 0) < 110) return false;
    // drop the small dark "pill" background behind the headline word
    if (e.kind === 'shape' && (e.y || 0) < 110 && (e.h || 0) < 40 && e.bg === '#1a1a1a' && (e.radius || 0) <= 9) return false;
    return true;
  });
  const headline: Omit<SlideElement, 'id'> = {
    kind: 'text', x: 195, y: 80, rotation: 0, scale: 1,
    text: NORTE_HEADLINES[i] || NORTE_SCREEN_TITLES[i] || '',
    fontSize: 29, fontWeight: 800, color: '#1a1a1a', align: 'center', width: 360,
  };
  return [...kept, headline];
}

type RawEl = Omit<SlideElement, 'id'>;
const near = (e: RawEl, x: number, y: number, tol = 5) =>
  Math.abs((e.x || 0) - x) <= tol && Math.abs((e.y || 0) - y) <= tol;
const anyNear = (e: RawEl, pts: number[][], tol = 6) => pts.some(([x, y]) => near(e, x, y, tol));

/**
 * Swap the two raw dark phone-shell shapes (outer bezel + inner screen) for a
 * single real iPhone-frame component (the addable `phone` / `phoneStyle:'frame'`).
 * The frame is inserted at the BACK of the array (renders behind everything) and
 * carries `cardTitle:''` so its built-in status chrome stays hidden — each Norte
 * screen already provides its own 9:41 / NORTE status bar. Geometry is copied
 * from the original bezel so all in-phone content stays pixel-aligned.
 */
function useNortePhoneFrame(els: RawEl[]): RawEl[] {
  const bezel = els.find((e) => e.kind === 'shape' && e.bg === '#37373a' && (e.w || 0) >= 200);
  if (!bezel) return els; // CTA screen has no phone
  const bx = bezel.x || 195;
  const screenTop = (bezel.y || 0) - (bezel.h || 0) / 2;
  let innerColor = '#EFEDE8';
  const out = els.filter((e) => {
    if (e === bezel) return false; // outer bezel
    if (e.kind === 'shape' && Math.abs((e.x || 0) - bx) <= 4 && (e.w || 0) >= 210 && (e.w || 0) <= 228 && (e.bg === '#19191b' || e.bg === '#efede8')) {
      innerColor = e.bg === '#19191b' ? '#19191B' : '#EFEDE8'; // inner screen → frame screen color
      return false;
    }
    // original dynamic-island / notch pill near the top, centered — the frame draws its own
    if (e.kind === 'shape' && Math.abs((e.x || 0) - bx) <= 30 && (e.w || 0) >= 40 && (e.w || 0) <= 110 && (e.h || 0) <= 26 && (e.y || 0) < screenTop + 55 && ['#040405', '#000000', '#1a1a1a', '#19191b'].includes(e.bg || '')) return false;
    return true;
  });
  const frame: RawEl = {
    kind: 'phone', phoneStyle: 'frame', x: bx, y: bezel.y || 0, w: bezel.w || 233, h: bezel.h || 531,
    radius: bezel.radius ?? 36, bg: '#2B2B2D', bg2: innerColor, island: true, cardTitle: '', rotation: 0, scale: 1,
  };
  return [frame, ...out]; // behind all content
}

/**
 * Swap the hand-built primitive clusters in each Norte screen for the polished,
 * reusable components (streak card, bar/line charts, framed heatmap, app logo,
 * button, lock badge, habit tiles). Runs after cleanNorteScreen.
 */
function upgradeNorteScreen(els: RawEl[], i: number): RawEl[] {
  let out = els.map((e) => ({ ...e }));
  const drop = (pred: (e: RawEl) => boolean) => { out = out.filter((e) => !pred(e)); };
  const add = (e: Partial<RawEl> & { kind: SlideElement['kind']; x: number; y: number }) =>
    out.push({ rotation: 0, scale: 1, ...e } as RawEl);

  if (i === 0) {
    // Floating habit tiles → real habit-tile components (white tile + check badge)
    const tiles = [[264, 287], [132, 287], [336, 237], [54, 237], [61, 348], [330, 350], [197, 214]];
    const dots = [[74, 210], [162, 263], [219, 189], [294, 265], [364, 218], [87, 327], [350, 324]];
    drop((e) => e.kind === 'shape' && e.bg === '#fcfbf8' && anyNear(e, tiles, 6));
    drop((e) => e.kind === 'shape' && e.bg === '#1a1a1a' && (e.w || 0) <= 22 && anyNear(e, dots, 8));
    out = out.map((e) => (e.kind === 'emoji' && anyNear(e, tiles, 8) ? { ...e, tile: true, check: true, size: 58 } : e));
    // In-phone app-icon placeholder (light square + notch circle) → the real Norte logo
    drop((e) => e.kind === 'shape' && near(e, 195, 475, 6) && (e.w || 0) <= 80);
    drop((e) => e.kind === 'shape' && near(e, 226, 445, 6) && (e.w || 0) <= 30);
    add({ kind: 'app', icon: 'norte', x: 195, y: 475, size: 75, radius: 17, check: false });
  } else if (i === 1) {
    // Compact habit list → Habit-row card components (check toggle + emoji + name + streak)
    drop((e) => e.kind === 'shape' && (e.w || 0) < 215 && (near(e, 195, 394, 7) || near(e, 195, 445, 7) || near(e, 195, 496, 7) || near(e, 118, 394, 7) || near(e, 118, 445, 7)));
    drop((e) => e.kind === 'text' && (near(e, 185, 388, 8) || near(e, 185, 402, 8) || near(e, 185, 439, 8) || near(e, 185, 453, 8) || near(e, 185, 490, 8) || near(e, 185, 505, 8)));
    const rowDef = (y: number, emoji: string, name: string, cap: string, on: boolean): Partial<RawEl> & { kind: SlideElement['kind']; x: number; y: number } =>
      ({ kind: 'habitrow', x: 195, y, w: 205, h: 44, radius: 12, bg: '#F6F4EF', color: '#1A1A1A', emoji, text: name, cardCaption: cap, check: on, cols: 0 });
    add(rowDef(396, '🏋️', 'exercitar 20min', '7D · 54%', true));
    add(rowDef(447, '📚', 'Leitura', '3D · 38%', true));
    add(rowDef(498, '💊', 'Vitamina D', '1D · 36%', false));
    // Bottom habit-grid card → framed Heatmap card component
    drop((e) => e.kind === 'shape' && near(e, 195, 613, 8));
    drop((e) => e.kind === 'heatmap' && near(e, 196, 618, 10));
    drop((e) => e.kind === 'text' && (near(e, 172, 720, 8) || near(e, 306, 720, 8) || near(e, 131, 510, 8) || near(e, 307, 510, 8) || near(e, 317, 513, 8)));
    add({ kind: 'heatmap', framed: true, x: 195, y: 620, w: 284, h: 250, cols: 11, rows: 7, fill: 0.5, cell: '#1A1A1A', bg: '#D8D5CE', radius: 16, color: '#F6F4EF', cardTitle: '🏋️ exercitar 20min', cardValue: '54', cardCaption: 'Cada quadrado = um dia · escuro = cumprido' });
  } else if (i === 2) {
    // Two-stat streak card → Streak component
    drop((e) => e.kind === 'shape' && (near(e, 195, 394, 8) || near(e, 282, 462, 8)));
    drop((e) => (e.kind === 'text' || e.kind === 'emoji') && (near(e, 153, 349) || near(e, 153, 390) || near(e, 150, 400) || near(e, 176, 396) || near(e, 240, 339) || near(e, 240, 369) || near(e, 267, 379) || near(e, 195, 444)));
    add({ kind: 'streak', x: 195, y: 394, w: 212, bg: '#1A1A1A', radius: 16, cardTitle: 'Sequência atual', cardValue: '9', cardTitle2: 'Recorde', cardValue2: '16', cardCaption: 'Cumprido hoje', text: 'Fazer check-in', unit: 'd', showFire: false, check: true, accent: '#E8923C' });
  } else if (i === 4) {
    // Privacy lock circle → Lock badge component
    drop((e) => e.kind === 'shape' && near(e, 195, 316, 8) && (e.w || 0) < 70);
    add({ kind: 'icon', icon: 'lock', tile: true, x: 195, y: 316, size: 57, radius: 28, bg: '#1A1A1A', color: '#FFFFFF', check: false });
  } else if (i === 5) {
    // Bar chart cluster → Bar chart component
    const barShapes = [[195, 386], [195, 262], [242, 262], [264, 373], [230, 395], [195, 405], [161, 405], [126, 407]];
    drop((e) => e.kind === 'shape' && anyNear(e, barShapes, 6));
    const barTexts = [[149, 262], [242, 262], [126, 447], [161, 447], [195, 447], [230, 447], [264, 447], [126, 461], [161, 461], [195, 461], [230, 461], [264, 461]];
    drop((e) => e.kind === 'text' && anyNear(e, barTexts, 5));
    add({ kind: 'barchart', x: 195, y: 360, w: 200, h: 235, radius: 14, bg: '#F6F4EF', cell: '#C9C5BD', accent: '#1A1A1A', toggleLeft: 'Dia da semana', toggleRight: 'Mês a mês', days: 'FEV,MAR,ABR,MAI,JUN', dates: '33,35,36,52,88', activeIndex: 4 });
    // Line chart cluster → Line chart component
    drop((e) => e.kind === 'shape' && (near(e, 195, 583, 10) || anyNear(e, [[105, 500], [243, 500], [179, 500]], 6)));
    const lineTexts = [[105, 500], [179, 500], [243, 500], [74, 537], [74, 591], [76, 641], [314, 534], [314, 588], [314, 605], [106, 651], [163, 651], [217, 651], [271, 651], [322, 651], [195, 671]];
    drop((e) => e.kind === 'text' && anyNear(e, lineTexts, 5));
    add({ kind: 'linechart', x: 195, y: 592, w: 300, h: 205, radius: 14, bg: '#FFFFFF', days: 'Fev,Mar,Abr,Mai,Jun', yTicks: '0,23,45', yMax: 50, cardCaption: 'Mais íngreme = mais consistente', series: [
      { label: 'exercitar 20min', color: '#6F7D5E', values: [0, 6, 16, 31, 45] },
      { label: 'Leitura', color: '#7C6FD6', values: [null, 0, 6, 15, 23] },
      { label: 'Vitamina D', color: '#C4AE7A', values: [null, null, 4, 12, 20] },
    ] });
  } else if (i === 6) {
    // App icon → Norte logo (with orange check); CTA pill → Button component
    drop((e) => e.kind === 'shape' && (near(e, 195, 365, 8) || near(e, 233, 328, 8) || near(e, 195, 541, 8)));
    drop((e) => e.kind === 'text' && near(e, 195, 541, 8));
    add({ kind: 'app', icon: 'norte', x: 195, y: 365, size: 90, radius: 21, check: true, badge: 'check', accent: '#E8923C' });
    add({ kind: 'button', x: 195, y: 541, text: 'Get Norte — Free', showArrow: true, bg: '#1A1A1A', color: '#F4F2ED', fontSize: 15, radius: 23, h: 46 });
  }
  return useNortePhoneFrame(out);
}

/**
 * v2 — the refined Norte template. Builds on the v1 component upgrade and pushes
 * closer to the source design: a 5-star rating on the hero, and the Gentle Nudges
 * screen rebuilt as the lock-screen composition (notification banner + Today list
 * widget + Done & Month widgets). All elements remain individually editable.
 */
function upgradeNorteScreenV2(els: RawEl[], i: number): RawEl[] {
  let out = upgradeNorteScreen(cleanNorteScreen(els, i), i);
  const add = (e: Partial<RawEl> & { kind: SlideElement['kind']; x: number; y: number }) =>
    out.push({ rotation: 0, scale: 1, ...e } as RawEl);

  if (i === 0) {
    // 5-star rating row under "+38,420 · hábitos cumpridos"
    add({ kind: 'stars', x: 195, y: 772, cols: 5, size: 9, color: '#1A1A1A' });
  } else if (i === 3) {
    // Gentle Nudges → notification + Today/Done/Month widgets
    out = out.filter((e) => {
      if (e.kind === 'phone') return true; // the iPhone frame component
      if (e.kind === 'text' && (e.y || 0) < 135) return true; // headline + subtitle
      if (e.kind === 'emoji' && (e.size || 0) >= 40) return true; // floating tiles
      if (e.kind === 'text' && (/^9:41$/.test(e.text || '') || /^NORTE$/.test(e.text || ''))) return true;
      return false; // drop raw in-phone content
    });
    out = out.map((e) => (e.kind === 'emoji' ? { ...e, tile: true, check: true, size: 54 } : e));
    add({ kind: 'notification', x: 195, y: 286, w: 198, radius: 16, bg: '#FBFAF8', color: '#1A1A1A', cardTitle: 'NORTE', cardValue: 'agora', text: 'Hora de meditar 🧘', cardCaption: 'Mantenha sua sequência de 9 dias.' });
    add({ kind: 'widget', variant: 'today', x: 195, y: 418, w: 198, radius: 14, bg: '#1A1A1A', color: '#F4F2ED', accent: '#E8923C', cardTitle: 'NORTE · HOJE', cardValue: '2 / 3 FEITOS', items: [
      { emoji: '🏋️', name: 'exercitar 20min', meta: '7d', done: true },
      { emoji: '📚', name: 'Leitura', meta: '3d', done: true },
      { emoji: '💧', name: 'Água', meta: '1d', done: false },
    ] });
    add({ kind: 'widget', variant: 'done', x: 147, y: 566, w: 94, h: 94, radius: 14, bg: '#1A1A1A', color: '#F4F2ED', accent: '#E8923C', cardTitle: 'NORTE', cardValue: '🔥 3d', text: 'Leitura', cardCaption: 'CUMPRIDO HOJE', cardValue2: '2/30', check: true });
    add({ kind: 'widget', variant: 'month', x: 245, y: 566, w: 94, h: 94, radius: 14, bg: '#1A1A1A', color: '#F4F2ED', accent: '#E8923C', cardTitle: 'NORTE', cardValue: '🔥 7d', text: 'exercitar', cardCaption: 'ESTE MÊS · 54%', cols: 6, rows: 4, fill: 0.5, cell: '#F4F2ED' });
  }
  return out;
}

/**
 * Centers of a rotated square lattice. `cells` are [col, row] offsets from the
 * grid center (−1 / 0 / 1 for a 3×3), `pitch` the cell-to-cell distance and
 * `rotation` the CSS rotation (degrees, clockwise-positive) applied to the wall —
 * pass the same value as each tile's own `rotation` so the tiles stay aligned.
 */
export function rotatedGrid(cx: number, cy: number, pitch: number, rotation: number, cells: [number, number][]): { x: number; y: number }[] {
  const t = (rotation * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  return cells.map(([c, r]) => ({
    x: Math.round(cx + pitch * (c * cos - r * sin)),
    y: Math.round(cy + pitch * (c * sin + r * cos)),
  }));
}

const NORTE_COVER_TILE = 134;
const NORTE_COVER_ROTATION = -10;
/** Row-major, center cell skipped (that one is the Norte logo) — the blocked-apps wall, mirroring the reference. */
const NORTE_COVER_APPS = ['youtube', 'instagram', 'tiktok', 'netflix', 'whatsapp', 'snapchat', 'threads', 'x'];

/**
 * The Refocus-style cover, rebuilt from Norte components — pill headline, bold
 * subline, laurel + stars, press logos and a tilted 3×3 wall of real app icons
 * (padlock badges) with the Norte logo in the middle.
 * Spec: docs/superpowers/specs/2026-09-06-norte-cover-screen-design.md
 */
export function norteCoverElements(): RawEl[] {
  const cells: [number, number][] = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const wall = 'norte-cover-wall';
  let appIdx = 0;
  const tiles: RawEl[] = rotatedGrid(195, 612, 148, NORTE_COVER_ROTATION, cells).map((p, i) => {
    const [c, r] = cells[i];
    if (c === 0 && r === 0) {
      return { kind: 'app', icon: 'norte', x: p.x, y: p.y, size: NORTE_COVER_TILE, radius: Math.round(NORTE_COVER_TILE * 0.22), check: true, badge: 'check', accent: '#E8923C', rotation: NORTE_COVER_ROTATION, scale: 1, groupId: wall };
    }
    return { kind: 'app', icon: NORTE_COVER_APPS[appIdx++], x: p.x, y: p.y, size: NORTE_COVER_TILE, radius: Math.round(NORTE_COVER_TILE * 0.22), check: true, badge: 'lock', accent: '#111111', rotation: NORTE_COVER_ROTATION, scale: 1, groupId: wall };
  });
  return [
    ...tiles,
    { kind: 'laurel', x: 195, y: 214, rotation: 0, scale: 1, size: 56, color: '#1A1A1A', cardValue: '15 MILLION', cardCaption: 'SUCCESS STORIES', fontSize: 15, cols: 5 },
    { kind: 'press', x: 195, y: 280, rotation: 0, scale: 1, text: 'TechCrunch, USA TODAY, Forbes', fontSize: 14, color: '#1A1A1A' },
    { kind: 'text', x: 195, y: 146, rotation: 0, scale: 1, text: 'Reduce <span style="font-weight:800;color:#1a1a1a">screen time</span> by <span style="font-weight:800;color:#1a1a1a">63%</span>!', fontSize: 14, fontWeight: 500, color: '#6f6c66', align: 'center', width: 340 },
    { kind: 'text', x: 195, y: 88, rotation: 0, scale: 1, text: '[Block] Apps\n& Websites', fontSize: 36, fontWeight: 800, color: '#1a1a1a', align: 'center', width: 370 },
  ];
}

/** Screen 1 of the Norte component kits (screens 2–3 follow below). */
const NORTE_COVER: StarterKitSlide = {
  role: 'hero',
  template: 'hero',
  title: 'Block Apps & Websites',
  noChrome: true,
  elements: norteCoverElements(),
};

const INK_ON_DARK = '#F4F2ED';
const MUTED_ON_DARK = '#A8A49C';
const DARK_SCREEN = '#19191B';
const DARK_SURFACE = '#242427';
const DARK_CHIP = '#2A2A2C';

/**
 * Screen 2 — the Opal-style "blocked app" moment in Norte's language: big dark
 * iPhone, glowing Instagram icon, "Blocked by Norte", laurel on the dark screen,
 * padlocked app tiles floating around the phone instead of Opal's shards.
 * Spec: docs/superpowers/specs/2026-09-20-norte-focus-screens-design.md
 */
export function norteBlockedElements(): RawEl[] {
  const tile = (icon: string, x: number, y: number, size: number, rotation: number): RawEl =>
    ({ kind: 'app', icon, x, y, size, check: true, badge: 'lock', accent: '#111111', rotation, scale: 1 });
  return [
    { kind: 'phone', phoneStyle: 'frame', x: 195, y: 460, w: 268, h: 560, radius: 50, bg: '#2B2B2D', bg2: DARK_SCREEN, island: true, text: '9:41', color: INK_ON_DARK, cardTitle: '', rotation: 0, scale: 1 },
    { kind: 'app', icon: 'instagram', x: 195, y: 378, size: 92, check: false, glow: 22, rotation: 0, scale: 1 },
    { kind: 'text', x: 195, y: 478, rotation: 0, scale: 1, text: 'Instagram is\nBlocked by Norte', fontSize: 22, fontWeight: 800, color: INK_ON_DARK, align: 'center', width: 240 },
    { kind: 'text', x: 195, y: 530, rotation: 0, scale: 1, text: 'You set this rule yesterday.\nPast you was right.', fontSize: 13, fontWeight: 500, color: MUTED_ON_DARK, align: 'center', width: 240 },
    { kind: 'laurel', x: 195, y: 686, rotation: 0, scale: 1, size: 50, color: INK_ON_DARK, cardValue: '10 MILLION', cardCaption: 'HOURS SAVED', fontSize: 14, cols: 5 },
    tile('snapchat', 46, 236, 62, -14),
    tile('tiktok', 350, 268, 70, 12),
    tile('youtube', 38, 522, 58, 9),
    tile('x', 354, 604, 54, -10),
    { kind: 'text', x: 195, y: 148, rotation: 0, scale: 1, text: 'One rule. Set once, kept every day.', fontSize: 14, fontWeight: 500, color: '#6f6c66', align: 'center', width: 340 },
    { kind: 'text', x: 195, y: 88, rotation: 0, scale: 1, text: '[Blocks] the apps\nyou keep opening.', fontSize: 36, fontWeight: 800, color: '#1a1a1a', align: 'center', width: 370 },
  ];
}

/**
 * Screen 3 — the Refocus-style "Track Screen Time" screen: dark iPhone bleeding
 * off the bottom, segmented period control, week navigation, summary card with
 * three stats, a light usage chart popping out of the phone and the "most
 * screen time" app row. Every piece is an editable component.
 */
export function norteScreenTimeElements(): RawEl[] {
  const T = (x: number, y: number, text: string, fontSize: number, fontWeight: number, color: string, width: number, align: 'left' | 'center' = 'left', groupId?: string): RawEl =>
    ({ kind: 'text', x, y, rotation: 0, scale: 1, text, fontSize, fontWeight, color, align, width, ...(groupId ? { groupId } : {}) });
  const chip = (icon: string, x: number, y: number, size: number): RawEl =>
    ({ kind: 'icon', icon, tile: true, x, y, size, radius: size / 2, bg: DARK_CHIP, color: INK_ON_DARK, check: false, rotation: 0, scale: 1 });
  const summary = 'norte-st-summary';
  return [
    { kind: 'phone', phoneStyle: 'frame', x: 195, y: 540, w: 290, h: 630, radius: 52, bg: '#2B2B2D', bg2: DARK_SCREEN, island: true, text: '9:41', color: INK_ON_DARK, cardTitle: '', rotation: 0, scale: 1 },
    // header: logo + name, two round buttons
    { kind: 'app', icon: 'norte', x: 84, y: 298, size: 24, radius: 6, check: false, rotation: 0, scale: 1 },
    T(131, 298, 'Norte', 15, 800, INK_ON_DARK, 60),
    chip('plus', 272, 298, 24),
    chip('bell', 306, 298, 24),
    // period picker + week navigation
    { kind: 'segmented', x: 195, y: 336, w: 246, h: 32, radius: 16, days: 'Month,Week,Day', activeIndex: 1, bg: DARK_CHIP, accent: INK_ON_DARK, color: INK_ON_DARK, fontSize: 11, rotation: 0, scale: 1 },
    chip('chevron-left', 84, 372, 22),
    T(195, 372, 'This Week', 13, 700, INK_ON_DARK, 150, 'center'),
    chip('chevron-right', 306, 372, 22),
    // summary card (grouped so it moves as one)
    T(195, 404, 'SUMMARY', 9, 700, MUTED_ON_DARK, 246),
    { kind: 'shape', shapeType: 'rect', x: 195, y: 456, w: 246, h: 118, radius: 16, bg: DARK_SURFACE, opacity: 1, rotation: 0, scale: 1, groupId: summary },
    T(195, 414, 'May 25, 2025 – May 31, 2025', 10, 500, MUTED_ON_DARK, 214, 'left', summary),
    T(195, 438, '1h 9m', 26, 800, INK_ON_DARK, 214, 'left', summary),
    T(195, 458, 'DAILY AVERAGE', 8, 700, MUTED_ON_DARK, 214, 'left', summary),
    { kind: 'statrow', x: 195, y: 490, w: 214, dates: '2h 17m,54,51', days: 'SCREEN TIME,PICKUPS,NOTIFICATIONS', fontSize: 14, color: INK_ON_DARK, accent: MUTED_ON_DARK, align: 'left', rotation: 0, scale: 1, groupId: summary },
    // the chart pops out of the phone (wider than the screen, floating shadow)
    { kind: 'usagechart', x: 195, y: 620, w: 320, h: 200, radius: 20, bg: '#F6F4EF', cell: '#1A1A1A', accent: '#E8923C', color: '#1A1A1A', days: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat', dates: '1.4,1.5,1.1,0.9,0.8,1.4,1.6', unit: 'h', yTicks: '0m,1h,2h', yMax: 2, activeIndex: 6, shadow: 26, rotation: 0, scale: 1 },
    // most screen time
    T(195, 746, 'MOST SCREEN TIME', 9, 700, MUTED_ON_DARK, 246),
    { kind: 'approw', x: 195, y: 784, w: 246, h: 56, radius: 12, bg: DARK_SURFACE, color: INK_ON_DARK, accent: '#E8923C', icon: 'youtube', text: 'YouTube', cardValue: '33m 59s', cardCaption: '1 pickups · 0 notifications', fill: 0.86, rotation: 0, scale: 1 },
    // headline block
    T(195, 148, 'Screen time, pickups and notifications at a glance.', 14, 500, '#6f6c66', 340, 'center'),
    T(195, 88, '[Track]\nScreen Time', 36, 800, '#1a1a1a', 370, 'center'),
  ];
}

/** Screens 2 and 3 of the Norte component kits. */
const NORTE_BLOCKED: StarterKitSlide = {
  role: 'use-case',
  template: 'hero',
  title: 'Blocks the apps you keep opening',
  noChrome: true,
  elements: norteBlockedElements(),
};
const NORTE_SCREEN_TIME: StarterKitSlide = {
  role: 'differentiator',
  template: 'hero',
  title: 'Track Screen Time',
  noChrome: true,
  elements: norteScreenTimeElements(),
};

const NORTE_REVIEWS_ROTATION = -6;
/** [dx, dy, quote, author] — offsets from the wall centre before rotation; staggered rows, side cards bleed off the edges. */
const NORTE_REVIEWS: [number, number, string, string][] = [
  [-235, -132, 'Not doomscrolling anymore. I love this app.', 'Marcus'],
  [0, -132, "I got my life back. The block kicks in every time I scroll, and I don't wanna fight it!!", 'Chammmee'],
  [235, -132, 'My focus is back. Best purchase this year.', 'Mia K.'],
  [-60, 0, 'The block screen actually works. My screen time is down 60%.', 'Priya R.'],
  [200, 0, 'Honestly shocked how well the blocking works.', 'Jenna'],
  [-200, 132, 'Not quitting anymore. Obsessed with this app.', 'Alexander'],
  [60, 132, "Finally an app that doesn't let me cheat myself. Saved my evenings.", 'Devon A.'],
];

/**
 * Social-proof screen — a tilted, staggered wall of App Store review cards
 * (stars, quote, author) under a "Join 650K users" headline, with two laurels
 * at the bottom. Every card is a `review` component; the wall is one group.
 */
export function norteReviewsElements(): RawEl[] {
  const wall = 'norte-reviews-wall';
  const centres = rotatedGrid(195, 460, 1, NORTE_REVIEWS_ROTATION, NORTE_REVIEWS.map(([dx, dy]) => [dx, dy] as [number, number]));
  const cards: RawEl[] = NORTE_REVIEWS.map(([, , text, author], i) => ({
    kind: 'review', x: centres[i].x, y: centres[i].y, w: 240, h: 112, radius: 18, bg: '#FFFFFF', color: '#1A1A1A', accent: '#E8923C',
    cols: 5, fontSize: 13, text, cardTitle: author, rotation: NORTE_REVIEWS_ROTATION, scale: 1, groupId: wall,
  }));
  return [
    ...cards,
    { kind: 'laurel', x: 108, y: 738, rotation: 0, scale: 1, size: 50, color: '#1A1A1A', cardValue: '10K+', cardCaption: '5-star reviews', fontSize: 22, cols: 0 },
    { kind: 'laurel', x: 282, y: 738, rotation: 0, scale: 1, size: 50, color: '#1A1A1A', cardValue: '#1', cardCaption: 'Screen time app', fontSize: 22, cols: 0 },
    { kind: 'app', icon: 'norte', x: 195, y: 54, size: 48, radius: 11, check: false, rotation: 0, scale: 1 },
    { kind: 'text', x: 195, y: 184, rotation: 0, scale: 1, text: 'Real reviews from the App Store.', fontSize: 14, fontWeight: 500, color: '#6f6c66', align: 'center', width: 340 },
    { kind: 'text', x: 195, y: 124, rotation: 0, scale: 1, text: 'Join [650K] users\nsaving their focus', fontSize: 36, fontWeight: 800, color: '#1a1a1a', align: 'center', width: 370 },
  ];
}

/** Social-proof screen, placed right before the CTA in the Norte component kits. */
const NORTE_REVIEWS_SLIDE: StarterKitSlide = {
  role: 'proof',
  template: 'hero',
  title: 'Join 650K users',
  noChrome: true,
  elements: norteReviewsElements(),
};
/** Insert the reviews screen before the last (CTA) screen of a kit. */
const withReviewsBeforeCta = (slides: StarterKitSlide[]): StarterKitSlide[] => [...slides.slice(0, -1), NORTE_REVIEWS_SLIDE, slides[slides.length - 1]];

// ── Feature story — five screens built from the real Norte app (distractions, typical
// day, focus hours, rules, today). Every piece is an editable, localizable component.
const MONO_FONT = 'JetBrains Mono';
/** Tracked mono kicker ("TYPICAL DAY"). */
const K = (x: number, y: number, text: string, color: string, width = 340, align: 'left' | 'center' | 'right' = 'center', fontSize = 10, groupId?: string): RawEl =>
  ({ kind: 'text', x, y, rotation: 0, scale: 1, text, fontFamily: MONO_FONT, fontSize, fontWeight: 600, letterSpacing: 0.18, color, align, width, ...(groupId ? { groupId } : {}) });
/** Plain text block. */
const TX = (x: number, y: number, text: string, fontSize: number, fontWeight: number, color: string, width: number, align: 'left' | 'center' | 'right' = 'center', groupId?: string): RawEl =>
  ({ kind: 'text', x, y, rotation: 0, scale: 1, text, fontSize, fontWeight, color, align, width, ...(groupId ? { groupId } : {}) });
/** Kicker + pill headline + subline at the top of a story screen. */
const HEAD = (kicker: string, headline: string, subline: string): RawEl[] => [
  K(195, 38, kicker, '#6f6c66'),
  TX(195, 152, subline, 14, 500, '#6f6c66', 340),
  TX(195, 92, headline, 36, 800, '#1a1a1a', 370),
];
const PHONE = (y: number, w: number, h: number, dark: boolean): RawEl =>
  ({ kind: 'phone', phoneStyle: 'frame', x: 195, y, w, h, radius: 50, bg: '#2B2B2D', bg2: dark ? DARK_SCREEN : '#EFEDE8', island: true, text: '9:41', color: dark ? INK_ON_DARK : '#1A1A1A', cardTitle: '', rotation: 0, scale: 1 });
const PLUS = (bg: string, color: string): RawEl =>
  ({ kind: 'icon', icon: 'plus', tile: true, x: 302, y: 296, size: 30, radius: 15, bg, color, check: false, rotation: 0, scale: 1 });

/** "Everyone has their distractions. These are yours." — the biggest app, then the next in line. */
export function norteDistractionsElements(): RawEl[] {
  return [
    PHONE(500, 270, 580, true),
    K(195, 288, 'DISTRACTIONS', MUTED_ON_DARK, 240, 'center', 9),
    TX(195, 328, 'Everyone has their\ndistractions. These are yours.', 15, 800, INK_ON_DARK, 240),
    { kind: 'shape', shapeType: 'rect', x: 195, y: 418, w: 104, h: 104, radius: 26, bg: DARK_CHIP, opacity: 1, rotation: 0, scale: 1 },
    { kind: 'app', icon: 'whatsapp', x: 195, y: 418, size: 66, radius: 15, check: false, rotation: 0, scale: 1 },
    TX(195, 492, 'WhatsApp', 17, 800, INK_ON_DARK, 240),
    TX(195, 515, '10h 14m this week', 11, 600, '#E8923C', 240),
    K(195, 556, 'NEXT IN LINE', MUTED_ON_DARK, 240, 'center', 8.5),
    { kind: 'appstrip', x: 195, y: 604, apps: 'instagram,youtube,tiktok,norte,netflix', dates: '6h,5h,1h,1h,1h', size: 38, radius: 11, bg: DARK_CHIP, color: MUTED_ON_DARK, rotation: 0, scale: 1 },
    TX(195, 718, 'Add these to a rule and Norte\nwill hold them for you.', 10.5, 500, MUTED_ON_DARK, 230),
    { kind: 'app', icon: 'x', x: 40, y: 296, size: 54, check: true, badge: 'lock', accent: '#111111', rotation: -12, scale: 1 },
    { kind: 'app', icon: 'snapchat', x: 352, y: 650, size: 56, check: true, badge: 'lock', accent: '#111111', rotation: 10, scale: 1 },
    ...HEAD('DISTRACTIONS', '[Find] your\ndistractions', 'Norte shows where your week really went.'),
  ];
}

/** "This is when you reach for it most" — the typical-day hourly chart on a dark panel. */
export function nortePatternsElements(): RawEl[] {
  const panel = 'norte-patterns-panel';
  return [
    { kind: 'shape', shapeType: 'rect', x: 195, y: 500, w: 340, h: 560, radius: 32, bg: '#151516', opacity: 1, rotation: 0, scale: 1, groupId: panel },
    K(195, 262, 'TYPICAL DAY', MUTED_ON_DARK, 300, 'center', 9, panel),
    TX(195, 306, 'This is when you\nreach for it most', 19, 800, INK_ON_DARK, 290, 'center', panel),
    TX(195, 374, '22 – 23', 46, 800, '#E8923C', 300, 'center', panel),
    { kind: 'usagechart', x: 195, y: 565, w: 300, h: 250, radius: 0, bg: '#151516', cell: '#3A3A3C', accent: '#E8923C', color: INK_ON_DARK, days: '00,12,00', dates: '4.5,1.5,0.2,1,0.2,0.2,0.2,1.6,1.6,6,9.2,4.2,4.2,5.6,2.8,4.2,4.8,6.2,8.6,7,5.8,9.8,10,6.2', unit: '', yMax: 10, activeIndex: 22, rotation: 0, scale: 1, groupId: panel },
    TX(195, 736, 'That hour deserves a rule.', 12, 500, MUTED_ON_DARK, 300, 'center', panel),
    ...HEAD('TYPICAL DAY', '[Know] your\npatterns', 'Norte finds the hour you reach for your phone most.'),
  ];
}

/** "Your focus — 65h" — total protected time, this-week stats and the weekly bars. */
export function norteProtectElements(): RawEl[] {
  const card = 'norte-protect-card';
  return [
    PHONE(520, 270, 600, false),
    TX(195, 296, 'Focus', 15, 800, '#1A1A1A', 200),
    PLUS('#E8923C', '#1A1A1A'),
    { kind: 'shape', shapeType: 'rect', x: 195, y: 490, w: 240, h: 300, radius: 18, bg: '#1A1A1A', opacity: 1, rotation: 0, scale: 1, groupId: card },
    K(195, 365, 'YOUR FOCUS', MUTED_ON_DARK, 208, 'left', 8.5, card),
    TX(195, 406, '65h', 40, 800, INK_ON_DARK, 208, 'left', card),
    TX(195, 436, 'Total time your blocks were on', 10, 500, MUTED_ON_DARK, 208, 'left', card),
    { kind: 'statrow', x: 195, y: 482, w: 208, dates: '40h,🔥 7 days', days: 'BOOKED THIS WEEK,DAY STREAK', fontSize: 15, color: INK_ON_DARK, accent: MUTED_ON_DARK, align: 'left', rotation: 0, scale: 1, groupId: card },
    { kind: 'usagechart', x: 195, y: 572, w: 208, h: 112, radius: 0, bg: '#1A1A1A', cell: '#3A3A3C', accent: '#E8923C', color: INK_ON_DARK, days: 'M,T,W,T,F,S,S', dates: '2,11,11,8,12,1,19', unit: 'h', yMax: 19, activeIndex: 6, rotation: 0, scale: 1, groupId: card },
    { kind: 'button', x: 195, y: 690, text: 'Unblock apps', showArrow: true, bg: '#6B6B6B', color: '#FFFFFF', fontSize: 11, radius: 18, h: 36, rotation: 0, scale: 1 },
    ...HEAD('YOUR FOCUS', '[Protect] your\nfocus', 'See how many hours your blocks kept for you.'),
  ];
}

/** "Rules" — blocked-now apps, two rule cards and the weekly-report card. */
export function norteRulesElements(): RawEl[] {
  const report = 'norte-rules-report';
  const ORANGE_INK = '#C96A1F';
  return [
    PHONE(520, 270, 600, false),
    TX(195, 296, 'Focus', 15, 800, '#1A1A1A', 200),
    PLUS('#E8923C', '#1A1A1A'),
    K(195, 328, 'BLOCKED NOW', '#A8A49C', 208, 'left', 8.5),
    { kind: 'app', icon: 'instagram', x: 118, y: 372, size: 54, radius: 13, check: true, badge: 'lock', accent: '#E8923C', rotation: 0, scale: 1 },
    { kind: 'app', icon: 'tiktok', x: 184, y: 372, size: 54, radius: 13, check: true, badge: 'lock', accent: '#E8923C', rotation: 0, scale: 1 },
    TX(118, 412, 'Unblock', 10, 700, ORANGE_INK, 60),
    TX(184, 412, 'Unblock', 10, 700, ORANGE_INK, 60),
    TX(195, 452, 'Rules', 18, 800, '#1A1A1A', 208, 'left'),
    TX(195, 453, '+ New rule', 11, 700, ORANGE_INK, 208, 'right'),
    { kind: 'rulecard', x: 137, y: 546, w: 112, h: 150, radius: 14, bg: '#F7F5F0', color: '#1A1A1A', accent: '#E8923C', icon: 'hourglass', check: true, cardTitle: 'Blocked now', text: 'Time Keeper', cardCaption: 'Block', apps: 'instagram,tiktok', rotation: 0, scale: 1 },
    { kind: 'rulecard', x: 259, y: 546, w: 112, h: 150, radius: 14, bg: '#F7F5F0', color: '#1A1A1A', accent: '#E8923C', icon: 'calendar', check: false, cardTitle: 'Starts in 12h', text: 'Work Time', cardCaption: 'Block', apps: 'netflix', rotation: 0, scale: 1 },
    { kind: 'shape', shapeType: 'rect', x: 195, y: 712, w: 208, h: 150, radius: 16, bg: '#1A1A1A', opacity: 1, rotation: 0, scale: 1, groupId: report },
    K(195, 660, 'WEEKLY REPORT', MUTED_ON_DARK, 176, 'left', 8, report),
    TX(195, 690, 'Your week in focus\nis ready', 13, 800, INK_ON_DARK, 176, 'left', report),
    TX(195, 722, '65h protected. See where your time went.', 9, 500, MUTED_ON_DARK, 176, 'left', report),
    { kind: 'button', x: 146, y: 758, text: 'Open report', showArrow: false, bg: '#F4F2ED', color: '#1A1A1A', fontSize: 9.5, radius: 13, h: 26, rotation: 0, scale: 1, groupId: report },
    TX(226, 758, 'Not now', 9.5, 600, MUTED_ON_DARK, 50, 'center', report),
    { kind: 'usagechart', x: 268, y: 690, w: 56, h: 46, radius: 0, bg: '#1A1A1A', cell: '#4A4A4C', accent: '#E8923C', color: INK_ON_DARK, days: '', dates: '1,3,4,4,3,1,6', unit: '', yMax: 6, activeIndex: 6, rotation: 0, scale: 1, groupId: report },
    ...HEAD('RULES', '[Rules] that\nhold the line', "Set it once. Norte keeps it, even when you don't want to."),
  ];
}

/** "Today — 4 / 10 kept" — date strip and habit rows with their history grids. */
export function norteTodayElements(): RawEl[] {
  const row = (y: number, emoji: string, name: string, meta: string, done: boolean): RawEl =>
    ({ kind: 'habitrow', x: 195, y, w: 208, h: 54, radius: 14, bg: '#F7F5F0', color: '#1A1A1A', cell: '#1A1A1A', emoji, text: name, cardCaption: meta, check: done, cols: 7, rows: 5, fill: 0.3, rotation: 0, scale: 1 });
  return [
    PHONE(520, 270, 600, false),
    PLUS('#1A1A1A', '#F4F2ED'),
    TX(195, 322, 'Today', 24, 800, '#1A1A1A', 208, 'left'),
    TX(195, 356, '<span style="color:#1a1a1a">4</span> / 10 kept', 22, 800, '#9b9890', 208, 'left'),
    { kind: 'datestrip', x: 195, y: 410, w: 208, days: 'M,T,W,T,F,S,S', dates: '14,15,16,17,18,19,20', activeIndex: 6, rotation: 0, scale: 1 },
    K(195, 458, 'HABITS', '#A8A49C', 208, 'left', 8),
    row(498, '📚', 'Bible', '1D · 7%', true),
    row(560, '💊', 'Vitamin D', '7D · 13%', true),
    row(622, '🌿', 'Nature', '4D · 9%', false),
    row(684, '🥛', 'Creatine', '5D · 11%', true),
    { kind: 'emoji', emoji: '📚', tile: true, check: true, size: 54, x: 42, y: 300, rotation: -10, scale: 1 },
    { kind: 'emoji', emoji: '🥛', tile: true, check: true, size: 50, x: 352, y: 640, rotation: 8, scale: 1 },
    ...HEAD('TODAY', '[Habits] and focus,\ntogether', 'Check in daily, keep streaks, protect your time.'),
  ];
}

const story = (role: RecipeRole, title: string, elements: RawEl[]): StarterKitSlide => ({ role, template: 'hero', title, noChrome: true, elements });
const NORTE_DISTRACTIONS = story('use-case', 'Find your distractions', norteDistractionsElements());
const NORTE_PATTERNS = story('differentiator', 'Know your patterns', nortePatternsElements());
const NORTE_PROTECT = story('secondary', 'Protect your focus', norteProtectElements());
const NORTE_RULES = story('secondary', 'Rules that hold the line', norteRulesElements());
const NORTE_TODAY = story('secondary', 'Habits and focus, together', norteTodayElements());

/** The 10-screen focus story: cover → blocked → distractions → patterns → screen time → focus → rules → habits → reviews → CTA.
 *  A function because the CTA comes from NORTE_V2_SLIDES, which is declared further down. */
const norteFocusStory = (): StarterKitSlide[] => [
  NORTE_COVER, NORTE_BLOCKED, NORTE_DISTRACTIONS, NORTE_PATTERNS, NORTE_SCREEN_TIME,
  NORTE_PROTECT, NORTE_RULES, NORTE_TODAY, NORTE_REVIEWS_SLIDE, NORTE_V2_SLIDES[NORTE_V2_SLIDES.length - 1],
];

/** Each Norte screen, extracted faithfully from the source HTML then upgraded to use the reusable components. */
const NORTE_COMPONENTS_SLIDES: StarterKitSlide[] = NORTE_SCREENS.map((elements, i) => ({
  role: NORTE_ROLES[i] || 'secondary',
  template: 'hero' as const,
  title: NORTE_SCREEN_TITLES[i] || '',
  noChrome: true,
  elements: upgradeNorteScreen(cleanNorteScreen(elements, i), i),
}));

const NORTE_V2_SLIDES: StarterKitSlide[] = NORTE_SCREENS.map((elements, i) => ({
  role: NORTE_ROLES[i] || 'secondary',
  template: 'hero' as const,
  title: NORTE_SCREEN_TITLES[i] || '',
  noChrome: true,
  elements: upgradeNorteScreenV2(elements, i),
}));

export const STARTER_KITS: StarterKit[] = [
  {
    id: 'norte-focus',
    name: 'Norte · Focus story',
    tagline: 'Blocking, patterns, focus hours, rules, habits — 10 screens',
    swatch: '#E8923C',
    background: { type: 'solid', solidColor: '#EDEBE5' },
    title: { fontFamily: 'Archivo', fontSize: 38, fontWeight: 800, color: '#111111', subtitleColor: '#6B6B6B', subtitleFontSize: 17, alignment: 'center' },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 84 },
    slides: norteFocusStory(),
  },
  {
    id: 'norte-components-v2',
    name: 'Norte · Components v2',
    tagline: 'Refined — notification + widgets, full component set',
    swatch: '#1A1A1A',
    background: { type: 'solid', solidColor: '#EDEBE5' },
    title: { fontFamily: 'Archivo', fontSize: 38, fontWeight: 800, color: '#111111', subtitleColor: '#6B6B6B', subtitleFontSize: 17, alignment: 'center' },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 84 },
    slides: [NORTE_COVER, NORTE_BLOCKED, NORTE_SCREEN_TIME, ...withReviewsBeforeCta(NORTE_V2_SLIDES)],
  },
  {
    id: 'norte-components',
    name: 'Norte · Components',
    tagline: 'Every screen broken into editable components',
    swatch: '#111111',
    background: { type: 'solid', solidColor: '#EDEBE5' },
    title: { fontFamily: 'Archivo', fontSize: 38, fontWeight: 800, color: '#111111', subtitleColor: '#6B6B6B', subtitleFontSize: 17, alignment: 'center' },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 84 },
    slides: [NORTE_COVER, NORTE_BLOCKED, NORTE_SCREEN_TIME, ...withReviewsBeforeCta(NORTE_COMPONENTS_SLIDES)],
  },
  {
    id: 'norte-designs',
    name: 'Norte · Designs',
    tagline: 'Your 6 finished App Store screens',
    swatch: '#111111',
    background: { type: 'solid', solidColor: '#EDEBE5' },
    title: {
      fontFamily: 'Archivo',
      fontSize: 40,
      fontWeight: 800,
      color: '#111111',
      subtitleColor: '#6B6B6B',
      subtitleFontSize: 18,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 86 },
    slides: [
      { role: 'hero', template: 'hero', title: 'One Tap. One Square.', fullImage: '/norte/1-today.png' },
      { role: 'use-case', template: 'hero', title: 'Build Daily Streaks', fullImage: '/norte/2-streaks.png' },
      { role: 'differentiator', template: 'hero', title: 'Gentle Nudges, Real Habits', fullImage: '/norte/3-science.png' },
      { role: 'secondary', template: 'hero', title: 'Private by Design', fullImage: '/norte/4-privacy.png' },
      { role: 'secondary', template: 'hero', title: 'See Your Whole Year', fullImage: '/norte/5-year.png' },
      { role: 'cta', template: 'hero', title: 'Start Today', fullImage: '/norte/6-start.png' },
    ],
  },
  {
    id: 'norte-store',
    name: 'Norte · App Store',
    tagline: 'Off-white · bold black · habit tracker',
    swatch: '#111111',
    background: { type: 'solid', solidColor: '#EDEBE5' },
    title: {
      fontFamily: 'Archivo',
      fontSize: 40,
      fontWeight: 800,
      color: '#111111',
      subtitleColor: '#6B6B6B',
      subtitleFontSize: 18,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 86 },
    slides: [
      { role: 'hero', template: 'pill', title: 'One Tap.\n[One Square.]', subtitle: "Today's habits — each check fills your grid.", showSubtitle: true },
      {
        role: 'use-case',
        template: 'pill',
        title: 'Build Daily [Streaks]\nThat Stick',
        subtitle: 'One tap to check in — tiny days count.',
        showSubtitle: true,
        elements: [NORTE_EMOJI(56, 205, '🧘', -6), NORTE_EMOJI(334, 205, '📚', 6)],
      },
      {
        role: 'differentiator',
        template: 'pill',
        title: 'Gentle Nudges,\n[Real Habits]',
        subtitle: 'Goals, reminders, and habits in view — backed by science.',
        showSubtitle: true,
        elements: [NORTE_EMOJI(60, 235, '☀️', -8)],
      },
      {
        role: 'secondary',
        template: 'pill',
        title: '[Private] by Design\nNo Account',
        subtitle: '100% on your phone. No cloud, no sign-up, no tracking — ever.',
        showSubtitle: true,
        elements: [NORTE_EMOJI(60, 235, '🏃', -8)],
      },
      {
        role: 'secondary',
        template: 'pill',
        title: 'See Your Whole [Year]\nat a Glance',
        subtitle: 'Patterns, streaks, and progress across every habit.',
        showSubtitle: true,
        elements: [NORTE_EMOJI(334, 235, '🏋️', 8)],
      },
      { role: 'cta', template: 'habit-hero', title: 'Start [Today]\nBuild Better Habits', subtitle: 'Free to start. One habit. Your whole year.', showSubtitle: true },
    ],
  },
  {
    id: 'stoic',
    name: 'Stoic',
    tagline: 'Off-white · bold black · awards',
    swatch: '#0E0E0E',
    background: { type: 'solid', solidColor: '#F4F1EA' },
    title: {
      fontFamily: 'Sora',
      fontSize: 42,
      fontWeight: 800,
      color: '#111111',
      subtitleColor: '#4A4845',
      subtitleFontSize: 17,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 86 },
    slides: [
      { role: 'hero', template: 'awards', title: 'Your Journal\nfor Better\nMental Health.', subtitle: "App of the Day|Editors' Choice", showSubtitle: true },
      { role: 'use-case', template: 'feature', title: 'Journal & Reflect', subtitle: 'Private & secure tools for better mood.', showSubtitle: true, titleOverride: { alignment: 'left' } },
      { role: 'differentiator', template: 'centered', title: 'Track Mood\n& Habits' },
      { role: 'secondary', template: 'feature', title: 'Calm Your Mind', subtitle: 'Reduce stress & anxiety.', showSubtitle: true, titleOverride: { alignment: 'left' } },
      { role: 'proof', template: 'review', title: 'Life changing app.\nGet it to become\na better you.', subtitle: 'Daphne · on the App Store', showSubtitle: true },
    ],
  },
  {
    id: 'refocus',
    name: 'Refocus',
    tagline: 'Light gray · black pill headlines',
    swatch: '#1A1A1A',
    background: { type: 'solid', solidColor: '#ECECEC' },
    title: {
      fontFamily: 'Archivo',
      fontSize: 40,
      fontWeight: 800,
      color: '#111111',
      subtitleColor: '#3A3A3A',
      subtitleFontSize: 18,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-dark', scale: 84 },
    slides: [
      { role: 'hero', template: 'pill', title: '[Block] Apps\n& Websites', subtitle: 'Limit Screen Time', showSubtitle: true },
      { role: 'use-case', template: 'pill', title: 'Customize\n[Strictness]', subtitle: 'Control Your Focus', showSubtitle: true },
      {
        role: 'differentiator',
        template: 'feature-cards',
        title: 'Powerful controls',
        featureMore: true,
        featureCards: [
          { title: 'Block Any App', body: 'Select Apps & Websites to Block ›\nInstagram · YouTube · TikTok | 3 apps' },
          { title: 'Schedule Any Time', body: 'Start at | 9:00 AM\nEnd at | 5:00 PM\nRepeat | Mon – Fri' },
          { title: 'Set App Limits', body: '10 minutes\n*15 minutes\n20 minutes' },
        ],
      },
      { role: 'secondary', template: 'pill', title: '[Track]\nScreen Time', subtitle: 'See where your time really goes.', showSubtitle: true },
      { role: 'proof', template: 'review', title: 'BEST APP.\nPERIOD.', subtitle: 'Amazing blocking app with seamless performance.', showSubtitle: true },
    ],
  },
  {
    id: 'norte',
    name: 'Norte',
    tagline: 'Indigo gradient · Sora bold',
    swatch: '#5B5FED',
    background: {
      type: 'linear-gradient',
      gradientStops: [
        { color: '#5B5FED', position: 0 },
        { color: '#818CF8', position: 100 },
      ],
      gradientAngle: 135,
      presetId: 'norte-indigo',
    },
    title: {
      fontFamily: 'Sora',
      fontSize: 40,
      fontWeight: 700,
      color: '#FFFFFF',
      subtitleColor: '#FFFFFFCC',
      subtitleFontSize: 18,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-dark', scale: 90 },
    slides: [
      { role: 'hero', template: 'hero', title: 'Build something\nbeautiful.', subtitle: 'A short tagline that explains what your app does.', showSubtitle: true },
      { role: 'use-case', template: 'feature', title: 'One tap.\nEverything synced.', subtitle: 'Designed for focus.', showSubtitle: true },
      { role: 'differentiator', template: 'centered', title: 'Made for\nevery day.' },
      { role: 'secondary', template: 'feature', title: 'Smart shortcuts\nthat learn.', subtitle: 'Less clutter, more clarity.', showSubtitle: true },
      { role: 'proof', template: 'social-proof', title: 'Loved by\nthousands.', subtitle: '4.9 average rating.', showSubtitle: true },
    ],
  },
  {
    id: 'vanta-mono',
    name: 'Vanta Mono',
    tagline: 'Pure black · italic serif',
    swatch: '#0A0A0A',
    background: { type: 'solid', solidColor: '#0A0A0A' },
    title: {
      fontFamily: 'Bricolage Grotesque',
      fontSize: 36,
      fontWeight: 500,
      color: '#FFFFFF',
      subtitleColor: '#A8A8A8',
      subtitleFontSize: 16,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-dark', scale: 88 },
    slides: [
      { role: 'hero', template: 'hero', title: 'Join thousands\nusing the app' },
      { role: 'use-case', template: 'centered', title: 'Simple\nautomatic flow' },
      { role: 'differentiator', template: 'centered', title: 'Use AI tools\nfor every task' },
      { role: 'secondary', template: 'centered', title: 'Create your\nApp Store screenshots' },
      { role: 'secondary', template: 'centered', title: 'Release\nfaster than ever' },
      { role: 'proof', template: 'social-proof', title: 'Trusted by\n10,000+ teams' },
    ],
  },
  {
    id: 'mono-light',
    name: 'Mono Light',
    tagline: 'Cream · bold black headlines',
    swatch: '#F5F0E8',
    background: { type: 'solid', solidColor: '#F5F0E8' },
    title: {
      fontFamily: 'Sora',
      fontSize: 44,
      fontWeight: 800,
      color: '#1A1917',
      subtitleColor: '#4A4845',
      subtitleFontSize: 18,
      alignment: 'left',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 88 },
    slides: [
      { role: 'hero', template: 'feature', title: 'Built for\ncomplex routines.', subtitle: 'One tap to log everything.', showSubtitle: true },
      { role: 'use-case', template: 'feature', title: 'Track your day,\nyour way.', subtitle: 'Morning, walk, night.', showSubtitle: true },
      { role: 'differentiator', template: 'centered', title: 'Made simple\nfor real life.' },
      { role: 'secondary', template: 'feature', title: 'Symptoms,\nsleep, mood.', subtitle: 'All in one timeline.', showSubtitle: true },
      { role: 'proof', template: 'social-proof', title: 'Trusted by\n100K+ users.' },
    ],
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    tagline: 'Warm orange → pink',
    swatch: '#F59E0B',
    background: {
      type: 'linear-gradient',
      gradientStops: [
        { color: '#F43F5E', position: 0 },
        { color: '#F59E0B', position: 100 },
      ],
      gradientAngle: 135,
    },
    title: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 40,
      fontWeight: 800,
      color: '#FFFFFF',
      subtitleColor: '#FFFFFFD9',
      subtitleFontSize: 18,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-dark', scale: 92 },
    slides: [
      { role: 'hero', template: 'hero', title: 'Catch every\nmoment.', subtitle: 'Bright, fast, and unmistakably you.', showSubtitle: true },
      { role: 'use-case', template: 'split', title: 'Stay\nahead.', subtitle: 'Today, tomorrow, and beyond.', showSubtitle: true },
      { role: 'differentiator', template: 'centered', title: 'Designed to\ndelight.' },
      { role: 'secondary', template: 'feature', title: 'Crafted with\nlove.', subtitle: 'Every pixel intentional.', showSubtitle: true },
      { role: 'proof', template: 'social-proof', title: 'Featured by\nthe Editors.', subtitle: 'Top rated worldwide.', showSubtitle: true },
    ],
  },
  {
    id: 'ocean-pro',
    name: 'Ocean Pro',
    tagline: 'Deep blue · vivid accents',
    swatch: '#0EA5E9',
    background: {
      type: 'linear-gradient',
      gradientStops: [
        { color: '#0C4A6E', position: 0 },
        { color: '#0EA5E9', position: 100 },
      ],
      gradientAngle: 160,
    },
    title: {
      fontFamily: 'Montserrat',
      fontSize: 42,
      fontWeight: 800,
      color: '#FFFFFF',
      subtitleColor: '#FDE68A',
      subtitleFontSize: 18,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-dark', scale: 90 },
    slides: [
      { role: 'hero', template: 'hero', title: 'FISH SMARTER\nSTAY AHEAD' },
      { role: 'use-case', template: 'hero', title: 'BEST SPOTS\nNEAR YOU' },
      { role: 'differentiator', template: 'hero', title: 'LIVE WEATHER\nUPDATES' },
      { role: 'secondary', template: 'hero', title: 'DEPTH CHARTS\n& MAPS' },
      { role: 'secondary', template: 'hero', title: 'LIVE FISH\nACTIVITY' },
      { role: 'proof', template: 'social-proof', title: '1,000,000+\nANGLERS' },
    ],
  },
  {
    id: 'sky-bright',
    name: 'Sky Bright',
    tagline: 'Cyan · friendly + bold',
    swatch: '#38BDF8',
    background: {
      type: 'linear-gradient',
      gradientStops: [
        { color: '#38BDF8', position: 0 },
        { color: '#0EA5E9', position: 100 },
      ],
      gradientAngle: 180,
    },
    title: {
      fontFamily: 'Nunito',
      fontSize: 40,
      fontWeight: 800,
      color: '#FFFFFF',
      subtitleColor: '#E0F2FE',
      subtitleFontSize: 18,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 90 },
    slides: [
      { role: 'hero', template: 'hero', title: 'Unlock\nyour mind.' },
      { role: 'use-case', template: 'feature', title: 'Train your brain\nwith fun games.' },
      { role: 'differentiator', template: 'centered', title: 'Sharpen your mind.\nConquer the day.' },
      { role: 'secondary', template: 'feature', title: 'Choose your\nlevel.' },
      { role: 'proof', template: 'social-proof', title: 'Track your\nprogress.' },
    ],
  },
  {
    id: 'soft-sage',
    name: 'Soft Sage',
    tagline: 'Sage cream · wellness',
    swatch: '#A7C4A0',
    background: {
      type: 'linear-gradient',
      gradientStops: [
        { color: '#E7EFE3', position: 0 },
        { color: '#F7F4EE', position: 100 },
      ],
      gradientAngle: 180,
    },
    title: {
      fontFamily: 'Bricolage Grotesque',
      fontSize: 38,
      fontWeight: 600,
      color: '#1F2A22',
      subtitleColor: '#4F5C53',
      subtitleFontSize: 17,
      alignment: 'center',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 86 },
    slides: [
      { role: 'hero', template: 'hero', title: 'Get more from\nyour wellness journey.' },
      { role: 'use-case', template: 'centered', title: 'All-in-one\nhealth & wellness.' },
      { role: 'differentiator', template: 'centered', title: 'Workouts with\nexpert trainers.' },
      { role: 'secondary', template: 'centered', title: 'Cook 800+\nhealthy recipes.' },
      { role: 'proof', template: 'social-proof', title: 'Loved by 1M+\nwellness seekers.' },
    ],
  },
  {
    id: 'stripe-soft',
    name: 'Stripe Soft',
    tagline: 'Soft lavender · dashboard',
    swatch: '#C7D2FE',
    background: {
      type: 'linear-gradient',
      gradientStops: [
        { color: '#E0E7FF', position: 0 },
        { color: '#C7D2FE', position: 100 },
      ],
      gradientAngle: 180,
    },
    title: {
      fontFamily: 'DM Sans',
      fontSize: 38,
      fontWeight: 700,
      color: '#1E1B4B',
      subtitleColor: '#3730A3',
      subtitleFontSize: 18,
      alignment: 'left',
    },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 88 },
    slides: [
      { role: 'hero', template: 'feature', title: 'Run your\nbusiness anywhere.' },
      { role: 'use-case', template: 'feature', title: 'Create payments\n& invoices instantly.' },
      { role: 'differentiator', template: 'feature', title: 'Accept contactless\npayments on your phone.' },
      { role: 'secondary', template: 'feature', title: 'See how your\nbusiness is growing.' },
      { role: 'secondary', template: 'feature', title: 'Stay in sync\nfrom any device.' },
      { role: 'proof', template: 'social-proof', title: 'Powering 4M+\nbusinesses.' },
    ],
  },
];

export function getKit(id: string): StarterKit | undefined {
  return STARTER_KITS.find((k) => k.id === id);
}
