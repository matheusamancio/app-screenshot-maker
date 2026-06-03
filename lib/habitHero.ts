import type { HabitHeroConfig } from '@/types';

/** Scatter positions (percent of canvas) for the floating habit tiles. */
export const TILE_POSITIONS: { x: number; y: number; r: number }[] = [
  { x: 8, y: 30, r: -8 },
  { x: 45, y: 24, r: 6 },
  { x: 78, y: 29, r: 9 },
  { x: 24, y: 37, r: -5 },
  { x: 64, y: 37, r: 5 },
  { x: 6, y: 45, r: -11 },
  { x: 82, y: 44, r: 11 },
  { x: 42, y: 49, r: -3 },
];

export const DEFAULT_HABIT_HERO: HabitHeroConfig = {
  emojis: ['🏋️', '📚', '🧘', '🏃', '☀️', '💧', '🍌'],
  showChecks: true,
  appEmoji: '⛰️',
  appName: 'Norte',
  appTagline: 'Habit Tracking',
  ratingValue: '+38,420',
  ratingLabel: 'HÁBITOS CUMPRIDOS',
  showLaurel: true,
  showStars: true,
};

export function defaultHabitHero(): HabitHeroConfig {
  return { ...DEFAULT_HABIT_HERO, emojis: [...DEFAULT_HABIT_HERO.emojis] };
}
