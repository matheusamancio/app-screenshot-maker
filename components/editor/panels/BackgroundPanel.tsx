'use client';

import React, { useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, BackgroundType, BackgroundConfig } from '@/types';
import { GRADIENT_PRESETS } from '@/lib/presets';
import { gradientCss, fileToBase64 } from '@/lib/utils';
import ColorPicker from '../../ui/ColorPicker';
import GradientEditor from '../../ui/GradientEditor';

const TYPES: { id: BackgroundType; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '∅' },
  { id: 'solid', label: 'Solid', icon: '⬤' },
  { id: 'linear-gradient', label: 'Linear', icon: '▦' },
  { id: 'radial-gradient', label: 'Radial', icon: '◎' },
  { id: 'image', label: 'Image', icon: '⋮' },
  { id: 'mesh', label: 'Mesh', icon: '✦' },
];

export default function BackgroundPanel({ slide }: { slide: Slide }) {
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const fileRef = useRef<HTMLInputElement>(null);
  const bg = slide.background;

  const setBg = (b: Partial<BackgroundConfig>) => updateSlide(slide.id, { background: { ...bg, ...b } });

  const setType = (t: BackgroundType) => {
    if (t === 'solid' && !bg.solidColor) setBg({ type: t, solidColor: '#5B5FED' });
    else if ((t === 'linear-gradient' || t === 'radial-gradient') && !bg.gradientStops) {
      setBg({
        type: t,
        gradientStops: [
          { color: '#5B5FED', position: 0 },
          { color: '#818CF8', position: 100 },
        ],
        gradientAngle: 135,
      });
    } else {
      setBg({ type: t });
    }
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    setBg({ type: 'image', imageBase64: b64 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1.5">
        {TYPES.map((t) => {
          const active = bg.type === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`px-2 py-2 text-xs rounded-md flex flex-col items-center gap-1 transition-all ${
                active ? 'bg-norte-primary-light text-norte-primary ring-1 ring-norte-primary' : 'bg-overlay text-secondary border border-border-default hover:border-border-strong'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              <span className="font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>

      {bg.type === 'solid' && (
        <ColorPicker color={bg.solidColor || '#5B5FED'} onChange={(c) => setBg({ solidColor: c })} />
      )}

      {(bg.type === 'linear-gradient' || bg.type === 'radial-gradient') && bg.gradientStops && (
        <GradientEditor
          stops={bg.gradientStops}
          angle={bg.gradientAngle ?? 135}
          onChange={(stops, angle) => setBg({ gradientStops: stops, gradientAngle: angle, presetId: undefined })}
        />
      )}

      {bg.type === 'image' && (
        <div className="space-y-2">
          {bg.imageBase64 && (
            <div
              className="h-24 rounded-md border border-border-default bg-cover bg-center"
              style={{ backgroundImage: `url(${bg.imageBase64})` }}
            />
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-9 bg-muted border border-border-default rounded-md text-sm text-secondary font-medium hover:bg-overlay"
          >
            {bg.imageBase64 ? 'Replace image ↑' : 'Upload background image ↑'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
        </div>
      )}

      <div>
        <div className="section-label mb-2">Presets</div>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((p) => {
            const active = bg.presetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() =>
                  setBg({
                    type: 'linear-gradient',
                    gradientStops: p.stops,
                    gradientAngle: p.angle,
                    presetId: p.id,
                  })
                }
                className={`h-12 rounded-md transition-all ${
                  active ? 'ring-2 ring-norte-primary' : 'ring-1 ring-border-default hover:ring-border-strong'
                }`}
                style={{ backgroundImage: gradientCss(p.stops, p.angle, 'linear') }}
                title={p.label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
