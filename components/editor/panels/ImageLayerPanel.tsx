'use client';

import React, { useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, OverlayImageConfig } from '@/types';
import Slider from '../../ui/Slider';
import Dropdown from '../../ui/Dropdown';
import { fileToBase64 } from '@/lib/utils';

export default function ImageLayerPanel({ slide }: { slide: Slide }) {
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const fileRef = useRef<HTMLInputElement>(null);
  const o = slide.overlayImage;
  const setOverlay = (data: Partial<OverlayImageConfig>) => updateSlide(slide.id, { overlayImage: { ...o, ...data } });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    setOverlay({ imageBase64: b64 });
  };

  return (
    <div className="space-y-3">
      {o.imageBase64 ? (
        <div className="relative rounded-md overflow-hidden border border-border-default bg-overlay h-24">
          <img src={o.imageBase64} alt="" className="w-full h-full object-contain" />
          <button
            onClick={() => setOverlay({ imageBase64: null })}
            className="absolute top-1 right-1 h-6 px-2 text-[11px] font-medium bg-surface/95 border border-border-default rounded text-error hover:bg-error/10"
          >
            Remove
          </button>
        </div>
      ) : null}

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full h-20 rounded-md border-2 border-dashed border-border-strong text-text-muted text-sm hover:border-norte-primary hover:text-norte-primary transition-all"
      >
        Upload decorative image ↑
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div>
        <div className="section-label mb-1.5">Fit</div>
        <Dropdown<'contain' | 'cover' | 'fill'>
          value={o.fit}
          onChange={(v) => setOverlay({ fit: v })}
          options={[
            { value: 'contain', label: 'Contain' },
            { value: 'cover', label: 'Cover' },
            { value: 'fill', label: 'Fill' },
          ]}
        />
      </div>

      <Slider
        label="Opacity"
        value={Math.round(o.opacity * 100)}
        min={0}
        max={100}
        suffix="%"
        onChange={(v) => setOverlay({ opacity: v / 100 })}
      />

      <div>
        <div className="section-label mb-1.5">Vertical position</div>
        <div className="grid grid-cols-3 gap-1 bg-overlay rounded-md p-1 border border-border-default">
          {(['top', 'center', 'bottom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setOverlay({ verticalPosition: p })}
              className={`h-7 text-xs rounded font-medium ${
                o.verticalPosition === p ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
              }`}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">Layer visible</span>
        <button
          onClick={() => setOverlay({ layer: { ...o.layer, visible: !o.layer.visible } })}
          className={`h-6 w-10 rounded-full ${o.layer.visible ? 'bg-norte-primary' : 'bg-muted'}`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
              o.layer.visible ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
