'use client';

import React from 'react';

interface Props {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
  suffix?: string;
}

export default function Slider({ value, min, max, step = 1, onChange, label, suffix = '' }: Props) {
  return (
    <div>
      {label && (
        <div className="text-xs text-text-muted mb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="font-mono">
            {value}
            {suffix}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
