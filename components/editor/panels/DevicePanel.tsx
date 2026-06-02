'use client';

import React, { useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, DeviceFrameType, DeviceFrameStyle, DeviceConfig } from '@/types';
import Dropdown from '../../ui/Dropdown';
import Slider from '../../ui/Slider';
import { fileToBase64 } from '@/lib/utils';

export default function DevicePanel({ slide }: { slide: Slide }) {
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const fileRef = useRef<HTMLInputElement>(null);
  const d = slide.device;
  const setDevice = (data: Partial<DeviceConfig>) => updateSlide(slide.id, { device: { ...d, ...data } });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    updateSlide(slide.id, { screenshot: b64 });
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="section-label mb-1.5">Device type</div>
        <Dropdown<DeviceFrameType>
          value={d.frameType}
          onChange={(v) => setDevice({ frameType: v })}
          options={[
            { value: 'iphone-15', label: 'iPhone 15' },
            { value: 'iphone-15-pro', label: 'iPhone 15 Pro' },
            { value: 'pixel-8', label: 'Google Pixel 8' },
            { value: 'ipad', label: 'iPad' },
            { value: 'none', label: 'No frame' },
          ]}
        />
      </div>

      <div>
        <div className="section-label mb-1.5">Style</div>
        <Dropdown<DeviceFrameStyle>
          value={d.frameStyle}
          onChange={(v) => setDevice({ frameStyle: v })}
          options={[
            { value: 'real-dark', label: 'Real Dark' },
            { value: 'real-light', label: 'Real Light' },
            { value: 'clay-dark', label: 'Clay Dark' },
            { value: 'clay-light', label: 'Clay Light' },
            { value: 'outline', label: 'Outline' },
            { value: 'none', label: 'None' },
          ]}
        />
      </div>

      <div>
        <div className="section-label mb-1.5">Orientation</div>
        <div className="grid grid-cols-2 gap-1 bg-overlay rounded-md p-1 border border-border-default">
          {(['portrait', 'landscape'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setDevice({ orientation: o })}
              className={`h-7 text-xs rounded font-medium ${
                d.orientation === o ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
              }`}
            >
              {o[0].toUpperCase() + o.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Slider label="Scale" value={d.scale} min={40} max={130} suffix="%" onChange={(v) => setDevice({ scale: v })} />

      <div>
        <div className="section-label mb-1.5">Vertical position</div>
        <div className="grid grid-cols-3 gap-1 bg-overlay rounded-md p-1 border border-border-default">
          {(['top', 'center', 'bottom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setDevice({ verticalPosition: p })}
              className={`h-7 text-xs rounded font-medium ${
                d.verticalPosition === p ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
              }`}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="h-9 rounded-md bg-norte-primary text-white text-xs font-semibold hover:bg-norte-primary-hover shadow-sm"
        >
          Add screenshots ↑
        </button>
        <button
          onClick={() => updateSlide(slide.id, { screenshot: null })}
          className="h-9 rounded-md bg-muted border border-border-default text-secondary text-xs font-medium hover:bg-overlay disabled:opacity-50"
          disabled={!slide.screenshot}
        >
          Clear ⇄
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
    </div>
  );
}
