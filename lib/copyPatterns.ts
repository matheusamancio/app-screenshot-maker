// Pattern-based copy generator. Runs entirely client-side — no AI/cloud call.
// Patterns are derived from the App Store/Play Store conventions used by top
// apps (Uber, Airbnb, Spotify, Notion). The first 3 slides carry ~80% of
// conversion weight, so hero/use-case/differentiator are the highest-leverage
// copy. Each voice provides 2-3 templates per role, picked deterministically
// by index so a deck doesn't repeat the same headline twice.

import type { RecipeRole } from './starterKits';

export type VoiceId = 'bold' | 'warm' | 'minimal' | 'playful' | 'premium' | 'direct';

export interface Voice {
  id: VoiceId;
  label: string;
  tagline: string;
  /** Short justification of when this voice works best — shown to the user. */
  bestFor: string;
  /** Two-line example that previews the voice's hero feel. */
  example: string;
  swatch: string;
}

export const VOICES: Voice[] = [
  {
    id: 'bold',
    label: 'Bold',
    tagline: 'Punchy, urgent, declarative',
    bestFor: 'Productivity, fitness, finance — anything that promises a sharper version of the user.',
    example: 'Master your\nhabits.',
    swatch: '#EF4444',
  },
  {
    id: 'warm',
    label: 'Warm',
    tagline: 'Personal, you-focused, gentle',
    bestFor: 'Wellness, journaling, family, hobby apps. Builds trust quickly.',
    example: 'Your day,\nyour way.',
    swatch: '#F59E0B',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    tagline: 'Single words, calm cadence',
    bestFor: 'Premium tools, design apps, focus apps. Confident enough to say less.',
    example: 'Focus.\nFlow.',
    swatch: '#1A1917',
  },
  {
    id: 'playful',
    label: 'Playful',
    tagline: 'Casual lowercase, friendly, candid',
    bestFor: 'Social, dating, casual games, indie tools. Don’t take yourself too seriously.',
    example: 'say hi to\nbetter habits.',
    swatch: '#F43F5E',
  },
  {
    id: 'premium',
    label: 'Premium',
    tagline: 'Considered, thoughtful, qualified',
    bestFor: 'Hospitality, finance, B2B, editorial. Signals quality and care.',
    example: 'The thoughtful way\nto track your day.',
    swatch: '#0F172A',
  },
  {
    id: 'direct',
    label: 'Direct',
    tagline: 'Clear benefits, no fluff',
    bestFor: 'Utilities, dev tools, productivity. When the value is obvious, say it plainly.',
    example: 'Track your habits.\nFor real this time.',
    swatch: '#5B5FED',
  },
];

export interface RoleGuidance {
  role: RecipeRole;
  label: string;
  /** What this slide should accomplish — shown next to the generated copy. */
  recipe: string;
}

export const ROLE_GUIDANCE: RoleGuidance[] = [
  {
    role: 'hero',
    label: 'Hero',
    recipe:
      'First impression. Apple shows only the first 3 in search — this is the one most users will see. Lead with your strongest benefit, not a feature list.',
  },
  {
    role: 'use-case',
    label: 'Use case',
    recipe:
      'The main thing your app does. One concrete action, in plain language. Avoid jargon.',
  },
  {
    role: 'differentiator',
    label: 'Differentiator',
    recipe:
      'Why you, not them. What makes your app different from the obvious alternatives.',
  },
  {
    role: 'secondary',
    label: 'Feature',
    recipe:
      'A specific feature with a clear payoff. Pair the feature with the outcome it produces.',
  },
  {
    role: 'proof',
    label: 'Social proof',
    recipe:
      'Numbers, ratings, awards, press. Replace placeholders with real data when you have it. Never invent metrics.',
  },
  {
    role: 'cta',
    label: 'CTA',
    recipe:
      'Closing nudge. A short invite to join, start, or download. Keep it action-oriented.',
  },
];

interface PatternBlock {
  title: string;
  subtitle?: string;
  showSubtitle?: boolean;
}

// Each voice maps a role to 2-3 patterns. Generator picks by slide index so
// repeats (e.g. two `secondary` slots) get different copy.
const PATTERNS: Record<VoiceId, Record<RecipeRole, PatternBlock[]>> = {
  bold: {
    hero: [
      { title: 'Master your\n{noun}.', subtitle: '{Verb} more. {Verb} less.', showSubtitle: true },
      { title: '{Verb} more.\n{Verb} less.' },
      { title: 'Built to\n{verb}.' },
    ],
    'use-case': [
      { title: 'Log it in\none tap.', subtitle: 'Built for {audience}.', showSubtitle: true },
      { title: 'Plan your day\nin seconds.' },
    ],
    differentiator: [
      { title: 'Made for\n{audience}.', subtitle: 'No clutter. No friction.', showSubtitle: true },
      { title: 'Different\nby design.' },
    ],
    secondary: [
      { title: 'Smart shortcuts\nthat learn.', subtitle: 'The more you use it, the smarter it gets.', showSubtitle: true },
      { title: '{Noun} that\nactually stick.' },
      { title: 'Track what\nmatters.' },
    ],
    proof: [
      { title: 'Trusted by\nthousands.', subtitle: 'Add real numbers when you have them.', showSubtitle: true },
      { title: 'Featured by\nthe Editors.' },
    ],
    cta: [
      { title: 'Start now.\nIt’s free.' },
      { title: 'Get the app.' },
    ],
  },
  warm: {
    hero: [
      { title: 'Your {noun}.\nYour way.', subtitle: 'Designed for {audience}.', showSubtitle: true },
      { title: 'Take care of\nwhat matters.' },
      { title: 'Built for\nreal life.' },
    ],
    'use-case': [
      { title: 'Easy enough\nfor every day.', subtitle: 'One tap. Zero friction.', showSubtitle: true },
      { title: 'Your day,\nmade simple.' },
    ],
    differentiator: [
      { title: 'Made with\ncare.', subtitle: 'Every detail matters to you, so it matters to us.', showSubtitle: true },
      { title: 'Designed for\n{audience}.' },
    ],
    secondary: [
      { title: 'Gentle reminders.\nReal results.', subtitle: 'A little nudge, when you need it.', showSubtitle: true },
      { title: 'Quietly\npowerful.' },
      { title: 'Always\nthere.' },
    ],
    proof: [
      { title: 'Loved by\n{audience}.', subtitle: 'Add your real review count here.', showSubtitle: true },
      { title: 'Reviews\nthat matter.' },
    ],
    cta: [
      { title: 'Come see\nfor yourself.' },
      { title: 'Try it today.' },
    ],
  },
  minimal: {
    hero: [
      { title: '{Verb}.\nDone.' },
      { title: 'Less.\nMore.' },
      { title: 'Focus.\nFlow.' },
    ],
    'use-case': [
      { title: 'One tap.\nEverything synced.' },
      { title: 'Track.\nReview.' },
    ],
    differentiator: [
      { title: 'Calm by\ndesign.' },
      { title: 'Quietly\npowerful.' },
    ],
    secondary: [
      { title: 'Smart.\nSimple.' },
      { title: 'Always\nthere.' },
      { title: 'Focused.\nFast.' },
    ],
    proof: [
      { title: 'Trusted.', subtitle: 'Replace with real numbers.', showSubtitle: true },
      { title: '★ 4.9' },
    ],
    cta: [
      { title: 'Start.' },
      { title: 'Begin\ntoday.' },
    ],
  },
  playful: {
    hero: [
      { title: 'say hi to\nbetter {noun}.' },
      { title: '{noun}\nbut fun.' },
      { title: 'the {noun}\napp you’ll actually use.' },
    ],
    'use-case': [
      { title: 'tap.\nlog. done.', subtitle: 'no friction, no excuses.', showSubtitle: true },
      { title: 'add it in a\nsecond.' },
    ],
    differentiator: [
      { title: 'made for\n{audience}.' },
      { title: 'different\non purpose.' },
    ],
    secondary: [
      { title: 'smart stuff,\nzero stress.' },
      { title: 'we got you.' },
      { title: 'less effort,\nmore wins.' },
    ],
    proof: [
      { title: 'real people,\nreal results.', subtitle: 'pop your real reviews here.', showSubtitle: true },
      { title: '★ 4.9 stars\nand counting.' },
    ],
    cta: [
      { title: 'come hang.' },
      { title: 'try it,\nyou’ll see.' },
    ],
  },
  premium: {
    hero: [
      { title: 'The thoughtful way\nto {verb} your {noun}.', subtitle: 'Crafted for {audience}.', showSubtitle: true },
      { title: 'Considered\nin every detail.' },
      { title: 'Made for\nthe everyday.' },
    ],
    'use-case': [
      { title: 'Refined for\nfocus.', subtitle: 'Every interaction, intentional.', showSubtitle: true },
      { title: 'Beautifully\nsimple.' },
    ],
    differentiator: [
      { title: 'Built\nto last.', subtitle: 'No churn. No clutter. No noise.', showSubtitle: true },
      { title: 'Quietly\nexceptional.' },
    ],
    secondary: [
      { title: 'Powerful tools.\nClean experience.', subtitle: 'Intuitive enough for every day.', showSubtitle: true },
      { title: 'Considered\nin every way.' },
      { title: 'Designed\nwith intent.' },
    ],
    proof: [
      { title: 'Trusted by\nthousands of {audience}.', subtitle: 'Replace with verified figures.', showSubtitle: true },
      { title: 'Featured by\nthe Editors.' },
    ],
    cta: [
      { title: 'Begin your\njourney.' },
      { title: 'Experience\nit yourself.' },
    ],
  },
  direct: {
    hero: [
      { title: '{Verb} your {noun}.', subtitle: 'For real this time.', showSubtitle: true },
      { title: '{Noun} that\nwork.' },
      { title: 'Get more\ndone.' },
    ],
    'use-case': [
      { title: 'Log {noun}\nfast.', subtitle: 'One tap. Done.', showSubtitle: true },
      { title: 'All in\none place.' },
    ],
    differentiator: [
      { title: 'Built for\n{audience}.' },
      { title: 'Simple\nby design.' },
    ],
    secondary: [
      { title: '{Verb} smarter,\nnot harder.' },
      { title: 'Smart {noun},\nautomated.' },
      { title: 'See the\ndifference.' },
    ],
    proof: [
      { title: '★ 4.9 average\nrating.', subtitle: 'Replace with your real numbers.', showSubtitle: true },
      { title: 'Trusted by\nthousands.' },
    ],
    cta: [
      { title: 'Try it.\nIt’s free.' },
      { title: 'Get started.' },
    ],
  },
};

// --- Variable extraction -----------------------------------------------------

const KNOWN_VERBS = [
  'track', 'plan', 'build', 'manage', 'learn', 'save', 'organize', 'focus',
  'create', 'share', 'log', 'capture', 'edit', 'sync', 'find', 'schedule',
  'design', 'study', 'write', 'read', 'listen', 'watch', 'shop', 'pay',
  'cook', 'train', 'meditate', 'sleep', 'count', 'budget', 'invest', 'send',
];

const KNOWN_NOUNS = [
  'habits', 'tasks', 'goals', 'money', 'notes', 'time', 'photos', 'contacts',
  'books', 'workouts', 'recipes', 'meals', 'expenses', 'projects', 'files',
  'ideas', 'sleep', 'mood', 'symptoms', 'songs', 'podcasts', 'lessons',
  'words', 'languages', 'sales', 'pages', 'designs', 'code', 'meetings',
  'flights', 'rides', 'trips', 'plants', 'pets', 'baby', 'kids', 'team',
  'budget', 'income', 'investments', 'recipes', 'workouts', 'routines',
];

function findFirstMatch(haystack: string, options: string[]): string | null {
  const lower = haystack.toLowerCase();
  let bestIdx = Infinity;
  let best: string | null = null;
  for (const opt of options) {
    const re = new RegExp(`\\b${opt}\\b`, 'i');
    const m = lower.match(re);
    if (m && m.index !== undefined && m.index < bestIdx) {
      bestIdx = m.index;
      best = opt;
    }
  }
  return best;
}

interface ExtractedVars {
  app: string;
  audience: string;
  verb: string;     // lowercase
  Verb: string;     // capitalized
  noun: string;
  Noun: string;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function extractVars(input: { appName: string; description: string; audience?: string }): ExtractedVars {
  const verbRaw = findFirstMatch(input.description, KNOWN_VERBS) || 'manage';
  const nounRaw = findFirstMatch(input.description, KNOWN_NOUNS) || 'your work';
  const audience = (input.audience && input.audience.trim()) || 'you';

  return {
    app: input.appName,
    audience,
    verb: verbRaw,
    Verb: capitalize(verbRaw),
    noun: nounRaw,
    Noun: capitalize(nounRaw),
  };
}

function fillTemplate(tpl: string, vars: ExtractedVars): string {
  return tpl
    .replace(/\{app\}/g, vars.app)
    .replace(/\{audience\}/g, vars.audience)
    .replace(/\{verb\}/g, vars.verb)
    .replace(/\{Verb\}/g, vars.Verb)
    .replace(/\{noun\}/g, vars.noun)
    .replace(/\{Noun\}/g, vars.Noun);
}

// --- Generator ---------------------------------------------------------------

export interface GeneratedSlide {
  role: RecipeRole;
  title: string;
  subtitle: string;
  showSubtitle: boolean;
}

export interface GenerateInput {
  appName: string;
  description: string;
  audience?: string;
  voiceId: VoiceId;
  /** Roles in order, from the chosen kit. */
  roles: RecipeRole[];
}

export function generatePatternCopy(input: GenerateInput): GeneratedSlide[] {
  const vars = extractVars(input);
  const voicePatterns = PATTERNS[input.voiceId];

  // Track how many times each role has appeared so identical roles get
  // different patterns (e.g. two `secondary` slides).
  const roleCounters: Partial<Record<RecipeRole, number>> = {};

  return input.roles.map((role) => {
    const idx = roleCounters[role] || 0;
    roleCounters[role] = idx + 1;
    const options = voicePatterns[role] || voicePatterns.secondary;
    const pick = options[idx % options.length];

    const title = fillTemplate(pick.title, vars);
    const subtitle = pick.subtitle ? fillTemplate(pick.subtitle, vars) : '';
    return {
      role,
      title,
      subtitle,
      showSubtitle: !!pick.showSubtitle && !!subtitle,
    };
  });
}

export function previewHeroFor(voiceId: VoiceId, appName: string): string {
  const v = VOICES.find((x) => x.id === voiceId);
  if (!v) return '';
  // Use the voice's example with the user's app name lightly applied.
  const vars = extractVars({ appName: appName || 'your app', description: '' });
  const heroTemplate = PATTERNS[voiceId].hero[0]?.title || v.example;
  return fillTemplate(heroTemplate, vars);
}
