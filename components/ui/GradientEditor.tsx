'use client';

import React, { useState } from 'react';
import { gradientCss } from '@/lib/utils';
import type { GradientStop } from '@/types';
import ColorPicker from './ColorPicker';

interface Props {
  stops: GradientStop[];
  angle: number;
  onChange: (stops: GradientStop[], angle: number) => void;
}

export default function GradientEditor({ stops, angle, onChange }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  const update = (i: number, c: string) => {
    const next = stops.map((s, idx) => (idx === i ? { ...s, color: c } : s));
    onChange(next, angle);
  };

  return (
    <div className="space-y-3">
      <div
        className="h-10 rounded-md border border-border-default"
        style={{ backgroundImage: gradientCss(stops, angle, 'linear') }}
      />
      <div className="flex items-center gap-2">
        {stops.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`w-8 h-8 rounded-md border-2 ${activeIdx === i ? 'border-norte-primary' : 'border-border-default'}`}
            style={{ background: s.color }}
            title={`Stop ${i + 1}`}
          />
        ))}
      </div>
      <ColorPicker color={stops[activeIdx]?.color || '#000000'} onChange={(c) => update(activeIdx, c)} />
      <div>
        <div className="text-xs text-text-muted mb-1 flex items-center justify-between">
          <span>Angle</span>
          <span className="font-mono">{angle}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={360}
          value={angle}
          onChange={(e) => onChange(stops, Number(e.target.value))}
        />
      </div>
    </div>
  );
}
