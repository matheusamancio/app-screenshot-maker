'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { TemplateId, Slide } from '@/types';
import TemplateRenderer from '../../templates/TemplateRenderer';
import { useToast } from '../../ui/Toast';

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'feature', label: 'Feature' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'social-proof', label: 'Social Proof' },
  { id: 'split', label: 'Split' },
  { id: 'centered', label: 'Centered' },
];

function MiniThumb({ template, slide }: { template: TemplateId; slide: Slide }) {
  const w = 110;
  const h = 200;
  const innerW = 390;
  const innerH = 844;
  const scale = w / innerW;
  const dummy = { ...slide, template };
  return (
    <div className="relative overflow-hidden rounded-md" style={{ width: w, height: h, background: '#000' }}>
      <div style={{ width: innerW, height: innerH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <TemplateRenderer slide={dummy} width={innerW} height={innerH} />
      </div>
    </div>
  );
}

export default function LayoutPanel({ slide }: { slide: Slide }) {
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const slides = useProjectStore((s) => s.slides);
  const copySlideSettings = useProjectStore((s) => s.copySlideSettings);
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          className="h-9 rounded-md bg-muted text-secondary text-xs font-medium border border-border-default hover:bg-overlay"
          onClick={() => toast('Click a template below to change layout')}
        >
          Change layout
        </button>
        <button
          className="h-9 rounded-md bg-muted text-secondary text-xs font-medium border border-border-default hover:bg-overlay"
          onClick={() => toast('Editing is live — adjust panels at right')}
        >
          Edit layout
        </button>
        <button
          className="h-9 rounded-md bg-muted text-secondary text-xs font-medium border border-border-default hover:bg-overlay disabled:opacity-50"
          disabled={slides.length < 2}
          onClick={() => {
            copySlideSettings(slide.id, 'all');
            toast('Settings copied to all slides', 'success');
          }}
        >
          Copy settings ↓
        </button>
        <button
          className="h-9 rounded-md bg-muted text-secondary text-xs font-medium border border-border-default hover:bg-overlay"
          onClick={() => toast('Custom layout save coming soon')}
        >
          Save layout ✦
        </button>
      </div>

      <div>
        <div className="section-label mb-2">Templates</div>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => {
            const active = slide.template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updateSlide(slide.id, { template: t.id })}
                className={`p-1.5 rounded-md transition-all ${
                  active ? 'ring-2 ring-norte-primary bg-norte-primary-light' : 'ring-1 ring-border-default hover:ring-border-strong'
                }`}
              >
                <div className="flex justify-center">
                  <MiniThumb template={t.id} slide={slide} />
                </div>
                <div className={`text-[11px] font-medium mt-1 text-center ${active ? 'text-norte-primary' : 'text-secondary'}`}>{t.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
