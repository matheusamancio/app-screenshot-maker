'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

interface Props {
  color: string;
  onChange: (c: string) => void;
  label?: string;
}

export default function ColorPicker({ color, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-9 px-2 bg-overlay border border-border-default rounded-md flex items-center gap-2 text-sm text-secondary hover:border-border-strong"
      >
        <span
          className="w-5 h-5 rounded border border-border-default"
          style={{ background: color }}
        />
        <span className="font-mono text-xs uppercase">{color.replace('#', '')}</span>
        {label && <span className="ml-auto text-text-muted text-xs">{label}</span>}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 right-0 bg-surface border border-border-default rounded-md shadow-lg p-3 fade-in">
          <HexColorPicker color={color} onChange={onChange} />
          <HexColorInput
            color={color}
            onChange={onChange}
            prefixed
            className="mt-3 w-full h-8 px-2 bg-overlay border border-border-default rounded-md text-sm font-mono uppercase outline-none"
          />
        </div>
      )}
    </div>
  );
}
