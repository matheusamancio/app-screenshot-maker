'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, FeatureCard } from '@/types';
import { defaultFeatureCards, newFeatureCard } from '@/lib/featureCards';

export default function FeaturesPanel({ slide }: { slide: Slide }) {
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const cards: FeatureCard[] = slide.featureCards && slide.featureCards.length > 0 ? slide.featureCards : [];
  const isActiveLayout = slide.template === 'feature-cards';

  const setCards = (next: FeatureCard[]) => updateSlide(slide.id, { featureCards: next });

  const patchCard = (id: string, data: Partial<FeatureCard>) =>
    setCards(cards.map((c) => (c.id === id ? { ...c, ...data } : c)));

  const removeCard = (id: string) => setCards(cards.filter((c) => c.id !== id));

  const moveCard = (index: number, dir: -1 | 1) => {
    const next = [...cards];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setCards(next);
  };

  const addCard = () => setCards([...cards, newFeatureCard()]);
  const seedSamples = () => setCards(defaultFeatureCards());

  return (
    <div className="space-y-3">
      {!isActiveLayout && (
        <button
          onClick={() => updateSlide(slide.id, { template: 'feature-cards', featureCards: cards.length ? cards : defaultFeatureCards() })}
          className="w-full h-9 rounded-md bg-norte-primary text-white text-xs font-sora font-semibold hover:bg-norte-primary-hover"
        >
          Use Feature Cards layout
        </button>
      )}

      <div className="text-[11px] text-text-muted leading-relaxed">
        Each card is a dark highlight box. In the rows box: <span className="font-mono text-secondary">Label | Value</span> makes a
        key→value row, <span className="font-mono text-secondary">*text</span> highlights a row, end a line with{' '}
        <span className="font-mono text-secondary">›</span> for a chevron.
      </div>

      {cards.length === 0 ? (
        <button
          onClick={seedSamples}
          className="w-full h-9 rounded-md bg-norte-primary-light text-norte-primary text-xs font-semibold border border-norte-primary/30 hover:bg-norte-primary/10"
        >
          ✦ Add sample cards
        </button>
      ) : (
        <div className="space-y-3">
          {cards.map((card, i) => (
            <div key={card.id} className="bg-overlay border border-border-default rounded-md p-2.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  value={card.title}
                  onChange={(e) => patchCard(card.id, { title: e.target.value })}
                  placeholder="Card title"
                  className="flex-1 min-w-0 px-2 py-1.5 text-sm font-semibold bg-surface border border-border-default rounded text-secondary focus:border-norte-primary focus:outline-none"
                />
                <button onClick={() => moveCard(i, -1)} disabled={i === 0} className="w-6 h-6 rounded bg-muted text-text-muted hover:text-secondary disabled:opacity-30 text-xs" title="Move up">↑</button>
                <button onClick={() => moveCard(i, 1)} disabled={i === cards.length - 1} className="w-6 h-6 rounded bg-muted text-text-muted hover:text-secondary disabled:opacity-30 text-xs" title="Move down">↓</button>
                <button onClick={() => removeCard(card.id)} className="w-6 h-6 rounded bg-muted text-text-muted hover:text-error text-xs" title="Remove">✕</button>
              </div>
              <textarea
                value={card.body}
                onChange={(e) => patchCard(card.id, { body: e.target.value })}
                rows={4}
                placeholder={'Start at | 9:00 AM\nEnd at | 5:00 PM\n*Highlighted'}
                className="w-full px-2 py-1.5 text-xs font-mono bg-surface border border-border-default rounded text-secondary resize-y focus:border-norte-primary focus:outline-none"
              />
            </div>
          ))}
          <button
            onClick={addCard}
            className="w-full h-9 rounded-md bg-muted border border-border-default text-secondary text-xs font-medium hover:bg-overlay"
          >
            + Add card
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-text-muted">Show “&amp; more!” footer</span>
        <button
          onClick={() => updateSlide(slide.id, { featureMore: !(slide.featureMore !== false) })}
          className={`h-6 w-10 rounded-full transition-all ${slide.featureMore !== false ? 'bg-norte-primary' : 'bg-muted'}`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
              slide.featureMore !== false ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
