import type {
  BackgroundConfig,
  TitleConfig,
  DeviceConfig,
  TemplateId,
  DeviceFrameType,
  DeviceFrameStyle,
  SlideElement,
} from '@/types';

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

type El = Omit<SlideElement, 'id'>;
const TXT = (x: number, y: number, text: string, fontSize: number, fontWeight: number, color: string, width = 300): El => ({ kind: 'text', x, y, rotation: 0, scale: 1, text, fontSize, fontWeight, color, align: 'center', width });
const SHP = (x: number, y: number, w: number, h: number, bg: string, radius = 22): El => ({ kind: 'shape', x, y, w, h, bg, radius, rotation: 0, scale: 1 });
const CARD = (x: number, y: number, w: number, h: number, bg: string, opts: Partial<El>): El => ({ kind: 'card', x, y, w, h, bg, radius: 22, rotation: 0, scale: 1, ...opts });
/** A light phone body that holds the in-screen components. */
const PHONE = (): El => ({ kind: 'shape', x: 195, y: 520, w: 252, h: 560, bg: '#F4F1EA', radius: 46, rotation: 0, scale: 1 });

/** Each Norte screen fully decomposed into editable, localizable components — no flat image. */
const NORTE_COMPONENTS_SLIDES: StarterKitSlide[] = [
  {
    role: 'hero',
    template: 'hero',
    title: '',
    noChrome: true,
    elements: [
      HEADLINE('One Tap.\n[One Square.]'),
      SUBHEAD("Today's habits — each check fills your grid."),
      PHONE(),
      TXT(195, 320, '3 / 4 feitos', 36, 800, '#111111', 240),
      { kind: 'datestrip', x: 195, y: 372, w: 224, days: 'Q,S,S,D,S,T', dates: '28,29,30,31,1,2', activeIndex: 5, rotation: 0, scale: 1 },
      CARD(195, 446, 220, 70, '#FFFFFF', { cardTitle: '🏋️ exercitar', cardValue: '20min', cardCaption: '7d · 54%', fontSize: 20, color: '#111111', radius: 16 }),
      { kind: 'heatmap', x: 195, y: 600, w: 224, cols: 11, rows: 7, fill: 0.5, cell: '#1C1C1E', bg: '#D8D5CE', rotation: 0, scale: 1 },
    ],
  },
  {
    role: 'use-case',
    template: 'hero',
    title: '',
    noChrome: true,
    elements: [
      HEADLINE('Build Daily [Streaks]\nThat Stick'),
      SUBHEAD('One tap to check in — tiny days count.'),
      NORTE_EMOJI(56, 210, '🧘', -6),
      NORTE_EMOJI(334, 210, '📚', 6),
      PHONE(),
      TXT(195, 330, 'Meditar', 32, 800, '#111111', 240),
      { kind: 'card', x: 195, y: 450, w: 230, h: 150, bg: '#1C1C1E', radius: 24, cardTitle: '🔥 Sequência atual', cardValue: '9d', cardCaption: '✓ Cumprido hoje', accent: '#FFFFFF', fontSize: 46, rotation: 0, scale: 1 },
      CARD(110, 620, 70, 64, '#FFFFFF', { cardTitle: 'Semana', cardValue: '7/7', fontSize: 22, color: '#111111', radius: 14 }),
      CARD(195, 620, 70, 64, '#FFFFFF', { cardTitle: '30d', cardValue: '25', fontSize: 22, color: '#111111', radius: 14 }),
      CARD(280, 620, 70, 64, '#FFFFFF', { cardTitle: 'Ano', cardValue: '18%', fontSize: 22, color: '#111111', radius: 14 }),
    ],
  },
  {
    role: 'differentiator',
    template: 'hero',
    title: '',
    noChrome: true,
    elements: [
      HEADLINE('Gentle Nudges,\n[Real Habits]'),
      SUBHEAD('Goals, reminders, and habits in view — backed by science.'),
      NORTE_EMOJI(60, 235, '☀️', -8),
      PHONE(),
      CARD(195, 380, 226, 96, '#FFFFFF', { cardTitle: 'Norte · agora', cardValue: 'Hora de meditar 🧘', cardCaption: 'Mantenha sua sequência de 9 dias', fontSize: 18, color: '#111111', radius: 18 }),
      { kind: 'card', x: 195, y: 520, w: 226, h: 150, bg: '#1C1C1E', radius: 22, cardTitle: 'Norte · hoje', cardValue: '2 / 3 feitos', cardCaption: '✓ exercitar  ✓ Leitura  ○ Água', accent: '#FFFFFF', fontSize: 22, rotation: 0, scale: 1 },
    ],
  },
  {
    role: 'secondary',
    template: 'hero',
    title: '',
    noChrome: true,
    elements: [
      HEADLINE('[Private] by Design\nNo Account'),
      SUBHEAD('100% on your phone. No cloud, no sign-up, no tracking — ever.'),
      NORTE_EMOJI(60, 235, '🏃', -8),
      PHONE(),
      SHP(195, 430, 84, 84, '#111111', 42),
      { kind: 'icon', x: 195, y: 430, w: 40, h: 40, icon: 'lock', color: '#FFFFFF', rotation: 0, scale: 1 },
      TXT(195, 510, 'Tudo fica no\nseu aparelho', 26, 800, '#111111', 240),
      TXT(195, 575, 'Seus dados nunca saem do seu iPhone.', 14, 500, '#6B6B6B', 240),
    ],
  },
  {
    role: 'secondary',
    template: 'hero',
    title: '',
    noChrome: true,
    elements: [
      HEADLINE('See Your Whole [Year]\nat a Glance'),
      SUBHEAD('Patterns, streaks, and progress across every habit.'),
      NORTE_EMOJI(334, 235, '🏋️', 8),
      PHONE(),
      TXT(150, 350, 'Mês a mês', 18, 700, '#111111', 160),
      SHP(110, 560, 36, 110, '#D8D5CE', 8),
      SHP(155, 575, 36, 95, '#D8D5CE', 8),
      SHP(200, 570, 36, 105, '#D8D5CE', 8),
      SHP(245, 545, 36, 145, '#D8D5CE', 8),
      SHP(290, 505, 36, 200, '#111111', 8),
      TXT(290, 630, '88%', 14, 800, '#111111', 60),
    ],
  },
  {
    role: 'cta',
    template: 'hero',
    title: '',
    noChrome: true,
    elements: [
      HEADLINE('Start [Today]\nBuild Better Habits'),
      SUBHEAD('Free to start. One habit. Your whole year.'),
      NORTE_EMOJI(70, 300, '🏋️', -8),
      NORTE_EMOJI(320, 300, '📚', 8),
      NORTE_EMOJI(80, 370, '🧘', -5),
      NORTE_EMOJI(310, 370, '🏃', 6),
      NORTE_EMOJI(70, 450, '💧', -10),
      NORTE_EMOJI(320, 450, '☀️', 10),
      { kind: 'emoji', x: 195, y: 470, rotation: 0, scale: 1, emoji: '⛰️', tile: true, check: true, size: 96 },
      TXT(195, 575, 'norte', 34, 800, '#111111', 220),
      TXT(195, 615, 'Track goals, streaks & your whole year.', 15, 500, '#6B6B6B', 280),
      { kind: 'laurel', x: 195, y: 720, size: 50, color: '#111111', cardValue: '+38,420', cardCaption: 'Hábitos cumpridos', rotation: 0, scale: 1 },
    ],
  },
];

export const STARTER_KITS: StarterKit[] = [
  {
    id: 'norte-components',
    name: 'Norte · Components',
    tagline: 'Every screen broken into editable components',
    swatch: '#111111',
    background: { type: 'solid', solidColor: '#EDEBE5' },
    title: { fontFamily: 'Archivo', fontSize: 38, fontWeight: 800, color: '#111111', subtitleColor: '#6B6B6B', subtitleFontSize: 17, alignment: 'center' },
    device: { frameType: 'iphone-15', frameStyle: 'real-light', scale: 84 },
    slides: NORTE_COMPONENTS_SLIDES,
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
