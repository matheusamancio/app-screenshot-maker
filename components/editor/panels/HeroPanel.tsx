'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, HabitHeroConfig, SlideElement } from '@/types';
import { defaultHabitHero, DEFAULT_HABIT_HERO, TILE_POSITIONS } from '@/lib/habitHero';
import { uid } from '@/lib/utils';
import { useToast } from '../../ui/Toast';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`h-6 w-10 rounded-full transition-all ${on ? 'bg-norte-primary' : 'bg-muted'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

/** Turn a hero config into individually movable/editable components. */
function heroElementsFromConfig(c: HabitHeroConfig): SlideElement[] {
  const els: SlideElement[] = [];
  c.emojis.forEach((emoji, i) => {
    const p = TILE_POSITIONS[i % TILE_POSITIONS.length];
    els.push({ id: uid(), kind: 'emoji', x: (p.x / 100) * 390, y: (p.y / 100) * 844, rotation: p.r, scale: 1, emoji, tile: true, check: c.showChecks, size: 60 });
  });
  els.push({ id: uid(), kind: 'emoji', x: 195, y: 505, rotation: 0, scale: 1, emoji: c.appEmoji, tile: true, check: c.showChecks, size: 84 });
  els.push({ id: uid(), kind: 'text', x: 195, y: 610, rotation: 0, scale: 1, text: c.appName, color: '#FFFFFF', fontSize: 30, fontWeight: 800, align: 'center', width: 240 });
  els.push({ id: uid(), kind: 'text', x: 195, y: 635, rotation: 0, scale: 1, text: c.appTagline, color: '#FFFFFFD9', fontSize: 17, fontWeight: 500, align: 'center', width: 240 });
  els.push({ id: uid(), kind: 'text', x: 195, y: 775, rotation: 0, scale: 1, text: c.ratingValue, color: '#111111', fontSize: 32, fontWeight: 800, align: 'center', width: 240 });
  els.push({ id: uid(), kind: 'text', x: 195, y: 798, rotation: 0, scale: 1, text: c.ratingLabel, color: '#6B6B6B', fontSize: 10, fontWeight: 700, align: 'center', width: 280 });
  return els;
}

export default function HeroPanel({ slide }: { slide: Slide }) {
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const { toast } = useToast();
  const isActive = slide.template === 'habit-hero';
  const cfg = slide.habitHero;

  const breakApart = () => {
    const c = slide.habitHero || DEFAULT_HABIT_HERO;
    updateSlide(slide.id, { habitHero: { ...c, exploded: true }, elements: [...(slide.elements || []), ...heroElementsFromConfig(c)] });
    toast('Hero broken into movable pieces — drag, edit, or copy each one', 'success');
  };

  const setCfg = (data: Partial<HabitHeroConfig>) => {
    const base = slide.habitHero || defaultHabitHero();
    updateSlide(slide.id, { habitHero: { ...base, ...data } });
  };

  if (!isActive || !cfg) {
    return (
      <div className="space-y-3">
        <div className="text-[11px] text-text-muted leading-relaxed">
          A composed hero: pill headline, floating emoji habit tiles, and a device showcase with a laurel rating. Edit the
          headline inline on the canvas (use <span className="font-mono text-secondary">[brackets]</span> for a pill).
        </div>
        <button
          onClick={() => {
            const isDefaultTitle = slide.title.text === 'Build something\nbeautiful.';
            const c = slide.habitHero || defaultHabitHero();
            updateSlide(slide.id, {
              template: 'habit-hero',
              habitHero: { ...c, exploded: true },
              elements: [...(slide.elements || []), ...heroElementsFromConfig(c)],
              title: {
                ...slide.title,
                text: isDefaultTitle ? '[Track] Every Habit,\nEvery Day' : slide.title.text,
                subtitle: slide.title.subtitle || 'One check at a time.',
                showSubtitle: true,
              },
            });
          }}
          className="w-full h-9 rounded-md bg-norte-primary text-white text-xs font-sora font-semibold hover:bg-norte-primary-hover"
        >
          Use Habit Hero layout
        </button>
      </div>
    );
  }

  if (cfg.exploded) {
    return (
      <div className="space-y-3">
        <div className="text-[11px] text-text-muted leading-relaxed">
          This hero has been <span className="font-semibold text-secondary">broken into movable pieces</span>. Select and edit each
          tile, label or number directly on the canvas, or in the <span className="font-semibold text-secondary">Components</span> panel.
          Drag to move, double-click text to edit, ⌘C / ⌘V to copy onto another slide.
        </div>
      </div>
    );
  }

  const setEmoji = (i: number, v: string) => {
    const emojis = [...cfg.emojis];
    emojis[i] = v;
    setCfg({ emojis });
  };
  const removeEmoji = (i: number) => setCfg({ emojis: cfg.emojis.filter((_, j) => j !== i) });
  const addEmoji = () => setCfg({ emojis: [...cfg.emojis, '✅'] });

  return (
    <div className="space-y-4">
      <button
        onClick={breakApart}
        className="w-full h-9 rounded-md bg-norte-primary-light text-norte-primary border border-norte-primary/30 text-xs font-semibold hover:bg-norte-primary/10"
      >
        ✂ Break into movable pieces
      </button>

      {/* Floating tiles */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="section-label">Habit tiles ({cfg.emojis.length})</div>
          <button onClick={addEmoji} className="text-[11px] px-2 py-1 rounded bg-muted border border-border-default text-secondary hover:bg-overlay">+ Add</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cfg.emojis.map((e, i) => (
            <div key={i} className="relative">
              <input
                value={e}
                onChange={(ev) => setEmoji(i, ev.target.value)}
                maxLength={4}
                className="w-full h-10 text-center text-lg bg-surface border border-border-default rounded-md focus:border-norte-primary focus:outline-none"
              />
              <button
                onClick={() => removeEmoji(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-muted border border-border-default text-text-muted hover:text-error text-[10px] flex items-center justify-center"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-muted">Check badges</span>
          <Toggle on={cfg.showChecks} onToggle={() => setCfg({ showChecks: !cfg.showChecks })} />
        </div>
      </div>

      {/* App card */}
      <div className="space-y-2">
        <div className="section-label">App card</div>
        <div className="flex gap-2">
          <input
            value={cfg.appEmoji}
            onChange={(e) => setCfg({ appEmoji: e.target.value })}
            maxLength={4}
            placeholder="⛰️"
            className="w-12 h-9 text-center text-lg bg-surface border border-border-default rounded-md focus:border-norte-primary focus:outline-none"
          />
          <input
            value={cfg.appName}
            onChange={(e) => setCfg({ appName: e.target.value })}
            placeholder="App name"
            className="flex-1 min-w-0 h-9 px-2.5 text-sm bg-surface border border-border-default rounded-md text-secondary focus:border-norte-primary focus:outline-none"
          />
        </div>
        <input
          value={cfg.appTagline}
          onChange={(e) => setCfg({ appTagline: e.target.value })}
          placeholder="Tagline"
          className="w-full h-9 px-2.5 text-sm bg-surface border border-border-default rounded-md text-secondary focus:border-norte-primary focus:outline-none"
        />
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <div className="section-label">Rating</div>
        <input
          value={cfg.ratingValue}
          onChange={(e) => setCfg({ ratingValue: e.target.value })}
          placeholder="+38,420"
          className="w-full h-9 px-2.5 text-sm bg-surface border border-border-default rounded-md text-secondary focus:border-norte-primary focus:outline-none"
        />
        <input
          value={cfg.ratingLabel}
          onChange={(e) => setCfg({ ratingLabel: e.target.value })}
          placeholder="HÁBITOS CUMPRIDOS"
          className="w-full h-9 px-2.5 text-sm bg-surface border border-border-default rounded-md text-secondary focus:border-norte-primary focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Laurel wreath</span>
          <Toggle on={cfg.showLaurel} onToggle={() => setCfg({ showLaurel: !cfg.showLaurel })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Stars</span>
          <Toggle on={cfg.showStars} onToggle={() => setCfg({ showStars: !cfg.showStars })} />
        </div>
      </div>
    </div>
  );
}
