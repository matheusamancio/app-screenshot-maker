'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, Alignment, TitleConfig } from '@/types';
import ColorPicker from '../../ui/ColorPicker';
import FontPicker from '../../ui/FontPicker';
import Slider from '../../ui/Slider';
import Dropdown from '../../ui/Dropdown';
import { useToast } from '../../ui/Toast';

export default function TitlePanel({ slide }: { slide: Slide }) {
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const { toast } = useToast();
  const t = slide.title;

  const setTitle = (data: Partial<TitleConfig>) => updateSlide(slide.id, { title: { ...t, ...data } });

  return (
    <div className="space-y-3">
      <textarea
        value={t.text}
        onChange={(e) => setTitle({ text: e.target.value })}
        placeholder="Title text"
        rows={3}
        className="w-full px-3 py-2 bg-overlay border border-border-default rounded-md text-sm text-secondary resize-none"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">Subtitle</span>
        <button
          onClick={() => setTitle({ showSubtitle: !t.showSubtitle })}
          className={`h-6 w-10 rounded-full transition-all ${t.showSubtitle ? 'bg-norte-primary' : 'bg-muted'}`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
              t.showSubtitle ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {t.showSubtitle && (
        <textarea
          value={t.subtitle}
          onChange={(e) => setTitle({ subtitle: e.target.value })}
          placeholder="Subtitle text"
          rows={2}
          className="w-full px-3 py-2 bg-overlay border border-border-default rounded-md text-sm text-secondary resize-none"
        />
      )}

      <div>
        <div className="section-label mb-1.5">Floating position</div>
        <div className="grid grid-cols-3 gap-1 bg-overlay rounded-md p-1 border border-border-default">
          {(['top', 'middle', 'bottom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setTitle({ floatingPosition: p })}
              className={`h-7 text-xs rounded font-medium ${
                t.floatingPosition === p ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
              }`}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="section-label mb-1.5">Font</div>
        <FontPicker value={t.fontFamily} onChange={(v) => setTitle({ fontFamily: v })} />
      </div>

      <Slider label="Font size" value={t.fontSize} min={12} max={72} suffix="px" onChange={(v) => setTitle({ fontSize: v })} />

      <div>
        <div className="section-label mb-1.5">Weight</div>
        <Dropdown
          value={String(t.fontWeight)}
          onChange={(v) => setTitle({ fontWeight: Number(v) })}
          options={[
            { value: '300', label: 'Light 300' },
            { value: '400', label: 'Regular 400' },
            { value: '500', label: 'Medium 500' },
            { value: '600', label: 'Semibold 600' },
            { value: '700', label: 'Bold 700' },
            { value: '800', label: 'Extrabold 800' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="section-label mb-1.5">Color</div>
          <ColorPicker color={t.color} onChange={(c) => setTitle({ color: c })} />
        </div>
        <div>
          <div className="section-label mb-1.5">Subtitle</div>
          <ColorPicker color={t.subtitleColor} onChange={(c) => setTitle({ subtitleColor: c })} />
        </div>
      </div>

      <div>
        <div className="section-label mb-1.5">Alignment</div>
        <div className="grid grid-cols-3 gap-1 bg-overlay rounded-md p-1 border border-border-default">
          {(['left', 'center', 'right'] as Alignment[]).map((a) => (
            <button
              key={a}
              onClick={() => setTitle({ alignment: a })}
              className={`h-7 text-base rounded font-medium ${
                t.alignment === a ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
              }`}
            >
              {a === 'left' ? '←' : a === 'right' ? '→' : '↔'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => toast('AI captions coming soon', 'info')}
          className="h-9 rounded-md bg-norte-primary-light text-norte-primary text-xs font-semibold border border-norte-primary/30 hover:bg-norte-primary/10"
        >
          AI ✦
        </button>
        <button
          onClick={() => toast('Match-size feature coming soon', 'info')}
          className="h-9 rounded-md bg-muted border border-border-default text-secondary text-xs font-medium hover:bg-overlay"
        >
          Match size ▽
        </button>
      </div>
    </div>
  );
}
